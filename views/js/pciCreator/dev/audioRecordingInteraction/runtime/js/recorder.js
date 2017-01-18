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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'OAT/util/event'
], function(event) {
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
     * MediaDevices.getUserMedia polyfill - https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/
     * Mozilla Public License, version 2.0 - https://www.mozilla.org/en-US/MPL/
     */
    function setGetUserMedia() {
        var promisifiedOldGUM = function(constraints) {

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
     * @param {Object}  config
     * @param {Number}  config.audioBitrate - number of bits per seconds for audio encoding
     * @param {Number}  config.maxRecordingTime - in seconds
     * @returns {Object} - wrapper for getUserMedia / MediaRecorder
     */
    return function recorderFactory(config) {
        var MediaRecorder = window.MediaRecorder,
            mediaRecorder,
            recorder,
            recorderOptions = {
                audioBitsPerSecond: config.audioBitrate
            },
            state = recorderStates.CREATED,
            mimeType,
            chunks = [],
            chunkSizeMs = 1000,
            startTimeMs,
            timerId,
            analyser,
            frequencyArray;

        setGetUserMedia();

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

        // analyser is the Web Audio node used to read the input level
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

        function getInputLevel() {
            var sum;

            analyser.getByteFrequencyData(frequencyArray);

            sum = frequencyArray.reduce(function(a, b) {
                return a + b;
            });
            return (sum / frequencyArray.length).toFixed(0);
        }

        recorder = {
            _setState: function(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(newState);
            },

            is: function(queriedState) {
                return (state === queriedState);
            },

            init: function() {
                var self = this;

                return navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function(stream) {
                        mediaRecorder = new MediaRecorder(stream, recorderOptions);
                        mimeType = mediaRecorder.mimeType;

                        initAnalyser(stream);

                        self._setState(recorderStates.IDLE);

                        // save chunks of the recording
                        mediaRecorder.ondataavailable = function(e) {
                            chunks.push(e.data);
                        };

                        // stop record callback
                        mediaRecorder.onstop = function() {
                            var blob,
                                durationMs;

                            self.trigger('stop');

                            if (! self.cancelled) {
                                blob = new Blob(chunks, { type: mimeType });
                                durationMs = new window.Date().getTime() - startTimeMs;
                                self.trigger('recordingavailable', [blob, durationMs]);

                            }
                            cancelAnimationFrame(timerId);

                            self.trigger('levelUpdate', [0]);
                            self._setState(recorderStates.IDLE);

                            chunks = [];
                        };
                    })
                    .catch(function(err) {
                        throw err; //fixme: really?
                    });
            },

            start: function() {
                mediaRecorder.start(chunkSizeMs);

                startTimeMs = new window.Date().getTime();

                this._setState(recorderStates.RECORDING);

                this._monitorRecording();
            },

            stop: function() {
                this.cancelled = false;
                mediaRecorder.stop();
                // state change is triggered by onstop handler
            },

            cancel: function() {
                this.cancelled = true;
                mediaRecorder.stop();
            },

            _monitorRecording: function() {
                var nowMs = new window.Date().getTime(),
                    elapsedSeconds = (nowMs - startTimeMs) / 1000;

                timerId = requestAnimationFrame(this._monitorRecording.bind(this));

                this.trigger('timeupdate', [elapsedSeconds]);
                this.trigger('levelUpdate', [getInputLevel()]);

                if (config.maxRecordingTime > 0 && elapsedSeconds >= config.maxRecordingTime) {
                    this.stop();
                    cancelAnimationFrame(timerId);
                }
            }
        };
        event.addEventMgr(recorder);

        return recorder;
    };
});