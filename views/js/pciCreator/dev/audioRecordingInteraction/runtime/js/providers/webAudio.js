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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
/**
 * This audio processing provider is based on the Web Audio API and is used for un-compressed audio recording (Wav).
 * It delegates the actual Wav-building process to a worker for background processing and improved performances.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/promise',
    'taoQtiItem/portableLib/OAT/util/event'
], function(_, Promise, event) {
    'use strict';

    /**
     * @param {Object} config
     * @param {Number} config.isStereo
     */
    return function webAudioProviderFactory(config, assetManager) {
        var webAudioProvider;

        // todo: it would be nice to use a bundled and minified version of the worker.
        // Leaving it as it is for now as the primary use case for uncompressed recording is offline testing.
        var recorderWorkerPath = 'audioRecordingInteraction/runtime/js/workers/WebAudioRecorderWav.js',
            recorderWorker;

        var audioNodes = {};

        var numChannels = (config.isStereo) ? 2 : 1,
            buffer = [];

        var updateResponsePartially = config.updateResponsePartially;

        /**
         * Load the worker and configure it
         */
        function initWorker() {
            recorderWorker = new Worker(assetManager.resolve(recorderWorkerPath));

            sendToWorker('init', {
                config: {
                    numChannels: numChannels,
                    sampleRate: getAudioContext().sampleRate,
                    updateResponsePartially: updateResponsePartially,
                },
                options: {
                    timeLimit: 0,           // time limit is handled by the provider wrapper
                    progressInterval: 1000, // encoding progress report interval (millisec)
                    wav: {
                        mimeType: "audio/wav"
                    }
                }
            });
        }

        /**
         * Execute a command on the worker. See workers/WebAudioRecorderWav.js for a list of commands and their parameters
         * @param {String} command
         * @param {Object} payload - command parameters, depends on the actual command
         */
        function sendToWorker(command, payload) {
            recorderWorker.postMessage(_.merge({ command: command }, payload));
        }

        /**
         * Expose the Audio context so consumers can use it instead of creating a new one
         * @returns {AudioContext}
         */
        function getAudioContext() {
            return window.audioContext;
        }

        /**
         * The provider
         */
        webAudioProvider = {

            /**
             * Create the base audio nodes and add listeners for worker commands
             * @param {MediaStream} stream
             */
            init: function init(stream) {
                var self = this;

                audioNodes.source = getAudioContext().createMediaStreamSource(stream);
                audioNodes.inputGain = getAudioContext().createGain();

                audioNodes.source.connect(audioNodes.inputGain);

                initWorker();

                recorderWorker.onmessage = function(e) {
                    var data = e.data;
                    var blob;
                    switch (data.command) {
                        case 'partialcomplete':
                            blob = data.blob;
                            self.trigger('partialblobavailable', [blob]);
                            break;

                        case 'complete': {
                            blob = data.blob;
                            self.trigger('blobavailable', [blob]);
                            break;
                        }
                    }
                };
            },

            /**
             * Starting the recording simply consist in connecting the audio input to a ScriptProcessor node.
             * We then forward the buffer data to the Worker for actual processing.
             */
            start: function start() {
                audioNodes.processor = getAudioContext().createScriptProcessor(0, numChannels, numChannels);
                audioNodes.processor.onaudioprocess = function(e) {
                    var ch;
                    for (ch = 0; ch < numChannels; ++ch) {
                        buffer[ch] = e.inputBuffer.getChannelData(ch);
                    }
                    sendToWorker('record', { buffer: buffer });
                };
                audioNodes.inputGain.connect(audioNodes.processor);
                // the scriptProcessor node does not work under Chrome without the following connexion:
                audioNodes.processor.connect(getAudioContext().destination);

                sendToWorker('start', { bufferSize: audioNodes.processor.bufferSize });
            },

            /**
             * Disconnect the script processor node to stop the recording
             */
            _interruptRecording: function _interruptRecording() {
                audioNodes.processor.onaudioprocess = null;
                audioNodes.inputGain.disconnect();
                delete audioNodes.processor;
            },

            /**
             * Stop the recording
             */
            stop: function stop() {
                this._interruptRecording();
                sendToWorker('finish');
            },

            /**
             * Cancel the recording
             */
            cancel: function cancel() {
                this._interruptRecording();
                sendToWorker('cancel');
            },

            /**
             * Close the audio context and destroy created assets
             */
            destroy: function destroy() {
                recorderWorker.terminate();
                recorderWorker = null;

                if (getAudioContext()) {
                    return getAudioContext().close().then(function() {
                        audioNodes = {};
                    });
                }
            }
        };

        event.addEventMgr(webAudioProvider);

        return webAudioProvider;
    };

});
