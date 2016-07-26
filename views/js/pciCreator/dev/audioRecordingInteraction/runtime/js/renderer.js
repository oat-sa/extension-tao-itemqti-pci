define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
    'tpl!audioRecordingInteraction/runtime/tpl/control'

    // todo: remove related files
    // 'audioRecordingInteraction/runtime/js/MediaStreamRecorder',
    // 'audioRecordingInteraction/runtime/js/war/WebAudioRecorder'

], function($, html, controlTpl) {
    'use strict';

    // recording as Blob
    var _recording;

    return {
        getRecording: function() {
            return _recording;
        },

        /**
         *
         * @param id
         * @param container
         * @param config
         * config.
         */
        render : function(id, container, config) {

            var $container = $(container);

            var controls = {},
                $controlsContainer = $container.find('.audioRec > .controls');

            //todo: lodash shouldn't be there !
            var options = _.defaults(config, {
                audioBitrate: 20000,
                allowPlayback: true,
                autostart: false,
                maxRecords: -1,
                maxRecordingTime: 10,
                displayDownloadLink: true // for debugging purposes only
            });

            var playerStates = {
                INACTIVE: 'inactive',
                READY: 'ready',
                PLAYING: 'playing'
            };

            var recorderStates = {
                INACTIVE: 'inactive',
                RECORDING: 'recording',
                PAUSED: 'paused'
            };

            setGetUserMedia();
            navigator.mediaDevices.getUserMedia ({ audio: true })
                .then(function(stream) {
                    return recorderFactory(stream, options);
                })
                .then(function(recorder) {
                    var player = playerFactory();

                    recorder.ondataavailable = function(e) {
                        // todo: add checks on createObjectURL ?
                        var recording = e.data,
                            recordingUrl = URL.createObjectURL(_recording);

                        player.load(recordingUrl);
                        setRecording(recording);
                    };

                    player.onready = updateControls;
                    player.onplaying = updateControls;

                    function startRecording() {
                        recorder.start();
                        updateControls();
                    }

                    function stopRecordingOrPlayback() {
                        if (recorder.state === recorderStates.RECORDING) {
                            recorder.stop();

                        } else if (player.state === playerStates.PLAYING) {
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
                        setRecording();
                        updateControls();
                    }


                    function setRecording(blob) {
                        if (! blob) {
                            _recording = undefined;
                            return;
                        }
                        //todo: implement a spinner or something to feedback that work is in progress while this is happening
                        var reader = new FileReader();
                        reader.readAsDataURL(blob);

                        reader.onloadend = function onLoadEnd(e) {
                            //fixme: this doesn't seem to work always well, along with mimeType.
                            // Set this at the pci level during media recoder init?
                            var filename = 'audioRecording' + Date.now() +
                                '.' + blob.type.split('/')[1];

                            _recording = {
                                data: e.target.result,
                                mime: blob.type,
                                name: filename
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

                    function initializeControls() {
                        controls.record = controlFactory({
                            defaultState: 'enabled',
                            label: 'record',
                            // icon: 'radio-bg',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                startRecording();
                            },
                            updateState: function updateState() {
                                if (player.state === playerStates.INACTIVE) {
                                    switch(recorder.state) {
                                        case recorderStates.INACTIVE: this.enable(); break;
                                        case recorderStates.RECORDING: this.activate(); break;
                                        default: this.disable(); break;
                                    }
                                } else {
                                    this.disable();
                                }
                            }
                        });

                        controls.stop = controlFactory({
                            defaultState: 'disabled',
                            label: 'stop',
                            // icon: 'stop',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                stopRecordingOrPlayback();
                            },
                            updateState: function updateState() {
                                if (player.state === playerStates.PLAYING ||
                                    recorder.state === recorderStates.RECORDING) {
                                    this.enable();
                                } else {
                                    this.disable();
                                }
                            }
                        });

                        controls.play = controlFactory({
                            defaultState: 'disabled',
                            label: 'play',
                            // icon: 'play',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                playRecording();
                            },
                            updateState: function updateState() {
                                switch (player.state) {
                                    case playerStates.READY: this.enable(); break;
                                    case playerStates.PLAYING: this.activate(); break;
                                    default: this.disable(); break;
                                }
                            }
                        });

                        controls.reset = controlFactory({
                            defaultState: 'disabled',
                            label: 'reset',
                            // icon: 'loop',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                resetRecording();
                            },
                            updateState: function updateState() {
                                if (player.state === playerStates.READY) {
                                    this.enable();
                                } else {
                                    this.disable();
                                }
                            }
                        });
                    }

                    function updateControls() {
                        var control;
                        for (control in controls) {
                            if (controls.hasOwnProperty(control)) {
                                controls[control].updateState();
                            }
                        }
                    }

                    /**
                     * //todo: add jsdoc
                     * @param options
                     * @returns {{enable: enable, disable: disable, activate: activate}}
                     */
                    function controlFactory(config) {
                        var state;
                        var $control = $(controlTpl({
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
                            state = newState;
                            $control.removeClass('disabled enabled active');
                            $control.addClass(newState);
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


                    // interaction initialisation
                    initializeControls();


                })
                .catch(function(err) {
                    throw err;
                });

            //render rich text content in prompt
            html.render($container.find('.prompt'));
        }
    };



    function playerFactory() {
        var audioEl;

        return {
            state: playerStates.INACTIVE,

            load: function(url) {
                var self = this;

                audioEl = new Audio(url);

                // this handle both the 'ready to play' state, and the user pressing the stop button
                audioEl.oncanplay = function() {
                    self.state = playerStates.READY;
                    if (self.onready) {
                        self.onready();
                    }
                };

                audioEl.onplaying = function() {
                    self.state = playerStates.PLAYING;
                    if (self.onplaying) {
                        self.onplaying();
                    }
                };

                // this handle the case when playbacks end without user pressing the stop button
                audioEl.onended = function() {
                    self.state = playerStates.READY;
                    if (self.onready) {
                        self.onready();
                    }
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
                audioEl = undefined;
                this.state = playerStates.INACTIVE;
            }
        };
    }


    /**
     * todo: jsdoc
     * Minimal MediaRecorder wrapper in case an alternate recorder implementation is needed someday
     * for incompatible browsers
     * @param stream
     */
    function recorderFactory(stream, config) {
        return new Promise(function (resolve, reject) {
            var mediaRecorder,
                mediaRecorderWrapper,
                recorderOptions = {
                    audioBitsPerSecond: config.audioBitrate
                };

            if (typeof MediaRecorder === 'undefined') {
                reject(new Error('MediaRecorder API not supported. Please use a compatible browser'));
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
            mediaRecorder = new MediaRecorder(stream, recorderOptions);

            mediaRecorder.ondataavailable = function (e) {
                if (mediaRecorderWrapper.ondataavailable) {
                    mediaRecorderWrapper.ondataavailable(e);
                }
            };

            mediaRecorderWrapper = {
                state: mediaRecorder.state,

                start: function() {
                    mediaRecorder.start();
                    this.state = mediaRecorder.state;
                },

                stop: function() {
                    mediaRecorder.stop();
                    this.state = mediaRecorder.state;
                }
            };

            resolve(mediaRecorderWrapper);
        });
    }


    //todo: check licence or rewrite
    // MediaDevices.getUserMedia polyfill
    // https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/
    // Mozilla Public License, version 2.0
    function setGetUserMedia() {

        var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

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
        if(navigator.mediaDevices === undefined) {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if(navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
        }
    }

});