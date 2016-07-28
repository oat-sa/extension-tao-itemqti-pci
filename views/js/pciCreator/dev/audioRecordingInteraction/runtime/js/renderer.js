define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/html',
    'OAT/util/event',
    'tpl!audioRecordingInteraction/runtime/tpl/control'


], function($, _, html, event, controlTpl) {
    'use strict';

    // todo: rename states: inactive => idle for examaple, created => unloaded / unplugged ?
    /**
     * @property {String} CREATED   - player instance created, but no media loaded
     * @property {String} INACTIVE  - media loaded and playable
     * @property {String} PLAYING   - media is playing
     */
    var playerStates = {
        CREATED:    'created',
        INACTIVE:   'inactive',
        PLAYING:    'playing'
    };

    /**
     * @property {String} CREATED   - recorder instance created, but not not initialized
     * @property {String} INACTIVE  - ready to record
     * @property {String} RECORDING - record in progress
     */
    var recorderStates = {
        CREATED:    'created',
        INACTIVE:   'inactive',
        RECORDING:  'recording'
    };

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

                // this handle both the 'ready to play' state, and the user pressing the stop button
                audioEl.oncanplay = function() {
                    self._setState(playerStates.INACTIVE);
                };

                audioEl.onplaying = function() {
                    self._setState(playerStates.PLAYING);
                };

                // this handle the case when playbacks end without user pressing the stop button
                audioEl.onended = function() {
                    self._setState(playerStates.INACTIVE);
                };
            },

            play: function() {
                audioEl.play();
            },

            stop: function() {
                audioEl.pause();
                audioEl.currentTime = 0;
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
     * todo: jsdoc
     * Minimal MediaRecorder wrapper in case an alternate recorder implementation is needed someday
     * for incompatible browsers
     * @param config
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
                            self._setState(recorderStates.INACTIVE);

                            mediaRecorder.ondataavailable = function (e) {
                                //todo: check what is the best way to handle this: little chunks or a big chunk at once
                                self.trigger('dataavailable', [e]);
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
                this._setState(recorderStates.INACTIVE);
            }
        };
        event.addEventMgr(recorder);

        return recorder;
    }


    /**
     * //todo: add jsdoc
     * @param options
     * @returns {{enable: enable, disable: disable, activate: activate}}
     */
    function controlFactory(config) {
        var state;
        var $control = $(controlTpl({
            id: config.id,
            label: config.label
        }));
        $control.on('click', function() {
            if (state === 'enabled') {
                config.onclick();
            }
        });
        if (config.display === true) {
            $control.appendTo(config.container);
        }
        setState(config.defaultState || 'enabled');

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        return {
            enable: function() {
                setState('enabled');
            },
            disable: function() {
                setState('disabled');
            },
            activate: function() {
                setState('active');
            },
            updateState: function() {
                config.updateState.call(this);
            }
        };
    }

    // todo: shouldn't this be under the returned function scope to avoid explicitely passing controls ? or bind it
    function updateControls(controls) {
        var control;
        for (control in controls) {
            if (controls.hasOwnProperty(control)) {
                controls[control].updateState();
            }
        }
    }



    return function(id, container, config) {

        // recording as file { mime, data, name }
        var _recording = null;
        // mime type
        // filename

        var $container = $(container);

        var controls = {},
            $controlsContainer = $container.find('.audioRec > .controls');

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

        recorder.on('dataavailable', function(e) {
            // todo: add checks on createObjectURL ?
            // console.dir(e);
            var recording = e.data,
                recordingUrl = URL.createObjectURL(recording);

            player.load(recordingUrl);
            setRecording(recording);
        });

        recorder.on('statechange', function() {
            updateControls(controls);
        });

        player.on('statechange', function() {
            updateControls(controls);
        });

        function startRecording() {
            console.log('clicked on record');
            function effectiveStart() {
                recorder.start();
                updateControls(controls);
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
            console.log('i am about to stop');
            if (recorder.getState() === recorderStates.RECORDING) {
                recorder.stop();

            } else if (player.getState() === playerStates.PLAYING) {
                player.stop();
            }
            updateControls(controls);
        }

        function playRecording() {
            player.play();
            updateControls(controls);
        }

        function resetRecording() {
            player.unload();
            _recording = null;
            updateControls(controls);
        }

        function setRecording(blob) {
            //todo: implement a spinner or something to feedback that work is in progress while this is happening
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function onLoadEnd(e) {
                //fixme: this doesn't seem to work always well, along with mimeType.
                // Set this at the pci level during media recoder init?
                var filename = 'audioRecording' + Date.now() +
                    '.' + blob.type.split('/')[1];

                var base64Raw = e.target.result;
                var commaPosition = base64Raw.indexOf(',');

                // Store the base64 encoded data for later use.
                var base64Data = base64Raw.substring(commaPosition + 1);

                _recording = {
                    mime: blob.type,
                    name: filename,
                    data: base64Data
                };
            };
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
                    case playerStates.INACTIVE: this.enable(); break;
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
                    if (player.getState() === playerStates.INACTIVE) {
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
                _recording = recording;
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

            /**
             *
             */
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