define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html'
    // todo: remove related files
    // 'audioRecordingInteraction/runtime/js/MediaStreamRecorder',
    // 'audioRecordingInteraction/runtime/js/war/WebAudioRecorder'

], function($, html) {
    'use strict';

    var _response = {};

    setGetUserMedia();


    return {
        getResponse : function getResponse() {
            return _response;
        },

        render : function(id, container, config){

            var $container = $(container);

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
            navigator.mediaDevices.getUserMedia ({ audio: true })
                .then(function(stream) {

                    var mediaRecorder;
                    console.log('here');

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

                })
                .catch(function(err) {
                    console.log('The following gUM error occured: ');
                    console.dir(err);
                });
















                //render rich text content in prompt
            html.render($container.find('.prompt'));

        }
        // ,
        // renderChoices : function(id, container, config){
        //     renderChoices(id, $(container), config);
        // }
    };


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