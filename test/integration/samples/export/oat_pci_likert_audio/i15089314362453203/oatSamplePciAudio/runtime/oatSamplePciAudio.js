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
define([
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/OAT/util/html',
    'oatSamplePciAudio/runtime/js/player',
    'oatSamplePciAudio/runtime/js/recorder',
    'oatSamplePciAudio/runtime/js/uiElements'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    event,
    html,
    playerFactory,
    recorderFactory,
    uiElements
){
    'use strict';

    var ICON_CONTROLS = 'oatSamplePciAudio/runtime/img/controls.svg';
    var ICON_MIC      = 'oatSamplePciAudio/runtime/img/mic.svg';

    var oatSamplePciAudio;

    /**
     * Type casting helpers for PCI parameters
     */
    function toBoolean(value, defaultValue) {
        if (typeof(value) === "undefined") {
            return defaultValue;
        } else {
            return (value === true || value === "true");
        }
    }
    function toInteger(value, defaultValue) {
        return (typeof(value) === "undefined") ? defaultValue : parseInt(value, 10);
    }


    /**
     * The main interaction code
     */
    oatSamplePciAudio = {
        _filePrefix: 'audioRecording',
        _recording: null,
        _recordsAttempts: 0,

        /**
         * Render the PCI
         * @param {Object} config
         */
        render: function render(config) {
            this.$mediaStimulusContainer    = this.$container.find('.audio-rec > .media-stimulus');
            this.$controlsContainer         = this.$container.find('.audio-rec > .controls');
            this.$progressContainer         = this.$container.find('.audio-rec > .progress');
            this.$meterContainer            = this.$container.find('.audio-rec > .input-meter');

            this._recording         = null;
            this._recordsAttempts   = 0;

            this.config             = {};
            this.controls           = {};
            this.iconsFileUrl       = this.assetManager.resolve(ICON_CONTROLS);

            this.initConfig(config);
            this.initRecorder();
            this.initPlayer();
            this.initProgressBar();
            this.initMeter();
            this.initMediaStimulus();
            this.initControls();
            this.updateResetCount();
        },

        /**
         * Initialize the PCI configuration
         * @param {Object}  config
         * @param {Boolean} config.allowPlayback - display the play button
         * @param {Number}  config.audioBitrate - number of bits per seconds for audio encoding
         * @param {Boolean} config.autoStart - start recording immediately after interaction is loaded
         * @param {Boolean} config.displayDownloadLink - for testing purposes only: allow to download the recorded file
         * @param {Number}  config.maxRecords - 0 = unlimited / 1 = no retry / x = x attempts
         * @param {Number}  config.maxRecordingTime - in seconds
         * @param {Boolean} config.useMediaStimulus - will display a media stimulus to the test taker
         * @param {Object}  config.media - media object (handled by the PCI media manager helper)
         */
        initConfig: function init(config) {
            this.config = {
                allowPlayback:          toBoolean(config.allowPlayback, true),
                audioBitrate:           toInteger(config.audioBitrate, 20000),
                autoStart:              toBoolean(config.autoStart, false),
                displayDownloadLink:    toBoolean(config.displayDownloadLink, false),
                maxRecords:             toInteger(config.maxRecords, 3),
                maxRecordingTime:       toInteger(config.maxRecordingTime, 120),
                useMediaStimulus:       toBoolean(config.useMediaStimulus, false),
                media:                  config.media || {}
            };
        },

        /**
         * Instanciate the recorder and its event listeners
         */
        initRecorder: function initRecorder() {
            var self = this;

            this.recorder = recorderFactory(this.config);

            this.recorder.on('stop', function() {
                self.progressBar.setValue(0);
                self.progressBar.setStyle('');
                if (self.config.maxRecordingTime) {
                    self.progressBar.setMax(self.config.maxRecordingTime);
                }
                self.$meterContainer.removeClass('record');
            });

            this.recorder.on('recordingavailable', function(blob, durationMs) {
                var recordingUrl = window.URL && window.URL.createObjectURL && window.URL.createObjectURL(blob),
                    filename =
                        self._filePrefix + '_' +
                        window.Date.now() + '.' +
                        // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
                        blob.type.split(';')[0].split('/')[1],
                    filesize = blob.size;

                self._recordsAttempts++;

                self.player.load(recordingUrl);

                self.createBase64Recoding(blob, filename);

                self.displayDownloadLink(recordingUrl, filename, filesize, durationMs);
            });

            this.recorder.on('statechange', function() {
                self.updateControls();
            });

            this.recorder.on('timeupdate', function(currentTime) {
                self.progressBar.setValue(currentTime);
            });

            this.recorder.on('levelUpdate', function(level) {
                self.inputMeter.draw(level);
            });
        },

        /**
         * Instanciate the audio player and its event listeners.
         * This player is only for the playback of the recording. The stimulus uses its own player.
         */
        initPlayer: function initPlayer() {
            var self = this;

            this.player = playerFactory();

            this.player.on('statechange', function() {
                self.updateControls();
            });

            this.player.on('idle', function() {
                self.progressBar.setStyle('');
            });

            this.player.on('timeupdate', function(currentTime) {
                self.progressBar.setValue(currentTime);
            });

            this.player.on('durationchange', function(durationSeconds) {
                self.progressBar.setMax(durationSeconds);
            });
        },

        /**
         * Create the progress bar object
         */
        initProgressBar: function initProgressBar() {
            this.progressBar = uiElements.progressBarFactory({
                $container: this.$progressContainer
            });
        },

        /**
         * Create the input meter object
         */
        initMeter: function initMeter() {
            var $micIcon = this.$meterContainer.find('.mic');

            $micIcon.empty();
            $micIcon.append($('<img>',
                { src: this.assetManager.resolve(ICON_MIC)}
            ));

            this.inputMeter = uiElements.inputMeterFactory({
                $container: this.$meterContainer.find('.leds'),
                maxLevel: 100 // this is closely related to the values analyser.minDecibels and analyser.maxDecibels in recorderFactory
            });
        },

        /**
         * Instanciate the media stimulus player and its event listeners
         * This player is only for the playback of the stimulus. The recorded audio uses its own player.
         */
        initMediaStimulus: function initMediaStimulus() {
            var self = this;

            if (this.hasMediaStimulus()) {
                this.$mediaStimulusContainer.addClass('active');

                this.mediaStimulus = uiElements.mediaStimulusFactory({
                    $container:   this.$mediaStimulusContainer,
                    assetManager: this.assetManager,
                    media:        this.config.media
                });

                this.mediaStimulus.on('statechange', function() {
                    self.updateControls();
                });

                this.mediaStimulus.on('playing', function() {
                    if (self.recorder.is('recording')) {
                        self.recorder.cancel();
                    }
                    if (self.player.is('playing')) {
                        self.player.stop();
                    }
                });

                this.mediaStimulus.on('ended', function() {
                    if (self.config.autoStart) {
                        self.startRecording();
                    }
                });
                this.mediaStimulus.render();

            } else {
                this.$mediaStimulusContainer.empty();
                this.$mediaStimulusContainer.removeClass('active');
            }
        },

        /**
         * Check if the item has a media stimulus defined
         * @returns {Boolean}
         */
        hasMediaStimulus: function hasMediaStimulus() {
            return (this.config.useMediaStimulus && this.config.media && this.config.media.uri);
        },

        /**
         * Check if the media stimulus has been played
         * @returns {Boolean}
         */
        mediaStimulusHasPlayed: function mediaStimulusHasPlayed() {
            return this.mediaStimulus && (this.mediaStimulus.is('ended') || this.mediaStimulus.is('disabled'));
        },

        /**
         * Starts the recording if has permission to access the mic. If not, ask for it.
         */
        startRecording: function startRecording() {
            var self = this;

            if (this.recorder.is('created')) {
                this.recorder.init().then(function() {
                    startForReal();
                });
                // We don't catch anything here as this is not a reliable way to determine if the user has accepted or not.
                // Clicking outside the auth request dialog closes the dialog but doesn't reject the Promise...
            } else {
                startForReal();
            }

            function startForReal() {
                self.resetRecording();
                self.recorder.start();
                if (self.config.maxRecordingTime) {
                    self.$meterContainer.addClass('record');
                    self.progressBar.setStyle('record');
                    self.progressBar.setMax(self.config.maxRecordingTime);
                }
                self.updateControls();
            }
        },

        /**
         * Stop the current recording
         */
        stopRecording: function stopRecording() {
            this.recorder.stop();
            this.updateControls();
        },

        /**
         * Stop the playback of the recording
         */
        stopPlayback: function stopPlayback() {
            this.player.stop();
            this.updateControls();
        },

        /**
         * Start the playback of the recording
         */
        playRecording: function playRecording() {
            this.player.play();
            this.progressBar.setStyle('playback');
            this.updateControls();
        },

        /**
         * Clear the PCI response and reset the player
         */
        resetRecording: function resetRecording() {
            this.player.unload();
            this.updateResponse(null);
            this.updateControls();
        },

        /**
         * This function is called when the recordings ends.
         * It creates a base64 encoded file from the output of the recorder and stores it as the PCI response.
         * @param {Blob} blob - the recording
         * @param {String} filename - will be part of the QTI response
         */
        createBase64Recoding: function createBase64Recoding(blob, filename) {
            var self = this;

            /**
             * TODO:
             * implement a spinner or something to feedback that work is in progress while this is happening:
             * as the response is not yet ready, the user shouldn't leave the item in the meantime.
             * The asynchronous nature of this operation might also be problematic for saving the recording
             * when the user exit the item in the middle of a recording (destroy() on the PCI interface should be implemented as a Promise)
             */
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function onLoadEnd(e) {
                var base64Raw = e.target.result,
                    commaPosition = base64Raw.indexOf(','),
                    base64Data = base64Raw.substring(commaPosition + 1),
                    recording = {
                        mime: blob.type,
                        name: filename,
                        data: base64Data
                    };
                self.updateResponse(recording);
            };
        },

        /**
         * Update the PCI response. The recording parameter should follow the QTI 'file' response type
         * @param {Object} recording
         * @param {String} recording.mime - mime type of the file
         * @param {String} recording.name - filename
         * @param {String} recording.data - base64 encoded file
         */
        updateResponse: function updateResponse(recording) {
            this._recording = recording;
            if (typeof this.trigger === 'function') {
                this.trigger('responseChange'); // this has to be camelcase
            }
        },

        /**
         * Update the reset recording button with the number of remaining attempts
         */
        updateResetCount: function updateResetCount() {
            var remaining = this.config.maxRecords - this._recordsAttempts - 1,
                resetLabel = this.getControlIcon('reset');

            if (this.config.maxRecords > 1) {
                resetLabel += ' (' + remaining + ')';
            }
            if (this.controls.reset) {
                this.controls.reset.updateLabel(resetLabel);
            }
        },

        /**
         * Add a download link for the recording to the document body (! see inline comment).
         * This is to be used for testing purposes only.
         * @param {String} url
         * @param {String} filename
         * @param {Number} filesize - in Bytes, size of the recording
         * @param {Number} durationMs - length of the recording
         */
        displayDownloadLink: function displayDownloadLink(url, filename, filesize, durationMs) {
            var downloadLink;

            if (this.config.displayDownloadLink === true) {
                downloadLink = document.createElement('a');
                // fixme: append the link in a better place
                // container.appendChild(downloadLink); // doesn't work in FF... (nothing happens when link is clicked)
                document.body.appendChild(downloadLink); // but this works !!!
                document.body.appendChild(document.createElement('br'));
                downloadLink.text =
                    'download ' + this._recordsAttempts + ' - ' +
                    Math.round(filesize / 1000) + 'KB - ' +
                    Math.round(durationMs / 1000) + 's';
                downloadLink.download = filename;
                downloadLink.href = url;
            }
        },

        /**
         * Create the recorder controls
         */
        initControls: function initControls() {
            var self = this,
                record,
                stop,
                play,
                reset;

            this.$controlsContainer.empty();
            this.controls = {};

            // Record button
            record = uiElements.controlFactory({
                id: 'record',
                label: this.getControlIcon('record'),
                container: this.$controlsContainer
            });
            record.on('click', function() {
                if (this.is('enabled')) {
                    self.startRecording();
                }
            }.bind(record));
            record.on('updatestate', function() {
                if (self.player.is('created')
                    && !self.recorder.is('recording')
                    && (
                        self.hasMediaStimulus() && self.mediaStimulusHasPlayed()
                        || ! self.hasMediaStimulus()
                    )
                ) {
                    this.enable();
                } else {
                    this.disable();
                }
            }.bind(record));
            this.controls.record = record;


            // Stop button
            stop = uiElements.controlFactory({
                id: 'stop',
                label: this.getControlIcon('stop'),
                container: this.$controlsContainer
            });
            stop.on('click', function() {
                if (this.is('enabled')) {
                    if (self.recorder.is('recording')) {
                        self.stopRecording();

                    } else if (self.player.is('playing')) {
                        self.stopPlayback();
                    }
                }
            }.bind(stop));
            stop.on('updatestate', function() {
                if (self.player.is('playing')
                    || self.recorder.is('recording')) {
                    this.enable();
                } else {
                    this.disable();
                }
            }.bind(stop));
            this.controls.stop = stop;


            // Play button
            if (this.config.allowPlayback === true) {
                play = uiElements.controlFactory({
                    id: 'play',
                    label: this.getControlIcon('play'),
                    container: this.$controlsContainer
                });
                play.on('click', function() {
                    if (this.is('enabled')) {
                        self.playRecording();
                    }
                }.bind(play));
                play.on('updatestate', function() {
                    if (self.player.is('idle')) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }.bind(play));
                this.controls.play = play;
            }


            // Reset button
            if (this.config.maxRecords !== 1) {
                reset = uiElements.controlFactory({
                    id: 'reset',
                    label: this.getControlIcon('reset'),
                    container: this.$controlsContainer
                });
                reset.on('click', function() {
                    if (this.is('enabled')) {
                        self.resetRecording();
                        self.updateResetCount();
                    }
                }.bind(reset));
                reset.on('updatestate', function() {
                    if (self.config.maxRecords > 1 && self.config.maxRecords === self._recordsAttempts) {
                        this.disable();
                    } else if (self.player.is('idle')) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }.bind(reset));
                this.controls.reset = reset;
            }

            self.updateControls();
        },

        /**
         * Update the state of all the controls
         */
        updateControls: function updateControls() {
            _.invoke(this.controls, 'updateState');
        },

        /**
         * Destroy the state of all the controls
         */
        destroyControls: function destroyControls() {
            _.invoke(this.controls, 'destroy');
            this.controls = null;
        },

        /**
         * Get the svg markup for a given iconId
         * @param {String} iconId
         * @returns {string}
         */
        getControlIcon: function getControlIcon(iconId) {
            return '<svg title="' + iconId + '">' +
                '<use xlink:href="' + this.iconsFileUrl + '#' + iconId + '"/>' +
                '</svg>';
        },




        /**
         * PCI public interface
         */

        id: -1,

        getTypeIdentifier: function getTypeIdentifier() {
            return 'oatSamplePciAudio';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         * @param {Object} assetManager
         */
        initialize: function initialize(id, dom, config, assetManager) {
            var self = this;

            event.addEventMgr(this);

            this.id = id;
            this.assetManager = assetManager;
            this.$container = $(dom);

            this.render(config);

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            this.on('configChange', function (newConfig) {
                self.render(newConfig);
            });

            // render rich text content in prompt
            html.render(this.$container.find('.prompt'));

            if (this.config.autoStart === true && this.config.useMediaStimulus === false) {
                self.startRecording();
            }
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse: function setResponse(response) {
            var recording = response.base && response.base.file,
                base64Prefix;

            if (recording) {
                this.updateResponse(recording);

                // restore interaction state
                base64Prefix = 'data:' + recording.mime + ';base64,';
                this.player.load(base64Prefix + recording.data);
            }
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse: function getResponse() {
            var response = {
                base: {
                    file: this._recording
                }
            };
            return response ;
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function resetResponse() {
            this.updateResponse(null);
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function destroy() {
            if (this.recorder && this.recorder.is('recording')) {
                this.stopRecording();
            }
            if (this.player && this.player.is('playing')) {
                this.stopPlayback();
            }

            this.destroyControls();

            if (this.inputMeter) {
                this.inputMeter.destroy();
                this.inputMeter = null;
            }

            this.progressBar = null;

            if (this.mediaStimulus) {
                this.mediaStimulus.destroy();
                this.mediaStimulus = null;
            }

            if (this.player) {
                this.player.unload();
                this.player = null;
            }

            if (this.recorder) {
                this.recorder.destroy();
                this.recorder = null;
            }

            this.resetResponse();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState: function setSerializedState(state) {
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function getSerializedState() {
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(oatSamplePciAudio);
});