define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/util/html',
    //todo: remove this! use the packaged version as a shared library of the pci, or use a custom player
    'ui/mediaplayer',
    'audioRecordingInteraction/runtime/js/recorder'
], function($, html, mediaplayer, recorder){
    'use strict';

    // function renderChoices(id, $container, config){
    //
    //     var $li,
    //         level = parseInt(config.level) || 5,
    //         $ul = $container.find('ul.likert');
    //
    //     ensure that renderChoices() is idempotent
        // $ul.empty();
        //
        // add levels
        // for(var i = 1; i <= level; i++){
        //
        //     $li = $('<li>', {'class' : 'likert'});
        //     $li.append($('<input>', {type : 'radio', name : id, value : i}));
        //
        //     $ul.append($li);
        // }
    // }
    //
    // function renderLabels(id, $container, config){
    //
    //     var $ul = $container.find('ul.likert');
    //     var $labelMin = $('<span>', {'class' : 'likert-label likert-label-min'}).html(config['label-min']);
    //     var $labelMax = $('<span>', {'class' : 'likert-label likert-label-max'}).html(config['label-max']);
    //
    //     $ul.before($labelMin);
    //     $ul.after($labelMax);
    // }

    return {
        render : function(id, container, config){

            var $container = $(container);

            var $recorderContainer = $container.find('.audioRec > .recorder');
            var $playerContainer = $container.find('.audioRec > .player');

            // var player = mediaplayer({
            //     renderTo: $playerContainer,
            //     url: 'tbd',
                // loop: false,
                // canPause: true,
                // height: 5
            // });

            var $startButton = $('<button>', {
                text: 'Start recording'
            });

            var $stopButton = $('<button>', {
                text: 'Stop recording'
            });

            $recorderContainer.append($startButton);
            $recorderContainer.append($stopButton);

// fork getUserMedia for multiple browser versions, for those
// that need prefixes
            navigator.getUserMedia = (navigator.getUserMedia ||
                    navigator.webkitGetUserMedia ||
                    navigator.mozGetUserMedia ||
                    navigator.msGetUserMedia);

// define other variables

            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            var video = document.querySelector('video');

// getUserMedia block - grab stream
// put it into a MediaStreamAudioSourceNode
// also output the visuals into a video element

            if (navigator.getUserMedia) {
                console.log('getUserMedia supported.');
                navigator.getUserMedia (
                    // constraints: audio and video for this app
                    {
                        audio: true,
                        video: true
                    },

                    // Success callback
                    function(stream) {
                        video.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
                        video.onloadedmetadata = function(e) {
                            video.play();
                            video.muted = 'true';
                        };

                        // Create a MediaStreamAudioSourceNode
                        // Feed the HTMLMediaElement into it
                        var source = audioCtx.createMediaStreamSource(stream);

                        // Create a biquadfilter
                        var biquadFilter = audioCtx.createBiquadFilter();
                        biquadFilter.type = "lowshelf";
                        biquadFilter.frequency.value = 1000;
                        biquadFilter.gain.value = 20;

                        // connect the AudioBufferSourceNode to the gainNode
                        // and the gainNode to the destination, so we can play the
                        // music and adjust the volume using the mouse cursor
                        source.connect(biquadFilter);
                        biquadFilter.connect(audioCtx.destination);

                    },

                    // Error callback
                    function(err) {
                        console.log('The following gUM error occured: ' + err);
                    }
                );
            } else {
                console.log('getUserMedia not supported on your browser!');
            }

// dump script to pre element













                //render rich text content in prompt
            html.render($container.find('.prompt'));

        }
        // ,
        // renderChoices : function(id, container, config){
        //     renderChoices(id, $(container), config);
        // }
    };
});