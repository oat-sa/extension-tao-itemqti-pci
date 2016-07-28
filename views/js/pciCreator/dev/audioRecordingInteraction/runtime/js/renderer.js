define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/html',
    'OAT/util/event',
    'tpl!audioRecordingInteraction/runtime/tpl/control'
], function(
    $,
    _,
    html,
    event,
    controlTpl
) {
    'use strict';

    //todo: check licence or rewrite
    //fixme: doesn't work on chrome?
    // MediaDevices.getUserMedia polyfill
    // https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/
    // Mozilla Public License, version 2.0
    (function setGetUserMedia() {

        var promisifiedOldGUM = function(constraints) {

            // First get ahold of getUserMedia, if present
            var getUserMedia = (navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia);

            // Some browsers just don't implement it - return a rejected promise with an error
            // to keep a consistent interface
            if(!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
            return new Promise(function(successCallback, errorCallback) {
                getUserMedia.call(navigator, constraints, successCallback, errorCallback);
            });

        };

        // Older browsers might not implement mediaDevices at all, so we set an empty object first
        if(navigator.mediaDevices === 'undefined') {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if(navigator.mediaDevices.getUserMedia === 'undefined') {
            navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
        }
    }());


    /**
     * @property {String} CREATED   - player instance created, but no media loaded
     * @property {String} IDLE      - media loaded and playable
     * @property {String} PLAYING   - media is playing
     */
    var playerStates = {
        CREATED:    'created',
        IDLE:       'idle',
        PLAYING:    'playing'
    };

    /**
     * todo: jsdoc
     */
    function playerFactory() {
        var audioEl,
            player,
            state = playerStates.CREATED;

        player = {
            _setState: function(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(newState);
            },

            getState: function() {
                return state;
            },

            load: function(url) {
                var self = this;

                audioEl = new Audio(url);

                // when playback is stopped by user or when the media is loaded:
                audioEl.oncanplay = function() {
                    self._setState(playerStates.IDLE);
                };

                // when playbacks ends on its own:
                audioEl.onended = function() {
                    self._setState(playerStates.IDLE);
                };
            },

            play: function() {
                audioEl.play();
                this._setState(playerStates.PLAYING);
            },

            stop: function() {
                audioEl.pause();
                audioEl.currentTime = 0;
                // state change is triggered by the oncanplay listener
            },

            unload: function() {
                audioEl = null;
                this._setState(playerStates.CREATED);
            }
        };
        event.addEventMgr(player);

        return player;
    }


    /**
     * @property {String} CREATED   - recorder instance created, but not not initialized
     * @property {String} IDLE      - ready to record
     * @property {String} RECORDING - record is in progress
     */
    var recorderStates = {
        CREATED:    'created',
        IDLE:       'idle',
        RECORDING:  'recording'
    };

    /**
     * todo: jsdoc
     */
    function recorderFactory(config) {
        var MediaRecorder = window.MediaRecorder,
            mediaRecorder,
            recorder,
            recorderOptions = {
                audioBitsPerSecond: config.audioBitrate
            },
            state = recorderStates.CREATED;

        if (typeof MediaRecorder === 'undefined') {
            throw new Error('MediaRecorder API not supported. Please use a compatible browser');
        }

        // Prefered encoding format order:
        // webm/opus, ogg/opus, webm, ogg, default
        if (typeof MediaRecorder.isTypeSupported === 'function') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                recorderOptions.mimeType = 'audio/webm;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
                recorderOptions.mimeType = 'audio/ogg;codecs=opus';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                recorderOptions.mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
                recorderOptions.mimeType = 'audio/ogg';
            }
        }

        recorder = {
            _setState: function(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(newState);
            },

            getState: function() {
                return state;
            },

            init: function() {
                var self = this;
                return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        mediaRecorder = new MediaRecorder(stream, recorderOptions);
                        if (mediaRecorder.state === 'inactive') {
                            self._setState(recorderStates.IDLE);

                            mediaRecorder.ondataavailable = function (e) {
                                //todo: check what is the best way to handle this: little chunks or a big chunk at once
                                self.trigger('recordingavailable', [e]);
                            };
                        } else {
                            return new Error('cannot initialize MediaRecorder');
                        }
                    })
                    .catch(function(err) {
                        throw err;
                    });
            },

            start: function() {
                mediaRecorder.start();
                this._setState(recorderStates.RECORDING);
            },

            stop: function() {
                mediaRecorder.stop();
                this._setState(recorderStates.IDLE);
            }
        };
        event.addEventMgr(recorder);

        return recorder;
    }


    /**
     * todo: jsdoc
     */
    function controlFactory(config) {
        var state,
            $control = $(controlTpl({
                id: config.id,
                label: config.label
            })),
            controlStates = {
                DISABLED: 'disabled',
                ENABLED: 'enabled',
                ACTIVE: 'active'
            };

        $control.on('click', function() {
            if (state === controlStates.ENABLED) {
                config.onclick();
            }
        });
        if (config.display === true) {
            $control.appendTo(config.container);
        }
        setState(config.defaultState || controlStates.DISABLED);

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        return {
            enable: function() {
                setState(controlStates.ENABLED);
            },
            disable: function() {
                setState(controlStates.DISABLED);
            },
            activate: function() {
                setState(controlStates.ACTIVE);
            },
            updateState: function() {
                config.updateState.call(this);
            }
        };
    }

    function updateControlsState(controls) {
        var control;
        for (control in controls) {
            if (controls.hasOwnProperty(control)) {
                controls[control].updateState();
            }
        }
    }


    /**
     * todo: jsdoc
     */
    return function(id, container, config) {

        // recording as file { mime, data, name }
        var _recording = null;
        var filePrefix = 'audioRecording';

        var $container = $(container);

        var controls = {},
            $controlsContainer = $container.find('.audioRec > .controls'),
            updateControls = updateControlsState.bind(null, controls);

        var options = _.defaults(config, {
            audioBitrate: 20000,
            allowPlayback: true,
            autostart: false,
            maxRecords: -1,
            maxRecordingTime: 10,
            displayDownloadLink: true // for debugging purposes only
        });

        var player = playerFactory();
        var recorder = recorderFactory(options);

        recorder.on('recordingavailable', function(e) {
            var recording = e.data,
                recordingUrl = window.URL.createObjectURL(recording);

            player.load(recordingUrl);
            createBase64Recoding(recording);
        });

        recorder.on('statechange', function() {
            updateControls();
        });

        player.on('statechange', function() {
            updateControls();
        });

        function startRecording() {
            function effectiveStart() {
                recorder.start();
                updateControls();
            }
            if (recorder.getState() === recorderStates.CREATED) {
                recorder.init().then(function() {
                    effectiveStart();
                });
            } else {
                effectiveStart();
            }
        }

        function stopRecordingOrPlayback() {
            if (recorder.getState() === recorderStates.RECORDING) {
                recorder.stop();

            } else if (player.getState() === playerStates.PLAYING) {
                player.stop();
            }
            updateControls();
        }

        function playRecording() {
            player.play();
            updateControls();
        }

        function resetRecording() {
            player.unload();
            setRecording(null);
            updateControls();
        }

        function createBase64Recoding(blob) {
            //todo: implement a spinner or something to feedback that work is in progress while this is happening
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function onLoadEnd(e) {
                var filename =
                    filePrefix + '_' +
                    window.Date.now() + '.' +
                    blob.type.split('/')[1];

                var base64Raw = e.target.result;
                var commaPosition = base64Raw.indexOf(',');
                var base64Data = base64Raw.substring(commaPosition + 1);

                setRecording({
                    mime: blob.type,
                    name: filename,
                    data: base64Data
                });
            };
        }

        function setRecording(recording) {
            _recording = recording;
        }

        function createDownloadLink(url) {
            var downloadLink = document.createElement('a');
            document.body.appendChild(downloadLink);
            downloadLink.text = 'download ';
            downloadLink.download = ' filename ' + Date.now();
            downloadLink.href = url;
        }

        function createControls() {
            controls.record = controlFactory({
                id: 'record',
                label: 'Record',
                defaultState: 'enabled',
                display: true,
                container: $controlsContainer,
                onclick: function onclick() {
                    startRecording();
                },
                updateState: function updateState() {
                    if (player.getState() === playerStates.CREATED) {
                        if (recorder.getState() === recorderStates.RECORDING) {
                            this.activate();
                        } else {
                            this.enable();
                        }
                    } else {
                        this.disable();
                    }
                }
            });

            controls.stop = controlFactory({
                id: 'stop',
                label: 'Stop',
                defaultState: 'disabled',
                display: true,
                container: $controlsContainer,
                onclick: function onclick() {
                    stopRecordingOrPlayback();
                },
                updateState: function updateState() {
                    if (player.getState() === playerStates.PLAYING ||
                        recorder.getState() === recorderStates.RECORDING) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }
            });

            controls.play = controlFactory({
                id: 'play',
                label: 'Play',
                defaultState: 'disabled',
                display: true,
                container: $controlsContainer,
                onclick: function onclick() {
                    playRecording();
                },
                updateState: function updateState() {
                    switch (player.getState()) {
                    case playerStates.IDLE: this.enable(); break;
                    case playerStates.PLAYING: this.activate(); break;
                    default: this.disable(); break;
                    }
                }
            });

            controls.reset = controlFactory({
                id: 'reset',
                label: 'Reset',
                defaultState: 'disabled',
                display: true,
                container: $controlsContainer,
                onclick: function onclick() {
                    resetRecording();
                },
                updateState: function updateState() {
                    if (player.getState() === playerStates.IDLE) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }
            });
        }


        var renderer = {
            getRecording: function() {
                return _recording;
            },

            setRecording: function(recording) {
                var base64Prefix;
                setRecording(recording);
                if (_recording) {
                    base64Prefix = 'data:' + recording.mime + ';base64,';
                    player.load(base64Prefix + recording.data);
                }
            },

            reset: function() {
                resetRecording();
            },

            destroy: function() {
                player = null;
                recorder = null;
            },

            render: function() {
                // render rich text content in prompt
                html.render($container.find('.prompt'));

                // render interaction
                createControls();
            }
        };

        return renderer;
    };
});