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
 * Copyright (c) 2017-2019 (original work) Open Assessment Technologies SA;
 */
/**
 * This module wraps an audio processor provider which depends on the requested recording format:
 * - compressed: mediaRecorder provider
 * - uncompressed: webAudio provider
 *
 * It also handles:
 * - microphone access
 * - time related functionality (recording duration, time limit...)
 * - reading of the input level for the meter
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/OAT/promise',
    'taoQtiItem/portableLib/OAT/util/event',
    'audioRecordingInteraction/runtime/js/providers/mediaRecorder',
    'audioRecordingInteraction/runtime/js/providers/webAudio'
], function(Promise, event, mediaRecorderProvider, webAudioProvider) {
    'use strict';

    /**
     * @property {String} CREATED   - recorder instance created, but microphone access not granted
     * @property {String} IDLE      - ready to record
     * @property {String} RECORDING - record is in progress
     */
    var recorderStates = {
        CREATED:    'created',
        IDLE:       'idle',
        RECORDING:  'recording',
        STOPED:  'stoped',
        CANCELED:  'canceled'
    };

    /**
     * Get a random number between the specified values
     *
     * @param {Number} min
     * @param {Number} max
     * @returns {Number}
     */
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }

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
     * @param {Number} config.maxRecordingTime - in seconds
     * @param {Object} assetManager - used to resolve static assets, here the worker file
     * @returns {Object} - The recorder
     */
    return function recorderFactory(config, assetManager) {
        var recorder,                       // Return value of the present factory
            mediaStream,                    // The MediaStream instance
            provider,                       // provider for audio processing/encoding
            state = recorderStates.CREATED; // recorder inner state

        var startTimeMs,            // start time of the recording - used for calculating record duration
            durationMs,             // duration of the recording
            timerId;                // a place to store the requestAnimationFrame return value

        var audioContext,
            analyser,               // the WebAudio node use to read the input level
            frequencyArray;         // used to compute the input level from the current array of frequencies

        /**
         * Check if client uses the iOS device.
         *
         * @returns {*|boolean}
         */
        function isIOSDevice() {
            return /(iPhone|iPad)/i.test(navigator.userAgent)
        }

        /**
         * Fill the frequencyArray with fake data
         *
         * @param {Array} frequencyArray
         */
        function fillFakeEmitter(frequencyArray) {
            var frequencyLength = frequencyArray.length;
            var level = 0;
            var levelIndex = 0;

            if (frequencyLength) {
                level = getRndInteger(frequencyLength * (frequencyLength / 2), frequencyLength * frequencyLength);
            }

            do {
                frequencyArray[levelIndex++] = level;
                /**
                 * As far as we're imitating a fake icon with bouncing sound levels, so it would be better
                 * to fill only the half of `frequencyArray`, which represents the scale for levels of our icon.
                 * If we fill the whole array, then it will seem that sound is too loud and levels almost maximal.
                 */
            } while (levelIndex < frequencyLength / 2);
        }

        /**
         * Create the Web Audio node that will be used to analyse the input stream
         * @param {MediaStream} stream - incoming audio stream from the microphone
         */
        function initAnalyser(stream) {
            var source,
                bufferLength;

            source = audioContext.createMediaStreamSource(stream);

            analyser = audioContext.createAnalyser();
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

            if (frequencyArray.length && isIOSDevice()) {
                fillFakeEmitter(frequencyArray);
            }

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
             * Check is need to be initialised
             * @returns {Boolean}
             */
            isNeedInit: function isNeedInit() {
                return this.is(recorderStates.CREATED) ||
                    this.is(recorderStates.STOPED) ||
                    this.is(recorderStates.CANCELED);
            },

            /**
             * Initialise the MediaRecorder stream
             * @returns {Promise}
             */
            init: function init() {
                var self = this;

                provider = (config.isCompressed)
                    ? mediaRecorderProvider(config)
                    : webAudioProvider(config, assetManager);

                    this.initAudioContext();

                return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        mediaStream = stream;
                        provider.init(stream);

                        provider.on('blobavailable', function(blob) {
                            self.trigger('recordingavailable', [blob, durationMs]);
                            self.releaseResourses(); // release resources after provider send data
                        });

                        provider.on('partialblobavailable', function(blob) {
                            self.trigger('partialrecordingavailable', [blob]);
                        });

                        initAnalyser(stream);

                        setState(recorder, recorderStates.IDLE);
                    });
            },

            /**
             * Create the Audio context
             * @returns {AudioContext}
             */
            initAudioContext: function initAudioContext() {
                var context = window.audioContext;

                if (context) {
                    audioContext = context;
                } else {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                window.audioContext = audioContext;

                return audioContext;
            },

            /**
             * Start the recording
             */
            start: function start() {
                startTimeMs = new window.Date().getTime();

                provider.start();
                setState(recorder, recorderStates.RECORDING);

                this._monitorRecording();
            },

            /**
             * Stop the recording
             */
            stop: function stop() {
                durationMs = new window.Date().getTime() - startTimeMs;

                this._interruptRecording();

                provider.stop();
                setState(recorder, recorderStates.STOPED);

                this.trigger('stop');
            },

            /**
             * Cancel the current recording
             */
            cancel: function cancel() {
                this._interruptRecording();

                provider.cancel();
                setState(recorder, recorderStates.CANCELED);

                this.releaseResourses(); // can release resources because provider don't send data

                this.trigger('cancel');
            },

            /**
             * Release resourses after stop recording
             */
            releaseResourses: function releaseResourses() {
                if (mediaStream) {
                    mediaStream.getTracks().forEach(track => track.stop());
                }
                audioContext.close().then(function() {
                    audioContext = null;
                });
                window.audioContext = null;
                provider.destroy();
                provider = null;
            },

            /**
             * Perform interrupt recording actions, whether stop() or cancel() related
             * @private
             */
            _interruptRecording: function _interruptRecording() {
                cancelAnimationFrame(timerId);
                setState(recorder, recorderStates.IDLE);
                this.trigger('levelUpdate', [0]);
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
                this.trigger('levelUpdate', [getInputLevel()]);

                if (config.maxRecordingTime > 0 && elapsedSeconds >= config.maxRecordingTime) {
                    this.trigger('timeout');
                    this.stop();
                }
            },

            /**
             * Destroy the recorder instance
             */
            destroy: function destroy() {
                var promises = [
                    cancelAnimationFrame(timerId),
                ];

                if (provider) {
                    promises.push(provider.destroy());
                }

                return Promise.all(promises);
            }
        };
        event.addEventMgr(recorder);

        return recorder;
    };
});
