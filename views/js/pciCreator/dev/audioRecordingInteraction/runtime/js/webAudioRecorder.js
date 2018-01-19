/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * This wraps the getUserMedia / MediaRecorder APIs. Works only with a few compliant browsers,
 * meaning Chrome (https) and Firefox.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event'
], function(_, event) {
    'use strict';

    /**
     * @property {String} CREATED   - recorder instance created, but microphone access not granted
     * @property {String} IDLE      - ready to record
     * @property {String} RECORDING - record is in progress
     */
    var recorderStates = {
        CREATED:    'created',
        IDLE:       'idle',
        RECORDING:  'recording'
    };

    /**
     * MediaDevices.getUserMedia polyfill
     * https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/
     * Mozilla Public License, version 2.0 - https://www.mozilla.org/en-US/MPL/
     */
    function setGetUserMedia() {
        var promisifiedOldGUM = function promisifiedOldGUM(constraints) {

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
        if(typeof navigator.mediaDevices === 'undefined') {
            navigator.mediaDevices = {};
        }

        // Some browsers partially implement mediaDevices. We can't just assign an object
        // with getUserMedia as it would overwrite existing properties.
        // Here, we will just add the getUserMedia property if it's missing.
        if(typeof navigator.mediaDevices.getUserMedia === 'undefined') {
            navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
        }
    }


    /**
     * @param {Object} config
     * @param {Number} config.audioBitrate - in bits per second, quality of the recording
     * @param {Number} config.maxRecordingTime - in seconds
     * @param {Object} assetManager - used to resolve static assets, here the worker file
     * @returns {Object} - The recorder
     */
    return function recorderFactory(config, assetManager) {
        var MediaRecorder = window.MediaRecorder,       // The MediaRecorder API
            mediaRecorder,                              // The MediaRecorder instance
            recorderOptions = {                         // Options for the MediaRecorder constructor
                audioBitsPerSecond: config.audioBitrate || 20000
            };

        var recorderWorkerPath = 'audioRecordingInteraction/runtime/js/workers/WebAudioRecorderWav.js', // todo: use min version
            recorderWorker;

        var audioContext = new (window.AudioContext || window.webkitAudioContext)(),
            audioNodes = {};

        var numChannels = (config.isStereo) ? 2 : 1,
            bufferSize = 2048,
            buffer = [];

        var recorder,                       // Return value of the present factory
            state = recorderStates.CREATED; // recorder inner state

        var mimeType,               // mime type of the recording
            chunks = [],            // contains the current recording split in chunks
            chunkSizeMs = 1000,     // size of a chunk
            startTimeMs,            // start time of the recording - used for calculating record duration
            timerId;                // a place to store the requestAnimationFrame return value

        var analyser,               // the WebAudio node use to read the input level
            frequencyArray;         // used to compute the input level from the current array of frequencies

        var codecsByPreferenceOrder = [
            'audio/webm;codecs=opus',
            'audio/ogg;codecs=opus',
            'audio/webm',
            'audio/ogg'
        ];

        console.log('in PCM recorder with config', config);

        function initWorker() {
            recorderWorker = new Worker(assetManager.resolve(recorderWorkerPath));

            sendToWorker('init', {
                config: {
                    numChannels: numChannels,
                    sampleRate: config.pcmSampleRate
                },
                options: {
                    timeLimit: 300,           // recording time limit (sec)
                    encodeAfterRecord: false, // process encoding after recording
                    progressInterval: 1000,   // encoding progress report interval (millisec)
                    bufferSize: bufferSize,   // buffer size (use browser default)
                    wav: {
                        mimeType: "audio/wav"
                    }
                }
            });
        }

        function sendToWorker(command, payload) {
            recorderWorker.postMessage(_.merge({ command: command }, payload));
        }

        /**
         * Create the Web Audio node that will be use to analyse the input stream
         * @param {MediaStream} stream
         */
        function initAnalyser(stream) {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)(),
                source = audioCtx.createMediaStreamSource(stream),
                bufferLength;

            analyser = audioCtx.createAnalyser();
            analyser.minDecibels = -100;
            analyser.maxDecibels = -30;
            analyser.fftSize = 32;

            source.connect(analyser);

            bufferLength = analyser.frequencyBinCount;
            frequencyArray = new Uint8Array(bufferLength);
        }

        /**
         * Computes the input level from the current frequency range
         * @returns {Number}
         */
        function getInputLevel() {
            var sum;

            analyser.getByteFrequencyData(frequencyArray);

            sum = frequencyArray.reduce(function(a, b) {
                return a + b;
            });
            return Math.floor(sum / frequencyArray.length);
        }

        /**
         * Set recorder state
         * @param {Object} recorderInstance - the recorder instance
         * @param {String} newState - the new state
         */
        function setState(recorderInstance, newState) {
            state = newState;
            recorderInstance.trigger('statechange');
            recorderInstance.trigger(newState);
        }


        setGetUserMedia();

        // set the prefered encoding format, if we are able to detect what is supported
        // if not, the browser default will be used
        if (typeof MediaRecorder.isTypeSupported === 'function') {
            codecsByPreferenceOrder.forEach(function (format) {
                if (_.isUndefined(recorderOptions.mimeType) && MediaRecorder.isTypeSupported(format)) {
                    recorderOptions.mimeType = format;
                }
            });
        }

        recorder = {
            /**
             * Check the current state
             * @param {String} queriedState
             * @returns {Boolean}
             */
            is: function is(queriedState) {
                return (state === queriedState);
            },

            /**
             * Initialise the MediaRecorder stream
             * @returns {Promise}
             */
            init: function init() {
                var self = this;

                return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        console.log('microphone access granted, initialising recorder');
                        initWorker();

                        // create base audio nodes
                        audioNodes.source = audioContext.createMediaStreamSource(stream);
                        audioNodes.volume = audioContext.createGain();

                        audioNodes.source.connect(audioNodes.volume);


                        // initAnalyser(stream);

                        setState(recorder, recorderStates.IDLE);

                        recorderWorker.onmessage = function(e) {
                            var data = e.data;
                            var blob,
                                durationMs;
                            switch (data.command) {
                                case 'complete': {
                                    console.log('recording complete, received blob');
                                    console.log(data.blob);
                                    blob = data.blob;
                                    durationMs = new window.Date().getTime() - startTimeMs;
                                    self.trigger('recordingavailable', [blob, durationMs]);
                                    break;
                                }
                                case 'error': {
                                    console.log('ERROR !', data.message);
                                    break;
                                }
                                case 'timeout': {
                                    console.log('TIMEOUT !');
                                    break;
                                }
                            }
                        };

                        // save chunks of the recording
                        // mediaRecorder.ondataavailable = function ondataavailable(e) {
                        //     chunks.push(e.data);
                        //} ;

                        // stop record callback
                        // mediaRecorder.onstop = function onstop() {
                        //     var blob,
                        //         durationMs;
                        //
                        //     self.trigger('stop');
                        //
                        //     if (! self.cancelled) {
                        //         blob = new Blob(chunks, { type: mimeType });
                        //         durationMs = new window.Date().getTime() - startTimeMs;
                        //         self.trigger('recordingavailable', [blob, durationMs]);
                        //
                        //     }
                        //     cancelAnimationFrame(timerId);
                        //
                        //     self.trigger('levelUpdate', [0]);
                        //     setState(recorder, recorderStates.IDLE);
                        //
                        //     chunks = [];
                        // };
                    });
            },

            /**
             * Start the recording
             */
            start: function start() {
                console.log('in webaudio recorder START, with bufferSize', bufferSize);
                audioNodes.processor = audioContext.createScriptProcessor(bufferSize, numChannels, numChannels);
                audioNodes.processor.onaudioprocess = function(e) {
                    var ch;
                    for (ch = 0; ch < numChannels; ++ch) {
                        buffer[ch] = e.inputBuffer.getChannelData(ch);
                    }
                    console.log('processing audio');
                    sendToWorker('record', { buffer: buffer });
                };
                audioNodes.volume.connect(audioNodes.processor);
                // audioNodes.source.connect(audioNodes.processor);

                sendToWorker('start', { bufferSize: bufferSize });

                startTimeMs = new window.Date().getTime();

                setState(recorder, recorderStates.RECORDING);

                this._monitorRecording();
            },

            /**
             * Stop the recording
             */
            stop: function stop() {
                // this.cancelled = false;
                // mediaRecorder.stop();
                // state change is triggered by onstop handler

                audioNodes.processor.onaudioprocess = null;
                audioNodes.volume.disconnect();
                delete audioNodes.processor;
                sendToWorker('finish');

                this.trigger('stop');
                this.trigger('levelUpdate', [0]);
                cancelAnimationFrame(timerId);

                setState(recorder, recorderStates.IDLE);
            },

            /**
             * Cancel the current recording
             */
            cancel: function cancel() {
                // this.cancelled = true;
                // mediaRecorder.stop();

                this.stop(); //fixme: cancel event should be sent, not finish
            },

            /**
             * Send the current recording description through events: input level and duration
             * @private
             */
            _monitorRecording: function _monitorRecording() {
                var nowMs = new window.Date().getTime(),
                    elapsedSeconds = (nowMs - startTimeMs) / 1000;

                timerId = requestAnimationFrame(this._monitorRecording.bind(this));

                this.trigger('timeupdate', [elapsedSeconds]);
                // this.trigger('levelUpdate', [getInputLevel()]);

                if (config.maxRecordingTime > 0 && elapsedSeconds >= config.maxRecordingTime) {
                    this.stop();
                }
            },

            /**
             * Destroy the recorder instance
             */
            destroy: function destroy() {
                if (audioContext) {
                    audioContext.close();
                }
                // close worker ?
            }

        };
        event.addEventMgr(recorder);

        return recorder;
    };
});