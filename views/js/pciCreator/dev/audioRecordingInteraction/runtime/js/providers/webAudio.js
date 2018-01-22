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
 * This audio processing provider is based on the Web Audio API.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'lodash',
    'taoQtiItem/portableLib/OAT/util/event'
], function(_, event) {
    'use strict';

    /**
     * @param {Object} config
     * @param {Number} config.isStereo
     * @param {Number} config.pcmSampleRate
     */
    return function webAudioProviderFactory(config, assetManager) {
        var webAudioProvider;

        var recorderWorkerPath = 'audioRecordingInteraction/runtime/js/workers/WebAudioRecorderWav.js', // todo: use min version
            recorderWorker;

        var audioContext = new (window.AudioContext || window.webkitAudioContext)(),
            audioNodes = {};

        var numChannels = (config.isStereo) ? 2 : 1,
            bufferSize = 2048, //todo: make this a parameter
            buffer = [];

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

        webAudioProvider = {
            init: function init(stream) {
                var self = this;

                initWorker();

                // create base audio nodes
                audioNodes.source = audioContext.createMediaStreamSource(stream);
                audioNodes.volume = audioContext.createGain();

                audioNodes.source.connect(audioNodes.volume);

                recorderWorker.onmessage = function(e) {
                    var data = e.data;
                    var blob;
                    switch (data.command) {
                        case 'complete': {
                            blob = data.blob;
                            self.trigger('blobavailable', [blob]);
                            break;
                        }
                        case 'error': {
                            window.console.error(data.message);
                            break;
                        }
                        case 'timeout': {
                            console.log('TIMEOUT !');
                            break;
                        }
                    }
                };
            },

            start: function start() {
                audioNodes.processor = audioContext.createScriptProcessor(bufferSize, numChannels, numChannels);
                audioNodes.processor.onaudioprocess = function(e) {
                    var ch;
                    for (ch = 0; ch < numChannels; ++ch) {
                        buffer[ch] = e.inputBuffer.getChannelData(ch);
                    }
                    sendToWorker('record', { buffer: buffer });
                };
                audioNodes.volume.connect(audioNodes.processor);

                sendToWorker('start', { bufferSize: bufferSize });
            },

            _interruptRecording: function _interruptRecording() {
                audioNodes.processor.onaudioprocess = null;
                audioNodes.volume.disconnect();
                delete audioNodes.processor;
            },

            stop: function stop() {
                this._interruptRecording();
                sendToWorker('finish');
            },

            cancel: function cancel() {
                this._interruptRecording();
                sendToWorker('cancel');
            },

            destroy: function destroy() {
                if (audioContext) {
                    audioContext.close();
                    audioNodes = {};
                }
                // close worker ?
            }
        };

        event.addEventMgr(webAudioProvider);

        return webAudioProvider;
    };

});