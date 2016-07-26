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
                maxRecordingTime: 10
            });








            var $recorderContainer = $container.find('.audioRec > .recorder');
            var $playerContainer = $container.find('.audioRec > .player');

            var $startButton = $('<button>', {
                text: 'Start recording'
            });

            var $stopButton = $('<button>', {
                text: 'Stop recording'
            });

            $recorderContainer.append($startButton);
            $recorderContainer.append($stopButton);

            function getBrowser() {
                if (navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveBlob || !!navigator.msSaveOrOpenBlob)) {
                    return 'EDGE';
                }
                if (!!navigator.webkitGetUserMedia) {
                    return 'CHROME';
                }
                return 'FF';
            }

            var browser = getBrowser();
            var encoder = 'MR'; // MR, MSR, WAR

            // Media Recorder Profiles
            // var profile = { id: 'WEBM-OPUS-32',   mimeType: 'audio/webm;codecs=opus',   bitrate: 32000 };
            // var profile = { id: 'WEBM-VORBIS-32', mimeType: 'audio/webm;codecs=vorbis', bitrate: 32000 };
            // var profile = { id: 'WEBM-32',        mimeType: 'audio/webm',               bitrate: 32000 };
            var profile = { id: 'OGG-OPUS-32',    mimeType: 'audio/ogg;codecs=opus',    bitrate: 32000 };
            // var profile = { id: 'OGG-32',         mimeType: 'audio/ogg',                bitrate: 32000 };
            // var profile = { id: 'WAV-32',         mimeType: 'audio/wav',                bitrate: 32000 };

            // Web Audio Recorder Profiles
            // var profile = { id: 'WAV-DEFAULT', channels: 2, codec: 'wav', bitrate: 0 };
            // var profile = { id: 'MP3-32-STEREO', channels: 2, codec: 'mp3', bitrate: 32 };
            // var profile = { id: 'OGG-32-MONO', channels: 1, codec: 'ogg', bitrate: -0.1 };
            // var profile = { id: 'OGG-160-STEREO', channels: 1, codec: 'ogg', bitrate: 5 };

            $('<p>', {
                text: browser + ' - ' + encoder + ' - ' + profile.id
            }).appendTo($playerContainer);

            // example

            var audio = document.querySelector('audio');

            // getUserMedia block - grab stream
            // put it into a MediaStreamAudioSourceNode


            function playerFactory() {
                var audioEl;
                return {
                    load: function(url) {
                        audioEl = new Audio(url);
                    },
                    play: function() {
                        audioEl.play();
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

                    function stopRecording() {
                        controls.record.disable();
                        controls.stop.disable();
                        controls.play.disable();
                        controls.reset.disable();

                        recorder.stop();
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
                        audio.src = blobURL;

                        var downloadLink = document.createElement('a');
                        document.body.appendChild(downloadLink);
                        downloadLink.text =
                            'download ' + profile.id + ' - ' + blob.type + ' : ' + Math.round((blob.size / 1000)) + 'KB';
                        downloadLink.download =
                            browser + ' - ' +
                            encoder + ' - ' +
                            profile.id + ' - ' + Date.now() +
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

                            console.dir(_response);
                        };
                        // var base64Raw = base64Data;
                        //
                        // var commaPosition = base64Data.indexOf(',');
                        // var base64Raw = base64Data.substring(commaPosition + 1);
                        // _response = {"base": {"file": {"data": base64Raw, "mime": blob.type, "name": filename}}};

                        // from file upload interaction
                        /*
                         var base64Data = e.target.result;
                         var commaPosition = base64Data.indexOf(',');

                         // Store the base64 encoded data for later use.

                         _response = {"base": {"file": {"data": base64Raw, "mime": filetype, "name": filename}}};
                         */
                    }


                    // function playRecording() {
                    //     co
                    // }

                    // ===========================================
                    // START EXPERIMENTS
                    // ===========================================

                    var mediaRecorder;

                    // audio.onloadedmetadata = function(e) {
                    //     audio.play();
                    //     audio.muted = 'true';
                    // };

                    // Standard mediaRecorder way:
                    // ===========================

                    /* */
                    if (encoder === 'MR') {
                        var options = {
                            audioBitsPerSecond : profile.bitrate,
                            mimeType : profile.mimeType
                        };
                        mediaRecorder = new MediaRecorder(stream, options);

                        // console.dir(MediaRecorder);
                        // console.dir(MediaRecorder.canRecordMimeType('audio/ogg'));

                        // mediaRecorder.mimeType = 'audio/wav';
                        mediaRecorder.ondataavailable = function (blob) {
                            // mediaRecorder.stop();
                            setStateFinished();
                            endRecording(blob.data);
                        };
                    }
                    /* */

                    /* */
                    if (encoder === 'MSR') {
                        // mediaRecorder kind-of-polyfill way:
                        // ====================================

                        mediaRecorder = new MediaStreamRecorder(stream);
                        mediaRecorder.mimeType = profile.mimeType;
                        mediaRecorder.ondataavailable = function (blob) {
                            mediaRecorder.stop();
                            setStateFinished();
                            endRecording(blob);
                        };
                    }
                    /* */



                    // if (typeof mediaRecorder !== "undefined") {

                        // handlers
                        // ==========
                        $startButton.on('click', function record() {

                            // timeslice Optional
                            // This parameter takes a value of milliseconds, and represents the length of media capture to return in each Blob.
                            // If it is not specified, all media captured will be returned in a single Blob,
                            // unless one or more calls are made to MediaRecorder.requestData.
                            var timeSlice = 10000;
                            // console.dir(mediaRecorder);
                            mediaRecorder.start(timeSlice);
                            setStateRecording();
                            // mediaRecorder.start();
                        });

                        $stopButton.on('click', function stopRecording() {
                            mediaRecorder.stop();
                            setStateFinished();
                        });

                        var isTypeSupported = 'false';
                        if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.isTypeSupported === "function") {
                            isTypeSupported = 'true';
                        }
                        $('<p>', {
                            text: 'isTypeSupported = ' + isTypeSupported
                        }).appendTo($playerContainer);

                        var canRecordMimeType = 'false';
                        if (typeof MediaRecorder !== "undefined" && typeof MediaRecorder.canRecordMimeType === "function") {
                            canRecordMimeType = 'true';
                        }
                        $('<p>', {
                            text: 'canRecordMimeType = ' + canRecordMimeType
                        }).appendTo($playerContainer);


                        /* */
                        if (isTypeSupported === 'true') {
                            (function checkSupportedMimeTypes() {
                                var mimeTypes = [
                                    'audio/webm;codecs=opus',
                                    'audio/webm;codecs=vorbis',
                                    'audio/webm',
                                    'audio/ogg;codecs=opus',
                                    'audio/ogg',
                                    'audio/wav'
                                ];

                                mimeTypes.forEach(function (type) {
                                    var $p = $('<p>', {
                                        text: type + ' = ' + MediaRecorder.isTypeSupported(type)
                                    });
                                    $('body').append($p);
                                });
                            }());
                        }
                        /* */
                    // }

                    if (encoder === 'WAR') {
                        // Web audio API
                        // ===========================

                        // Create a MediaStreamAudioSourceNode
                        // Feed the HTMLMediaElement into it
                        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        var audioSource = audioCtx.createMediaStreamSource(stream);

                        // var recorder = audioCtx.createScriptProcessor(4096, 1, 1);
                        //
                        // recorder.onaudioprocess = function(e) {
                        // };

                        // connect the AudioBufferSourceNode to the destination
                        // source.connect(recorder);
                        // recorder.connect(audioCtx.destination);
                        var warConfig = {
                            workerDir: '/qtiItemPci/views/js/pciCreator/dev/audioRecordingInteraction/runtime/js/war/',
                            numChannels: profile.channels,
                            encoding: profile.codec,
                            encodeAfterRecord: true,
                            options: {
                                timeLimit: 10,
                                mp3: {
                                    quality: profile.bitrate,
                                    mimeType: 'audio/mpeg'
                                },
                                ogg: {
                                    bitrate: profile.bitrate,
                                    mimeType: 'audio/ogg'
                                }
                            }
                        };
                        var recorder = new WebAudioRecorder(audioSource, warConfig);
                        // handlers
                        // ==========
                        $startButton.on('click', function record() {
                            setStateRecording();
                            recorder.startRecording();

                        });

                        $stopButton.on('click', function stopRecording() {
                            setStateFinished();
                            recorder.finishRecording();
                        });

                        recorder.onComplete = function(recorder, blob) {
                            setStateFinished();
                            endRecording(blob);
                        };
                    }

                    function endRecording(blob) {
                        var blobURL = URL.createObjectURL(blob);
                        audio.src = blobURL;

                        var downloadLink = document.createElement('a');
                        document.body.appendChild(downloadLink);
                        downloadLink.text =
                            'download ' + profile.id + ' - ' + blob.type + ' : ' + Math.round((blob.size / 1000)) + 'KB';
                        downloadLink.download =
                            browser + ' - ' +
                            encoder + ' - ' +
                            profile.id + ' - ' + Date.now() +
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

                            console.dir(_response);
                        };
                        // var base64Raw = base64Data;
                        //
                        // var commaPosition = base64Data.indexOf(',');
                        // var base64Raw = base64Data.substring(commaPosition + 1);
                        // _response = {"base": {"file": {"data": base64Raw, "mime": blob.type, "name": filename}}};

                        // from file upload interaction
                        /*
                        var base64Data = e.target.result;
                        var commaPosition = base64Data.indexOf(',');

                        // Store the base64 encoded data for later use.

                        _response = {"base": {"file": {"data": base64Raw, "mime": filetype, "name": filename}}};
                        */
                    }

                    var $recordingState = $('<p>', {
                        text: 'idle'
                    });
                    $playerContainer.after($recordingState);

                    function setStateRecording() {
                        $recordingState.text('recording...');
                    }

                    function setStateFinished() {
                        $recordingState.text('stopped');
                    }

                    // ===========================================
                    // END EXPERIMENTS
                    // ===========================================





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
                                stopRecording();
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
                start: function() {
                    mediaRecorder.start();
                },

                stop: function() {
                    mediaRecorder.stop();
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