define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
    'audioRecordingInteraction/runtime/js/MediaStreamRecorder'
    //todo: check if Promise polyfill is needed ?
], function($, html, MediaStreamRecorder){
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

            // example

            // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var audio = document.querySelector('audio');

            // getUserMedia block - grab stream
            // put it into a MediaStreamAudioSourceNode
            navigator.mediaDevices.getUserMedia ({ audio: true })
                .then(function(stream) {

                    // audio.onloadedmetadata = function(e) {
                    //     audio.play();
                    //     audio.muted = 'true';
                    // };

                    // Standard mediaRecorder way:
                    // ===========================

                    /*
                    var mediaRecorder = new MediaRecorder(stream);

                    // console.dir(MediaRecorder);
                    // console.dir(MediaRecorder.canRecordMimeType('audio/ogg'));

                    // mediaRecorder.mimeType = 'audio/wav';
                    mediaRecorder.ondataavailable = function (blob) {
                        // POST/PUT "Blob" using FormData/XHR2
                        var blobURL = URL.createObjectURL(blob.data);
                        // audio.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                        audio.src = blobURL;
                    };
                    */

                    // mediaRecorder kind-of-polyfill way:
                    // ====================================

                    var mediaRecorder = new MediaStreamRecorder(stream);
                    mediaRecorder.mimeType = 'audio/webm';
                    mediaRecorder.ondataavailable = function (blob) {
                        // POST/PUT "Blob" using FormData/XHR2
                        var blobURL = URL.createObjectURL(blob);
                        // audio.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                        audio.src = blobURL;
                    };


                    // handlers
                    // ==========
                    $startButton.on('click', function record() {

                        // timeslice Optional
                        // This parameter takes a value of milliseconds, and represents the length of media capture to return in each Blob.
                        // If it is not specified, all media captured will be returned in a single Blob,
                        // unless one or more calls are made to MediaRecorder.requestData.
                        // mediaRecorder.start(3000);
                        mediaRecorder.start(15000);
                    });

                    $stopButton.on('click', function stopRecord() {
                        mediaRecorder.stop();
                    });






                    // Web audio API
                    // ===========================

                    // Create a MediaStreamAudioSourceNode
                    // Feed the HTMLMediaElement into it
                    // var source = audioCtx.createMediaStreamSource(stream);

                    // todo: read this from parameters
                    // var recorder = audioCtx.createScriptProcessor(4096, 1, 1);
                    //
                    // recorder.onaudioprocess = function(e) {
                    // };

                    // connect the AudioBufferSourceNode to the destination
                    // source.connect(recorder);
                    // recorder.connect(audioCtx.destination);

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