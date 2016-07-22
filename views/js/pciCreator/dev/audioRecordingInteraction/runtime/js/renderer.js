define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
    // todo: conditionnally get this for Edge?
    'audioRecordingInteraction/runtime/js/MediaStreamRecorder',
    'audioRecordingInteraction/runtime/js/war/WebAudioRecorder'
    //todo: check if Promise polyfill is needed ?
], function($, html, MediaStreamRecorder, WebAudioRecorder){
    'use strict';

    // from https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/blob/master/mediaDevices-getUserMedia-polyfill.js
    (function() {

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

        }

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

    }());





    return {
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

            var browser = 'FF'; // FF, CHROME, EDGE
            var encoder = 'WAR'; // MR, MSR, WAR

            // Media Recorder Profiles
            // var profile = { id: 'WEBM-OPUS-32',   mimeType: 'audio/webm;codecs=opus',   bitrate: 32000 };
            // var profile = { id: 'WEBM-VORBIS-32', mimeType: 'audio/webm;codecs=vorbis', bitrate: 32000 };
            // var profile = { id: 'WEBM-32',        mimeType: 'audio/webm',               bitrate: 32000 };
            // var profile = { id: 'OGG-OPUS-32',    mimeType: 'audio/ogg;codecs=opus',    bitrate: 32000 };
            // var profile = { id: 'OGG-32',         mimeType: 'audio/ogg',                bitrate: 32000 };
            // var profile = { id: 'WAV-32',         mimeType: 'audio/wav',                bitrate: 32000 };

            // Web Audio Recorder Profiles
            var profile = { id: 'WAV-DEFAULT',    mimeType: 'audio/wav',                bitrate: 32000 };

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
                            mediaRecorder.stop();
                            endRecording(blob);
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
                            endRecording(blob);
                        };
                    }
                    /* */



                    if (typeof mediaRecorder !== "undefined") {

                        // handlers
                        // ==========
                        $startButton.on('click', function record() {

                            // timeslice Optional
                            // This parameter takes a value of milliseconds, and represents the length of media capture to return in each Blob.
                            // If it is not specified, all media captured will be returned in a single Blob,
                            // unless one or more calls are made to MediaRecorder.requestData.
                            var timeSlice = 10000;
                            mediaRecorder.start(timeSlice);
                            // mediaRecorder.start();
                        });

                        $stopButton.on('click', function stopRecording() {
                            mediaRecorder.stop();
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
                    }

                    if (encoder === 'WAR') {
                        // Web audio API
                        // ===========================

                        // Create a MediaStreamAudioSourceNode
                        // Feed the HTMLMediaElement into it
                        var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                        var audioSource = audioCtx.createMediaStreamSource(stream);

                        // todo: read this from parameters
                        // var recorder = audioCtx.createScriptProcessor(4096, 1, 1);
                        //
                        // recorder.onaudioprocess = function(e) {
                        // };

                        // connect the AudioBufferSourceNode to the destination
                        // source.connect(recorder);
                        // recorder.connect(audioCtx.destination);
                        var warConfig = {
                            workerDir: '/qtiItemPci/views/js/pciCreator/dev/audioRecordingInteraction/runtime/js/war/',
                            numChannels: 2,
                            encoding: 'wav',
                            options: {
                                timeLimit: 10
                            }
                        };
                        var recorder = new WebAudioRecorder(audioSource, warConfig);
                        // handlers
                        // ==========
                        $startButton.on('click', function record() {

                            recorder.startRecording();
                        });

                        $stopButton.on('click', function stopRecording() {
                            recorder.finishRecording();
                        });

                        recorder.onComplete = function(recorder, blob) {
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
});