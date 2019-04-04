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
    'taoQtiItem/portableLib/OAT/promise',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/OAT/util/html',
    'audioRecordingInteraction/runtime/js/player',
    'audioRecordingInteraction/runtime/js/recorder',
    'audioRecordingInteraction/runtime/js/uiElements',
    'text!audioRecordingInteraction/runtime/img/mic.svg'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    Promise,
    event,
    html,
    playerFactory,
    recorderFactory,
    uiElements,
    micIcon
){
    'use strict';

    var ICON_CONTROLS = 'audioRecordingInteraction/runtime/img/controls.svg';

    var audioRecordingInteraction;

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

    function getFileName(filePrefix, blob) {
        return filePrefix + '_' +
            window.Date.now() + '.' +
            // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
            blob.type.split(';')[0].split('/')[1];
    }

    /**
     * The main interaction code
     */
    audioRecordingInteraction = {
        _filePrefix: 'audioRecording',
        _recording: null,
        _recordsAttempts: 0,
        _delayCallback: null,

        _cleanDelayCallback: function _cleanDelayCallback() {
            if (this._delayCallback) {
                clearTimeout(this._delayCallback);
                this._delayCallback = null;
            }
        },

        /**
         * Gets the delay before auto-start of recording, in seconds
         * @returns {Number}
         */
        getDelayInSeconds: function getDelayInSeconds() {
            return this.config.delayMinutes * 60 + this.config.delaySeconds;
        },

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
            this.initRecording();
        },

        /**
         * Initialize the PCI configuration
         * @param {Object}  config
         * @param {Boolean} config.allowPlayback - display the play button
         * @param {Boolean} config.autoStart - start recording immediately after interaction is loaded
         * @param {Number}  config.delaySeconds - seconds delay before start recording
         * @param {Number}  config.delayMinutes - minutes delay before start recording
         * @param {Number}  config.maxRecords - 0 = unlimited / 1 = no retry / x = x attempts
         * @param {Number}  config.maxRecordingTime - in seconds
         * @param {Boolean} config.isCompressed - set the recording format between compressed and uncompressed
         * @param {Number}  config.audioBitrate - number of bits per seconds for audio encoding
         * @param {Boolean} config.isStereo - switch the number of channels (1 vs 2) for uncompressed recording
         * @param {Boolean} config.useMediaStimulus - will display a media stimulus to the test taker
         * @param {Object}  config.media - media object (handled by the PCI media manager helper)
         * @param {Boolean} config.displayDownloadLink - for testing purposes only: allow to download the recorded file
         * @param {Boolean} config.updateResponsePartially - enable/disable the partial response update (may affect the performance)
         */
        initConfig: function init(config) {
            this.config = {
                allowPlayback:           toBoolean(config.allowPlayback, true),
                autoStart:               toBoolean(config.autoStart, false),

                delaySeconds:            toInteger(config.delaySeconds, 0),
                delayMinutes:            toInteger(config.delayMinutes, 0),

                maxRecords:              toInteger(config.maxRecords, 3),
                maxRecordingTime:        toInteger(config.maxRecordingTime, 120),

                isCompressed:            toBoolean(config.isCompressed, true),
                audioBitrate:            toInteger(config.audioBitrate, 20000),
                isStereo:                toBoolean(config.isStereo, false),

                useMediaStimulus:        toBoolean(config.useMediaStimulus, false),
                media:                   config.media || {},

                displayDownloadLink:     toBoolean(config.displayDownloadLink, false),
                updateResponsePartially: toBoolean(config.updateResponsePartially, false)
            };
        },

        /**
         * Instanciate the recorder and its event listeners
         */
        initRecorder: function initRecorder() {
            var self = this;

            this.recorder = recorderFactory(this.config, this.assetManager);

            this.recorder.on('cancel', function() {
                self.progressBar.reset();
                self.$meterContainer.removeClass('record');
            });

            this.recorder.on('recordingavailable', function(blob, durationMs) {
                var recordingUrl = window.URL && window.URL.createObjectURL && window.URL.createObjectURL(blob),
                    filename = getFileName(self._filePrefix, blob),
                    filesize = blob.size;

                self._recordsAttempts++;

                self.player.load(recordingUrl);

                self.createBase64Recoding(blob, filename);

                self.displayDownloadLink(recordingUrl, filename, filesize, durationMs);
            });

            this.recorder.on('partialrecordingavailable', function(blob) {
                var filename = getFileName(self._filePrefix, blob);

                self.createBase64Recoding(blob, filename);
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
            this.progressBar = uiElements.progressBarFactory(this.$progressContainer, this.config);
        },

        /**
         * Create the input meter object
         */
        initMeter: function initMeter() {
            var $micIcon = this.$meterContainer.find('.mic');

            $micIcon.empty();
            $micIcon.append(micIcon);

            this.inputMeter = uiElements.inputMeterFactory({
                $container: this.$meterContainer.find('.leds'),
                maxLevel: 100 // this is closely related to the values analyser.minDecibels and analyser.maxDecibels in recorderFactory
            });
        },

        initRecording: function initRecording() {
            var delayInSeconds = this.getDelayInSeconds();
            var self = this;
            this.ctrCache = {};

            // no auto start, don't start recording
            if (this.config.autoStart !== true) {
                return;
            }

            // no delay and no media stimulus, start recording now
            if (delayInSeconds === 0 && !this.hasMediaStimulus()) {
                this.startRecording();
                return;
            }

            // cache controls states
            _.forEach(this.controls, function(ctr, id) {
                self.ctrCache[id] = ctr.getState();
                ctr.disable();
            });

            if (delayInSeconds > 0) {
                // init countdown
                this.initCountdown();
            }

            if(this.hasMediaStimulus()) {
                return;
            }

            this.initDelay();
        },

        initDelay: function initDelay() {
            var self = this;

            // cleaning up delay callback
            this._cleanDelayCallback();

            // waiting for permission
            this.askPermissionAccessMic(function() {

                self.countdown.start();

                // adding a delay before start recording...
                self._delayCallback = setTimeout(function() {

                    self.countdown.destroy();

                    // restore controls states
                    _.forEach(self.controls, function(ctr, id) {
                        ctr.setState(self.ctrCache[id]);
                    });

                    self._cleanDelayCallback();

                    if (!self.hasMediaStimulus() || self.hasMediaStimulus() && self.mediaStimulusHasPlayed()) {
                        self.startRecording();
                    } else {
                        self.updateControls();
                    }

                }, self.getDelayInSeconds() * 1000);
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
                    // if set autoStart recording without delay - startRecording
                    // if set autoStart recording with delay and countdown is displayed - initDelay
                    if (self.config.autoStart && !self.config.delayMinutes && !self.config.delaySeconds) {
                        self.startRecording();
                    } else if(self.config.autoStart && self.countdown && self.countdown.isDisplayed()) {
                        self.initDelay();
                    }
                });
                this.mediaStimulus.render();

            } else {
                this.$mediaStimulusContainer.empty();
                this.$mediaStimulusContainer.removeClass('active');
            }
        },
        /**
         * Create countdown timer
         */
        initCountdown: function initCountdown() {
            if (this.config.autoStart === true) {
                this.countdown = uiElements.countdownPieChartFactory({
                    $container: this.$meterContainer.find('.countdown-pie-chart'),
                    delayInSeconds: this.getDelayInSeconds()
                });
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
         * Init recording if no permission to access the mic, ask for it.
         */
        askPermissionAccessMic: function askPermissionAccessMic(callback) {
            // recorder instance created, but microphone access not granted
            if(this.recorder && this.recorder.is('created')) {
                this.recorder.init()
                    .then(function() {
                        callback();
                    })
                    .catch(function(err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    });
            }
            // ready to record, microphone access is granted
            if(this.recorder && this.recorder.is('idle')) {
                callback();
            }
        },

        /**
         * Starts the recording if has permission to access the mic. If not, ask for it.
         */
        startRecording: function startRecording() {
            var self = this;

            if (this.recorder.is('created')) { // if recorder is not initialised yet
                this.recorder.init()
                    .then(function() {
                        startForReal();
                    })
                    .catch(function(err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    });
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
         * Set recording data
         * @param {Object} data
         */
        setRecording: function setRecording(data) {
            this._recording = data;
        },

        /**
         * Get recording data
         * @returns {Object|null} _recording
         */
        getRecording: function getRecording() {
            return this._recording;
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

                // now that the response is ready, we can turn off the visual recording feedback that we had had let
                // "turned on" as a hint to the test taker that the recording was not completely over,
                // and that he should not leave the item yet. In most case, this little delay should go completely unnoticed.
                self.progressBar.reset();
                self.$meterContainer.removeClass('record');
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
            this.setRecording(recording);
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
                    && !self.getRecording()
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
                    if (self.player.is('idle') || self.getRecording()) {
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
            // dont't change controls state, waiting for delay callback
            if (this._delayCallback || this.countdown && this.countdown.isDisplayed()) {
                return;
            }
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
            return 'audioRecordingInteraction';
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
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse: function setResponse(response) {
            var recording = response.base && response.base.file;

            if (recording) {
                this.updateResponse(recording);

                // restore interaction state
                this.player.loadFromBase64(recording.data, recording.mime);
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
            var response;

            if (this.getRecording()) {
                response = { file: this.getRecording() };
            }
            return {
                base: response
            };
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
            var self = this;
            var promises = [];

            if (self.recorder && self.recorder.is('recording')) {
                promises.push(self.stopRecording());
            }
            if (self.player && self.player.is('playing')) {
                promises.push(self.stopPlayback());
            }

            promises.push(self.destroyControls());

            if (self.inputMeter) {
                promises.push(self.inputMeter.destroy());
            }

            if (self.mediaStimulus) {
                promises.push(self.mediaStimulus.destroy());
            }

            if (self.player) {
                promises.push(self.player.unload());
            }

            if (self.recorder) {
                promises.push(self.recorder.destroy());
            }

            promises.push(self.resetResponse());

            self._cleanDelayCallback();

            return Promise.all(promises).then(
                function() {
                    self.inputMeter = null;
                    self.progressBar = null;
                    self.mediaStimulus = null;
                    self.player = null;
                    self.recorder = null;
                }
            );
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

    qtiCustomInteractionContext.register(audioRecordingInteraction);
});
