define([
    'jquery',
    'lodash',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'audioRecordingInteraction/runtime/js/player',
    'audioRecordingInteraction/runtime/js/recorder',
    'json!qtiItemPci/test/audioRecordingInteraction/data/qti.json'
], function (
    $,
    _,
    assetManagerFactory,
    assetStrategies,
    portableAssetStrategy,
    qtiItemRunner,
    ciRegistry,
    pciTestProvider,
    playerFactory,
    recorderFactory,
    itemData
) {
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    function getAssetManager(baseUrl) {
        return assetManagerFactory([
            assetStrategies.external,
            assetStrategies.baseUrl,
            portableAssetStrategy
        ], { baseUrl: baseUrl || '' });
    }

    //Manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'audioRecordingInteraction',
        'qtiItemPci/pciCreator/dev/audioRecordingInteraction/pciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    function createFakeAudioConstructor() {
        var instances = [];

        function FakeAudio(src) {
            this.src = src || '';
            this.currentSrc = this.src;
            this.currentTime = 0;
            this.duration = 1;
            this.muted = false;
            this.readyState = 0;
            this.networkState = 0;
            this.error = null;
            this.loadCalls = 0;
            this.playCalls = 0;
            this.pauseCalls = 0;
            instances.push(this);
        }

        FakeAudio.instances = instances;

        FakeAudio.prototype.load = function load() {
            this.loadCalls++;
            this.currentSrc = this.src;
            if (typeof this.oncanplay === 'function') {
                this.oncanplay();
            }
        };

        FakeAudio.prototype.play = function play() {
            this.playCalls++;
            if (typeof this.onplaying === 'function') {
                this.onplaying();
            }
            return Promise.resolve();
        };

        FakeAudio.prototype.pause = function pause() {
            this.pauseCalls++;
        };

        FakeAudio.prototype.removeAttribute = function removeAttribute(attributeName) {
            if (attributeName === 'src') {
                this.src = '';
            }
        };

        return FakeAudio;
    }

    function createPlayRejectingAudioConstructor(errorName) {
        var FakeAudio = createFakeAudioConstructor();

        FakeAudio.prototype.play = function play() {
            this.playCalls++;
            return Promise.reject({
                name: errorName
            });
        };

        return FakeAudio;
    }

    function overrideNavigatorProperties(properties) {
        var target = window.navigator;
        var prototype = Object.getPrototypeOf(window.navigator);
        var restorers = [];

        _.forEach(properties, function (value, propertyName) {
            var descriptor = Object.getOwnPropertyDescriptor(target, propertyName);
            var descriptorTarget = target;

            if (!(descriptor && descriptor.configurable)) {
                descriptorTarget = prototype;
                descriptor = Object.getOwnPropertyDescriptor(descriptorTarget, propertyName);
            }

            Object.defineProperty(descriptorTarget, propertyName, {
                value: value,
                configurable: true
            });

            restorers.push(function restoreProperty() {
                if (descriptor) {
                    Object.defineProperty(descriptorTarget, propertyName, descriptor);
                } else {
                    delete descriptorTarget[propertyName];
                }
            });
        });

        return function restoreNavigatorProperties() {
            _.forEach(restorers, function (restoreProperty) {
                restoreProperty();
            });
        };
    }

    QUnit.module('Audio Recording Interaction Player', {
        beforeEach: function () {
            this.originalAudio = window.Audio;
            this.originalUrl = window.URL;
        },
        afterEach: function () {
            window.Audio = this.originalAudio;
            window.URL = this.originalUrl;
            $('.modal').remove();
        }
    });

    QUnit.test('reuses the same audio element when reloading media', function (assert) {
        var FakeAudio = createFakeAudioConstructor();
        var player = playerFactory();

        window.Audio = FakeAudio;

        player.load('blob:first');
        player.load('blob:second');

        assert.equal(FakeAudio.instances.length, 1, 'one audio element is reused across loads');
        assert.equal(FakeAudio.instances[0].src, 'blob:second', 'the player updates the existing element source');
        assert.equal(FakeAudio.instances[0].loadCalls, 2, 'the existing audio element is reloaded for each source');
    });

    QUnit.test('keeps the autoplay-enabled audio element for later playback', function (assert) {
        var done = assert.async();
        var FakeAudio = createFakeAudioConstructor();
        var player = playerFactory();

        window.Audio = FakeAudio;

        player.enableAutoplay().then(function () {
            player.unload();
            player.load('blob:recording');

            assert.equal(FakeAudio.instances.length, 1, 'autoplay enabling and playback share the same audio element');
            assert.ok(player.isAutoplayEnabled(), 'the player reports autoplay as enabled');
            assert.equal(FakeAudio.instances[0].src, 'blob:recording', 'the autoplay-enabled element is reused for the recorded media');
            done();
        });
    });

    QUnit.test('revokes owned object urls when media is replaced or unloaded', function (assert) {
        var FakeAudio = createFakeAudioConstructor();
        var player = playerFactory();
        var revokedUrls = [];

        window.Audio = FakeAudio;
        window.URL = {
            revokeObjectURL: function revokeObjectURL(url) {
                revokedUrls.push(url);
            }
        };

        player.load('blob:first', { ownsUrl: true });
        player.load('blob:second', { ownsUrl: true });
        player.unload();

        assert.deepEqual(revokedUrls, ['blob:first', 'blob:second'], 'owned blob urls are revoked when replaced and unloaded');
    });

    QUnit.test('shows the autoplay warning only for NotAllowedError', function (assert) {
        var done = assert.async();
        var FakeAudio = createPlayRejectingAudioConstructor('NotAllowedError');
        var player = playerFactory();
        var message;

        window.Audio = FakeAudio;

        player.load('blob:first');
        player.play(function () {
            message = $('.modal .message').text();
            assert.equal(message, 'Your browser blocked auto-play. Press Play to listen to your recording.', 'autoplay warning is reserved for policy rejections');
            done();
        });
    });

    QUnit.test('shows a playback support error for non-policy failures', function (assert) {
        var done = assert.async();
        var FakeAudio = createPlayRejectingAudioConstructor('NotSupportedError');
        var player = playerFactory();
        var message;

        window.Audio = FakeAudio;

        player.load('blob:first');
        player.play(function () {
            message = $('.modal .message').text();
            assert.equal(message, 'Your recording could not be played back in this browser.', 'playback support errors use a different message');
            done();
        });
    });

    QUnit.module('Audio Recording Interaction Recorder Provider Selection', {
        beforeEach: function () {
            this.restoreUserAgent = function () {};
        },
        afterEach: function () {
            this.restoreUserAgent();
        }
    });

    QUnit.test('uses WebAudio recording on iOS even when compression is enabled', function (assert) {
        var recorder;

        this.restoreUserAgent = overrideNavigatorProperties({
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
            platform: 'iPad',
            maxTouchPoints: 5
        });

        recorder = recorderFactory({
            isCompressed: true,
            maxRecordingTime: 120
        }, {
            resolve: function resolve(assetPath) {
                return assetPath;
            }
        });

        assert.equal(recorder.getProviderType(), 'webAudio', 'iOS recording falls back to wav/webAudio');
    });

    QUnit.test('uses WebAudio recording for iPadOS desktop user agents', function (assert) {
        var recorder;

        this.restoreUserAgent = overrideNavigatorProperties({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
            platform: 'MacIntel',
            maxTouchPoints: 5
        });

        recorder = recorderFactory({
            isCompressed: true,
            maxRecordingTime: 120
        }, {
            resolve: function resolve(assetPath) {
                return assetPath;
            }
        });

        assert.equal(recorder.getProviderType(), 'webAudio', 'iPadOS desktop UA still falls back to wav/webAudio');
    });

    QUnit.test('keeps MediaRecorder recording on non-iOS browsers', function (assert) {
        var recorder;

        this.restoreUserAgent = overrideNavigatorProperties({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
            platform: 'MacIntel',
            maxTouchPoints: 0
        });

        recorder = recorderFactory({
            isCompressed: true,
            maxRecordingTime: 120
        }, {
            resolve: function resolve(assetPath) {
                return assetPath;
            }
        });

        assert.equal(recorder.getProviderType(), 'mediaRecorder', 'Mac Safari keeps the compressed recorder path');
    });

    QUnit.module('Audio Recording Interaction', {
        afterEach: function (assert) {
            if (runner) {
                runner.clear();
            }
        }
    });

    /* */

    QUnit.cases
        .init([
            {
                title: 'respects recordsAttempts when max reached',
                itemData: itemData,
                state: {
                    RESPONSE: {
                        response: { base: null },
                        recordsAttempts: 2
                    }
                },
                expected: {
                    RESPONSE: {
                        response: { base: null },
                        recordsAttempts: 2
                    }
                }
            },
            {
                title: 'respects recordsAttempts when attempts remain',
                itemData: (function () {
                    var newItemData = _.cloneDeep(itemData);
                    newItemData.body.elements.interaction_portablecustominteraction_5a61fdb9cb6a7534654927.properties.maxRecords = '3';
                    return newItemData;
                })(),
                state: {
                    RESPONSE: {
                        response: { base: null },
                        recordsAttempts: 1
                    }
                },
                expected: {
                    RESPONSE: {
                        response: { base: null },
                        recordsAttempts: 1
                    }
                }
            }
        ])
        .test('recordsAttempts state behavior', function (data, assert) {
            var ready = assert.async();
            var $container = $('#' + fixtureContainerId);
            assert.equal($container.length, 1, 'the item container exists');
            assert.equal($container.children().length, 0, 'the container has no children');

            if (supportsMediaRecorder()) {
                runner = qtiItemRunner('qti', data.itemData)
                    .on('render', function () {
                        assert.deepEqual(this.getState(), data.expected, 'state contains recordsAttempts');
                        ready();
                    })
                    .init()
                    .render($container, { state: data.state });
            }

            function supportsMediaRecorder() {
                if (!window.MediaRecorder) {
                    assert.ok(true, 'skipping test...');
                    ready();
                    return false;
                }
                return true;
            }
        });

    /* */

    QUnit.test('initializes correctly', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {
                    var interaction = this._item.getInteractions()[0];
                    var config = {
                        'isReviewMode': false,
                        'allowPlayback': true,
                        'autoStart': false,
                        'autoPlayback': false,
                        'delaySeconds': 0,
                        'delayMinutes': 0,
                        'maxRecords': 0,
                        'maxRecordingTime': 400,
                        'isCompressed': true,
                        'audioBitrate': 20000,
                        'isStereo': false,
                        'useMediaStimulus': false,
                        'media': {
                            'autostart': 'true',
                            'replayTimeout': '5',
                            'maxPlays': '2',
                            'loop': '',
                            'pause': '',
                            'uri': '',
                            'type': '',
                            'height': '270',
                            'width': '480'
                        },
                        'displayDownloadLink': true,
                        'updateResponsePartially': true,
                        'partialUpdateInterval': 1000
                    };

                    assert.equal(interaction.typeIdentifier, 'audioRecordingInteraction', 'The expected interaction is created');
                    assert.equal(typeof interaction.metaData, 'object', 'Meta data object is defined');
                    assert.equal(typeof interaction.metaData.pci, 'object', 'PCI object is defined');
                    assert.deepEqual(interaction.metaData.pci.config, config, 'The expected config has been set');

                    ready();
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.test('renders correctly', function (assert) {
        var ready = assert.async();

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {

                    assert.equal($container.children().length, 1, 'the container a elements');
                    assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                    assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                    assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                    assert.equal($container.find('.qti-customInteraction .audioRecordingInteraction').length, 1, 'the container contains an audio recording interaction');
                    assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');
                    assert.equal($container.find('[data-identifier=\'record\']').length, 1, 'the interaction contains record button');
                    assert.equal($container.find('[data-identifier=\'reset\']').length, 1, 'the interaction contains reset button');
                    assert.equal($container.find('[data-identifier=\'play\']').length, 1, 'the interaction contains play button');
                    assert.equal($container.find('[data-identifier=\'stop\']').length, 1, 'the interaction contains stop button');

                    ready();
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    QUnit.test('renders correctly in review mode', function (assert) {
        var ready = assert.async();

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            var newItemData = _.cloneDeep(itemData);
            newItemData.body.elements.interaction_portablecustominteraction_5a61fdb9cb6a7534654927.properties.isReviewMode = 'true';

            runner = qtiItemRunner('qti', newItemData)
                .on('render', function () {

                    assert.equal($container.children().length, 1, 'the container a elements');
                    assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                    assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                    assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                    assert.equal($container.find('.qti-customInteraction .audioRecordingInteraction').length, 1, 'the container contains an audio recording interaction in review mode');
                    assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');
                    assert.equal($container.find('.qti-customInteraction .controls').length, 1, 'the interaction contains controls');
                    assert.equal($container.find('[data-identifier=\'record\']').length, 0, 'the interaction does not contain record button');
                    assert.equal($container.find('[data-identifier=\'reset\']').length, 0, 'the interaction does not contain reset button');
                    assert.equal($container.find('[data-identifier=\'play\']').length, 1, 'the interaction does contain play button');
                    assert.equal($container.find('[data-identifier=\'stop\']').length, 1, 'the interaction does contain stop button');
                    ready();
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.test('destroys', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);

        assert.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {
                    var $controls;

                    //Call destroy manually
                    var interaction = this._item.getInteractions()[0];
                    interaction.renderer.destroy(interaction);

                    $controls = $('.audiorec-control', $container);
                    assert.equal($controls.length, 0, 'recorder has been destroyed');

                    try {
                        interaction.renderer.destroy(interaction);
                    } catch (e) {
                        console.log(e);
                    }

                    ready();
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
            // runner.getState();
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.test('resets the response', function (assert) {
        var ready = assert.async();
        var changeCounter = 0;
        var response = {
            base: {
                file: {
                    name: 'myFileToBeReseted',
                    mime: 'audio/wav',
                    data: 'YXVkaW8='
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');
        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {
                    var interaction,
                        interactions = this._item.getInteractions();

                    assert.equal(_.size(interactions), 1, 'one interaction');
                    interaction = interactions[0];

                    // First we set the response
                    interaction.setResponse(response);
                })
                .on('responsechange', function (res) {
                    var interactions = this._item.getInteractions(),
                        interaction = interactions[0];
                    changeCounter++;

                    if (changeCounter === 1) {
                        interaction.resetResponse();
                    } else if (changeCounter === 2) {
                        assert.ok(_.isPlainObject(res), 'response changed');
                        assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                        assert.strictEqual(res.RESPONSE.base, null, 'no response is given when there is no recording');
                        ready();
                    }
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.test('set and get response', function (assert) {
        var ready = assert.async();
        var changeCounter = 0;
        var response = {
            base: {
                file: {
                    name: 'myFileToBeReseted',
                    mime: 'audio/wav',
                    data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {
                    var interaction,
                        interactions = this._item.getInteractions();

                    assert.equal(_.size(interactions), 1, 'one interaction');
                    interaction = interactions[0];

                    //Set the response
                    interaction.setResponse(response);
                })
                .on('responsechange', function (res) {
                    changeCounter++;
                    if (changeCounter === 1) { // So it runs only once
                        assert.ok(_.isPlainObject(res), 'response changed');
                        assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                        assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                        ready();
                    }
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.cases.init([{
        title: 'state as a response',
        state: {
            RESPONSE: {
                base: {
                    file: {
                        name: 'myFileToBeReseted',
                        mime: 'audio/wav',
                        data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                    }
                }
            }
        },
        response: {
            RESPONSE: {
                recordsAttempts: 0,
                response: {
                    base: {
                        file: {
                            name: 'myFileToBeReseted',
                            mime: 'audio/wav',
                            data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                        }
                    }
                }
            }
        }
    }, {
        title: 'state as a serialized response',
        state: {
            RESPONSE: {
                base: {
                    file: {
                        name: 'myFileToBeReseted',
                        mime: 'audio/wav',
                        data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                    }
                }
            }
        },
        response: {
            RESPONSE: {
                recordsAttempts: 0,
                response: {
                    base: {
                        file: {
                            name: 'myFileToBeReseted',
                            mime: 'audio/wav',
                            data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                        }
                    }
                }
            }
        }
    }]).test('set and get state ', function (data, assert) {
        var ready = assert.async();
        var changeCounter = 0;
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function () {

                    this.setState(data.state);
                    assert.deepEqual(this.getState(), data.response, 'state set/get ok');
                })
                .on('responsechange', function (res) {
                    changeCounter++;
                    if (changeCounter === 1) { // So it runs only once
                        assert.ok(_.isPlainObject(res), 'response changed');
                        assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                        assert.deepEqual(res, data.state, 'response set/get ok');

                        ready();
                    }
                })
                .init()
                .render($container);
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

    QUnit.module('Visual test');

    QUnit.test('display and play', function (assert) {
        var ready = assert.async();
        var $container = $('#outside-container');
        var assetManager = getAssetManager('/qtiItemPci/views/js/pciCreator/dev/audioRecordingInteraction/');

        var interaction;

        var $form = $('#form');
        $form.on('change', function (e) {
            var $target = $(e.target),
                newConfig = {};
            if (interaction) {
                newConfig[$target.attr('name')] = $target.is(':checked');
                interaction.triggerPci('configChange', [_.assign(interaction.properties, newConfig)]);
            }
        });

        if (supportsMediaRecorder()) {
            assert.expect(1);
            assert.equal($container.length, 1, 'the item container exists');
            runner = qtiItemRunner('qti', itemData, { assetManager: assetManager })
                .on('render', function () {
                    var interactions = this._item.getInteractions();
                    interaction = interactions[0];

                    ready();
                })
                .on('responsechange', function (response) {
                    if (response &&
                        response.RESPONSE &&
                        response.RESPONSE.base &&
                        response.RESPONSE.base.file &&
                        response.RESPONSE.base.file.data
                    ) {
                        response.RESPONSE.base.file.data = 'DATA'; // Do not display the base64-encoded file!
                    }
                    $('#response-display').html(JSON.stringify(response, null, 2));
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container.find('#pci'));
        }

        function supportsMediaRecorder() {
            if (!window.MediaRecorder) {
                assert.ok(true, 'skipping test...');
                ready();
                return false;
            }
            return true;
        }
    });

    /* */

});
