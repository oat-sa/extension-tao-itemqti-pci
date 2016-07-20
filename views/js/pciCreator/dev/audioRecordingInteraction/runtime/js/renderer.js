define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
], function($, html){
    'use strict';

    function getUserMedia() {
        //todo: complete this with proper error handling
        //todo: see https://github.com/otalk/getUserMedia
        return (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    }

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

            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var audio = document.querySelector('audio');

                // getUserMedia block - grab stream
                // put it into a MediaStreamAudioSourceNode
                navigator.getUserMedia = getUserMedia();
                navigator.getUserMedia (
                    { audio: true },

                    function(stream) {
                        audio.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                        // audio.onloadedmetadata = function(e) {
                        //     audio.play();
                        //     audio.muted = 'true';
                        // };

                        // Create a MediaStreamAudioSourceNode
                        // Feed the HTMLMediaElement into it
                        var source = audioCtx.createMediaStreamSource(stream);

                        // connect the AudioBufferSourceNode to the destination
                        source.connect(audioCtx.destination);

                    },

                    // Error callback
                    function(err) {
                        console.log('The following gUM error occured: ' + err);
                    }
                );















                //render rich text content in prompt
            html.render($container.find('.prompt'));

        }
        // ,
        // renderChoices : function(id, container, config){
        //     renderChoices(id, $(container), config);
        // }
    };
});