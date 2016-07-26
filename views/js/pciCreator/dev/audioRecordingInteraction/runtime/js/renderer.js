define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
    'tpl!audioRecordingInteraction/runtime/tpl/control'

    // todo: remove related files
    // 'audioRecordingInteraction/runtime/js/MediaStreamRecorder',
    // 'audioRecordingInteraction/runtime/js/war/WebAudioRecorder'

], function($, html, controlTpl) {
    'use strict';

    var _response = {};

    return {
        getResponse : function getResponse() {
            return _response;
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

            config = _.defaults(config, {
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

            function playerFactory() {
                var audioEl;

                return {
                    state: playerStates.INACTIVE,

                    load: function(url) {
                        var self = this;

                        audioEl = new Audio(url);

                        audioEl.onloadend = function() {
                            self.state = playerStates.READY;
                        };

                        audioEl.onplay = function() {
                            self.state = playerStates.PLAYING;
                        };

                        audioEl.onend = function() {
                            self.state = playerStates.READY;
                        };
                    },

                    play: function() {
                        audioEl.play();
                    },

                    stop: function() {
                        audioEl.pause();
                        audioEl.currentTime = 0;
                    }
                };
            }



            setGetUserMedia();
            navigator.mediaDevices.getUserMedia ({ audio: true })
                .then(function(stream) {
                    return recorderFactory(stream, config);
                })
                .then(function(recorder) {

                    var player = playerFactory();

                    initializeControls();

                    recorder.ondataavailable = function(e) {
                        // todo: add checks on createObjectURL ?
                        var blob = e.data;
                        var blobUrl = URL.createObjectURL(blob);

                        controls.record.disable();
                        controls.stop.disable();
                        controls.play.enable();
                        controls.reset.enable();

                        endRecording(e.data);
                        player.load(blobUrl);
                    };

                    function startRecording() {
                        controls.record.activate();
                        controls.stop.enable();
                        controls.play.disable();
                        controls.reset.disable();

                        recorder.start();
                    }

                    function stopRecordingOrPlayback() {

                        if (recorder.state === recorderStates.RECORDING) {
                            controls.record.disable();
                            controls.stop.disable();
                            controls.play.disable();
                            controls.reset.disable();

                            recorder.stop();

                        } else if (player.state === playerStates.PLAYING) {
                            controls.record.disable();
                            controls.stop.disable();
                            controls.play.enable();
                            controls.reset.enable();

                            player.stop();
                        }
                    }

                    function playRecording() {
                        controls.record.disable();
                        controls.stop.enable();
                        controls.play.activate();
                        controls.reset.disable();

                        player.play();
                    }



                    function endRecording(blob) {
                        var blobURL = URL.createObjectURL(blob);

                        var downloadLink = document.createElement('a');
                        document.body.appendChild(downloadLink);
                        downloadLink.text =
                            'download '  + ' - ' + blob.type + ' : ' + Math.round((blob.size / 1000)) + 'KB';
                        downloadLink.download =
                            ' filename ' + Date.now() +
                            '.' + blob.type.split('/')[1];
                        downloadLink.href = blobURL;

                        var reader = new FileReader();
                        reader.readAsDataURL(blob);

                        reader.onloadend = function onLoadEnd(e) {
                            var filename = 'audioRecording' + Date.now() +
                                '.' + blob.type.split('/')[1];

                            var base64Data = e.target.result;
                            var commaPosition = base64Data.indexOf(',');
                            var base64Raw = base64Data.substring(commaPosition + 1);

                            // Store the base64 encoded data for later use.

                            _response = {"base": {"file": {"data": base64Raw, "mime": blob.type, "name": filename}}};
                        };
                    }


                    function initializeControls() {
                        controls.record = newControl({
                            defaultState: 'enabled',
                            label: 'record',
                            // icon: 'radio-bg',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                startRecording();
                            }
                        });

                        controls.stop = newControl({
                            defaultState: 'disabled',
                            label: 'stop',
                            // icon: 'stop',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                stopRecordingOrPlayback();
                            }
                        });

                        controls.play = newControl({
                            defaultState: 'disabled',
                            label: 'play',
                            // icon: 'play',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                playRecording();
                            }
                        });

                        controls.reset = newControl({
                            defaultState: 'disabled',
                            label: 'reset',
                            // icon: 'loop',
                            display: true,
                            container: $controlsContainer,
                            onclick: function onclick() {
                                // resetRecording();
                            }
                        });

                    }

                    /**
                     * //todo: add jsdoc
                     * @param options
                     * @returns {{enable: enable, disable: disable, activate: activate}}
                     */
                    function newControl(options) {
                        var state;
                        var $control = $(controlTpl({
                            label: options.label
                        }));
                        $control.on('click', function() {
                            if (state === 'enabled') {
                                options.onclick();
                            }
                        });
                        if (options.display === true) {
                            $control.appendTo(options.container);
                        }
                        setState(options.defaultState || 'enabled');

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
                            }
                        };
                    }


                })
                .catch(function(err) {
                    throw err;
                });



            //render rich text content in prompt
            html.render($container.find('.prompt'));

        }
        // ,
        // renderChoices : function(id, container, config){
        //     renderChoices(id, $(container), config);
        // }
    };




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