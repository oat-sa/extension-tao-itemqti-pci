/* eslint-disable func-names */
define([
    'jquery',
    'lodash',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/audioRecordingInteractionIMS/data/qti.json'
], function (
    $,
    _,
    assetManagerFactory,
    assetStrategies,
    portableAssetStrategy,
    qtiItemRunner,
    ciRegistry,
    pciTestProvider,
    itemData
) {
    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    function getAssetManager(baseUrl) {
        return assetManagerFactory([assetStrategies.external, assetStrategies.baseUrl, portableAssetStrategy], {
            baseUrl: baseUrl || ''
        });
    }

    //Manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'audioRecordingInteraction',
        'qtiItemPci/pciCreator/ims/audioRecordingInteraction/imsPciCreator.json'
    );
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    const itemDataWithAutostart = _.cloneDeep(itemData);
    itemDataWithAutostart.body.elements.interaction_imsportablecustominteraction_6259311e76730032931440.attributes.class =
        'sequential';
    Object.assign(
        itemDataWithAutostart.body.elements.interaction_imsportablecustominteraction_6259311e76730032931440.properties,
        {
            autoStart: 'true',
            allowPlayback: '',
            hideRecordButton: 'true',
            hideStopButton: 'true',
            playSound: 'true',
            delayMinutes: '0',
            delaySeconds: '7',
            maxRecordingTime: '4',
            maxRecords: '1',
            enableDomEvents: 'true'
        }
    );

    QUnit.module('Audio Recording Interaction', {
        afterEach: function () {
            if (runner) {
                runner.clear();
            }
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
                        isReviewMode: false,
                        allowPlayback: true,
                        autoStart: false,
                        autoPlayback: false,
                        hideRecordButton: false,
                        hideStopButton: false,
                        playSound: false,
                        delaySeconds: 0,
                        delayMinutes: 0,
                        maxRecords: 2,
                        maxRecordingTime: 120,
                        isCompressed: true,
                        audioBitrate: 20000,
                        isStereo: false,
                        media: {
                            autostart: 'true',
                            replayTimeout: '5',
                            maxPlays: '2',
                            loop: '',
                            pause: '',
                            uri: '',
                            type: '',
                            height: '270',
                            width: '480'
                        },
                        displayDownloadLink: false,
                        updateResponsePartially: true,
                        partialUpdateInterval: 1000,
                        enableDomEvents: false
                    };

                    assert.equal(
                        interaction.typeIdentifier,
                        'audioRecordingInteraction',
                        'The expected interaction is created'
                    );
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
                    assert.equal(
                        $container.children('.qti-item').length,
                        1,
                        'the container contains a the root element .qti-item'
                    );
                    assert.equal(
                        $container.find('.qti-interaction').length,
                        1,
                        'the container contains an interaction .qti-interaction'
                    );
                    assert.equal(
                        $container.find('.qti-interaction.qti-customInteraction').length,
                        1,
                        'the container contains a custom interaction'
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .audioRecordingInteraction').length,
                        1,
                        'the container contains an audio recording interaction'
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .prompt').length,
                        0,
                        "the interaction doesn't contain a prompt"
                    );
                    assert.equal(
                        $container.find("[data-identifier='record']").length,
                        1,
                        'the interaction contains record button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='reset']").length,
                        1,
                        'the interaction contains reset button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='play']").length,
                        1,
                        'the interaction contains play button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='stop']").length,
                        1,
                        'the interaction contains stop button'
                    );

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
            newItemData.body.elements.interaction_imsportablecustominteraction_6259311e76730032931440.properties.isReviewMode =
                'true';

            runner = qtiItemRunner('qti', newItemData)
                .on('render', function () {
                    assert.equal($container.children().length, 1, 'the container a elements');
                    assert.equal(
                        $container.children('.qti-item').length,
                        1,
                        'the container contains a the root element .qti-item'
                    );
                    assert.equal(
                        $container.find('.qti-interaction').length,
                        1,
                        'the container contains an interaction .qti-interaction'
                    );
                    assert.equal(
                        $container.find('.qti-interaction.qti-customInteraction').length,
                        1,
                        'the container contains a custom interaction'
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .audioRecordingInteraction').length,
                        1,
                        'the container contains an audio recording interaction in review mode'
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .prompt').length,
                        0,
                        "the interaction doesn't contain a prompt"
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .controls').length,
                        1,
                        'the interaction contains controls'
                    );
                    assert.equal(
                        $container.find("[data-identifier='record']").length,
                        0,
                        'the interaction does not contain record button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='reset']").length,
                        0,
                        'the interaction does not contain reset button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='play']").length,
                        1,
                        'the interaction does contain play button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='stop']").length,
                        1,
                        'the interaction does contain stop button'
                    );
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

                    assert.equal(interactions.length, 1, 'one interaction');
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

                    assert.equal(interactions.length, 1, 'one interaction');
                    interaction = interactions[0];

                    //Set the response
                    interaction.setResponse(response);
                })
                .on('responsechange', function (res) {
                    changeCounter++;
                    if (changeCounter === 1) {
                        // So it runs only once
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

    QUnit.cases
        .init([
            {
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
                        base: {
                            file: {
                                name: 'myFileToBeReseted',
                                mime: 'audio/wav',
                                data: 'YmFzZTY0ZW5jb2RlZERhdGE='
                            }
                        }
                    }
                }
            },
            {
                title: 'state as a serialized response',
                state: {
                    RESPONSE: {
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
                },
                response: {
                    RESPONSE: {
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
        ])
        .test('set and get state ', function (data, assert) {
            var ready = assert.async();
            var changeCounter = 0;
            var $container = $('#' + fixtureContainerId);
            assert.equal($container.length, 1, 'the item container exists');
            assert.equal($container.children().length, 0, 'the container has no children');

            if (supportsMediaRecorder()) {
                runner = qtiItemRunner('qti', itemData)
                    .on('render', function () {
                        assert.deepEqual(this.getState(), data.response, 'state set/get ok');
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

    QUnit.module('Audio Recording Interaction: sequential, hidden controls, autostart after delay', {
        afterEach: function () {
            if (runner) {
                runner.clear();
            }
        }
    });

    QUnit.test('initializes correctly', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemDataWithAutostart)
                .on('render', function () {
                    var interaction = this._item.getInteractions()[0];
                    var config = {
                        isReviewMode: false,
                        allowPlayback: false,
                        autoStart: true,
                        autoPlayback: false,
                        hideRecordButton: true,
                        hideStopButton: true,
                        playSound: true,
                        delaySeconds: 7,
                        delayMinutes: 0,
                        maxRecords: 1,
                        maxRecordingTime: 4,
                        isCompressed: true,
                        audioBitrate: 20000,
                        isStereo: false,
                        media: {
                            autostart: 'true',
                            replayTimeout: '5',
                            maxPlays: '2',
                            loop: '',
                            pause: '',
                            uri: '',
                            type: '',
                            height: '270',
                            width: '480'
                        },
                        displayDownloadLink: false,
                        updateResponsePartially: true,
                        partialUpdateInterval: 1000,
                        enableDomEvents: true
                    };

                    assert.equal(
                        interaction.typeIdentifier,
                        'audioRecordingInteraction',
                        'The expected interaction is created'
                    );
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

    QUnit.test('renders correctly', function (assert) {
        var ready = assert.async();

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemDataWithAutostart)
                .on('render', function () {
                    assert.equal(
                        $container.find('.qti-customInteraction .audioRecordingInteraction').length,
                        1,
                        'the container contains an audio recording interaction'
                    );
                    assert.equal(
                        $container.find("[data-identifier='record']").length,
                        0,
                        "the interaction doesn't contain record button"
                    );
                    assert.equal(
                        $container.find("[data-identifier='reset']").length,
                        0,
                        "the interaction doesn't contain reset button"
                    );
                    assert.equal(
                        $container.find("[data-identifier='play']").length,
                        0,
                        "the interaction doesn't contain play button"
                    );
                    assert.equal(
                        $container.find("[data-identifier='stop']").length,
                        0,
                        "the interaction doesn't contain stop button"
                    );

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
        const ready = assert.async();

        const $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            const newItemData = _.cloneDeep(itemDataWithAutostart);
            newItemData.body.elements.interaction_imsportablecustominteraction_6259311e76730032931440.properties.isReviewMode =
                'true';

            runner = qtiItemRunner('qti', newItemData)
                .on('render', function () {
                    assert.equal(
                        $container.find('.qti-customInteraction .audioRecordingInteraction').length,
                        1,
                        'the container contains an audio recording interaction in review mode'
                    );
                    assert.equal(
                        $container.find('.qti-customInteraction .controls').length,
                        1,
                        'the interaction contains controls'
                    );
                    assert.equal(
                        $container.find("[data-identifier='record']").length,
                        0,
                        'the interaction does not contain record button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='reset']").length,
                        0,
                        'the interaction does not contain reset button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='play']").length,
                        1,
                        'the interaction does contain play button'
                    );
                    assert.equal(
                        $container.find("[data-identifier='stop']").length,
                        1,
                        'the interaction does contain stop button'
                    );

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

    QUnit.test('destroys', function (assert) {
        var ready = assert.async();
        var $container = $('#' + fixtureContainerId);

        assert.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemDataWithAutostart)
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

    QUnit.module('Visual test');

    QUnit.test('display and play', function (assert) {
        var ready = assert.async();
        var $container = $('#outside-container');
        var assetManager = getAssetManager('/qtiItemPci/views/js/pciCreator/ims/audioRecordingInteraction/');

        var interaction;

        var $form = $('#form');
        $form.on('change', function (e) {
            var $target = $(e.target),
                newConfig = {};
            if (interaction) {
                if ($target.attr('name') === 'configWithAutostart') {
                    newConfig = {
                        autoStart: 'true',
                        allowPlayback: '',
                        hideRecordButton: 'true',
                        hideStopButton: 'true',
                        playSound: 'true',
                        delayMinutes: '0',
                        delaySeconds: '7',
                        maxRecordingTime: '4',
                        maxRecords: '1'
                    };
                } else {
                    newConfig[$target.attr('name')] = $target.is(':checked');
                }
                interaction.triggerPci('configChange', [Object.assign(interaction.properties, newConfig)]);
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

                    $container.on('interactiontrace', ({ originalEvent }) => {
                        $('#log-display').append(`<p>${JSON.stringify(originalEvent.detail, null, 2)}</p>`);
                    });
                })
                .on('responsechange', function (response) {
                    if (
                        response &&
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
