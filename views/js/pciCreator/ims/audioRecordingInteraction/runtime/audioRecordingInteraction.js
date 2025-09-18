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
 * Copyright (c) 2017-2023 (original work) Open Assessment Technologies SA;
 */
/* eslint-disable func-names */
define([
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/OAT/util/event',
    'audioRecordingInteraction/runtime/js/player',
    'audioRecordingInteraction/runtime/js/recorder',
    'audioRecordingInteraction/runtime/js/uiElements',
    'text!audioRecordingInteraction/runtime/img/mic.svg',
    'text!audioRecordingInteraction/runtime/img/play.svg',
    'text!audioRecordingInteraction/runtime/img/record.svg',
    'text!audioRecordingInteraction/runtime/img/reset.svg',
    'text!audioRecordingInteraction/runtime/img/stop.svg',
    'text!audioRecordingInteraction/runtime/img/delete.svg',
    'css!audioRecordingInteraction/runtime/css/audioRecordingInteraction'
], function (
    qtiCustomInteractionContext,
    $,
    event,
    playerFactory,
    recorderFactory,
    uiElements,
    micIcon,
    playIcon,
    recordIcon,
    resetIcon,
    stopIcon,
    deleteIcon
) {
    'use strict';

    var _typeIdentifier = 'audioRecordingInteraction';
    var audioRecordingInteractionFactory;

    /**
     * Type casting helpers for PCI parameters
     * @param {String, boolean} value
     * @param {String, boolean} defaultValue
     * @returns {boolean}
     */
    function toBoolean(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        } else if (value === '') {
            return false;
        } else {
            return value === true || value === 'true';
        }
    }

    function toInteger(value, defaultValue) {
        return typeof value === 'undefined' || value === '' ? defaultValue : parseInt(value, 10);
    }

    function getFileName(filePrefix, blob) {
        return (
            filePrefix +
            '_' +
            window.Date.now() +
            '.' +
            // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
            blob.type.split(';')[0].split('/')[1]
        );
    }

    /**
     * audioRecordingInteractionFactory
     * for each interaction should be created new Object
     * because audioRecordingInteraction stores controls, handle events
     *
     * @returns {Object} audioRecordingInteraction
     */
    audioRecordingInteractionFactory = function (dispatchInteractiontraceEvent) {
        return {
            _filePrefix: 'audioRecording',
            _recording: null,
            _recordsAttempts: 0,
            _isAutoPlayingBack: false,
            _delayCallback: null,

            /*********************************
             *
             * IMS specific PCI API property and methods
             * also see below typeIdentifier and getInstance
             *
             *********************************/

            /**
             * Get the current state fo the PCI
             * @returns {Object}
             */
            getState: function getState() {
                //simply mapped to existing TAO PCI API
                return this.getSerializedState();
            },

            /**
             * Called by delivery engine when PCI is fully completed
             */
            oncompleted: function oncompleted() {
                this.destroy();
            },

            /*********************************
             *
             * TAO and IMS shared PCI API methods
             *
             *********************************/
            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @returns {Object}
             */
            getResponse: function getResponse() {
                var response = null;

                if (this.getRecording()) {
                    response = { file: this.getRecording() };
                }
                return {
                    base: response
                };
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             * Event listeners are removed and the state and the response are reset
             *
             * @returns {Promise}
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

                if (self.player) {
                    promises.push(self.player.unload());
                }

                if (self.recorder) {
                    promises.push(self.recorder.destroy());
                }

                if (self.beepPlayer) {
                    promises.push(self.beepPlayer.destroy());
                }

                promises.push(self.resetResponse());

                self._cleanDelayCallback();

                return Promise.all(promises).then(function () {
                    self.inputMeter = null;
                    self.progressBar = null;
                    self.player = null;
                    self.recorder = null;
                    self.beepPlayer = null;
                });
            },

            /*********************************
             *
             * TAO specific PCI API methods
             *
             *********************************/

            /**
             * Get the type identifier of a pci
             * @returns {string}
             */
            getTypeIdentifier: function getTypeIdentifier() {
                return _typeIdentifier;
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

                this.on('configChange', function (newConfig) {
                    self.render(newConfig);
                });
            },
            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} response
             */
            setResponse: function setResponse(response) {
                var recording = response && response.base && response.base.file;

                if (recording) {
                    this.updateResponse(recording);

                    // restore interaction state
                    this.player.loadFromBase64(recording.data, recording.mime);
                }
            },
            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             */
            resetResponse: function resetResponse() {
                this.updateResponse(null);
            },
            /**
             * Restore the state of the interaction from the serializedState.
             *
             * @param {Object} state - json format
             */
            setSerializedState: function setSerializedState(state) {
                if (state && typeof state === 'object' && state.hasOwnProperty('response')) {
                    this.setResponse(state.response);
                    if (typeof state.recordsAttempts === 'number' && state.recordsAttempts >= 0) {
                        this._recordsAttempts = state.recordsAttempts;
                        this.updateResetCount();
                    }
                } else {
                    this.setResponse(state);
                }
            },

            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             *
             * @returns {Object} json format
             */
            getSerializedState: function getSerializedState() {
                return {
                    response: this.getResponse(),
                    recordsAttempts: this._recordsAttempts
                };
            },
            /*********************************
             *
             * The rest methods
             *
             *********************************/
            /**
             * @returns {Boolean} - Are we in a TAO QTI Creator context?
             */
            inQtiCreator: function inQtiCreator() {
                if (typeof this._inQtiCreator === 'undefined' && this.$container) {
                    this._inQtiCreator =
                        this.$container.hasClass('tao-qti-creator-context') ||
                        this.$container.find('.tao-qti-creator-context').length > 0;
                }
                return this._inQtiCreator;
            },

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
                this.$controlsContainer = this.$container.find('.audio-rec > .controls');
                this.$progressContainer = this.$container.find('.audio-rec > .progress');
                this.$meterContainer = this.$container.find('.audio-rec > .input-meter');

                this._recording = null;

                if (typeof this._recordsAttempts === 'undefined') {
                    this._recordsAttempts = 0;
                }

                this.config = {};
                this.controls = {};

                this.initConfig(config);

                this.initRecorder();
                this.initPlayer();
                this.initProgressBar();
                this.initMeter();
                this.initControls();
                this.initBeepPlayer();
                this.updateResetCount();
                this.initRecording();
                this.updateAriaLabel();

                if (this.config.enableDomEvents) {
                    // incoming events

                    this.$container.get(0).addEventListener('config-change', ({ detail: newConfig }) => {
                        if (this.config.isDisabled !== newConfig.isDisabled) {
                            this.config.isDisabled = newConfig.isDisabled;
                            this.updateControls();
                        } else {
                            this.render(newConfig);
                        }
                    });

                    // outgoing events

                    const dispatchRecorderStop = (durationMs = 0) => {
                        this.$container.get(0).dispatchEvent(
                            new CustomEvent('recorder-stop', {
                                recordsAttempts: this._recordsAttempts
                            })
                        );
                        dispatchInteractiontraceEvent({
                            domEventType: 'end',
                            duration: durationMs
                        });
                    };
                    if (this.beepPlayer) {
                        this.beepPlayer.on('beep-endsound-played.dispatchrecorderstop', (durationMs) => {
                            dispatchRecorderStop(durationMs);
                        });
                    } else {
                        this.recorder.on('stop', (durationMs) => {
                            dispatchRecorderStop(durationMs);
                        });
                    }

                    this.player.on('playbackend', () => {
                        this.$container.get(0).dispatchEvent(new CustomEvent('playback-end'));
                    });
                }
            },

            /**
             * Initialize the PCI configuration
             * @param {Object}  config
             * @param {Boolean} config.isReviewMode - Is in review mode
             * @param {Boolean} config.isDisabled - Is currently required to appear disabled
             * @param {Boolean} config.allowPlayback - display the play button
             * @param {Boolean} config.hideStopButton - don't display the stop button
             * @param {Boolean} config.autoStart - start recording immediately after interaction is loaded
             * @param {Boolean} config.hideRecordButton - don't display the record button
             * @param {Boolean} config.autoPlayback - immediately playback recording after recording stops
             * @param {Boolean} config.playSound - play beep sound when recording starts and ends
             * @param {Number}  config.delaySeconds - seconds delay before start recording
             * @param {Number}  config.delayMinutes - minutes delay before start recording
             * @param {Number}  config.maxRecords - 0 = unlimited / 1 = no retry / x = x attempts
             * @param {Number}  config.maxRecordingTime - in seconds
             * @param {Boolean} config.isCompressed - set the recording format between compressed and uncompressed
             * @param {Number}  config.audioBitrate - number of bits per seconds for audio encoding
             * @param {Boolean} config.isStereo - switch the number of channels (1 vs 2) for uncompressed recording
             * @param {Object}  config.media - media object (handled by the PCI media manager helper)
             * @param {Boolean} config.displayDownloadLink - for testing purposes only: allow to download the recorded file
             * @param {Boolean} config.updateResponsePartially - enable/disable the partial response update (may affect the performance)
             * @param {Number} config.partialUpdateInterval - number of milliseconds to wait between each recording update
             * @param {Boolean} config.enableDomEvents - to control interaction from outside, dispatch custom events from interaction container, and react to events triggered on it
             */
            initConfig: function init(config) {
                this.config = {
                    isReviewMode: toBoolean(config.isReviewMode, false),
                    isDisabled: toBoolean(config.isDisabled, false),
                    allowPlayback: toBoolean(config.allowPlayback, true),
                    hideStopButton: toBoolean(config.hideStopButton, false),
                    autoStart: toBoolean(config.autoStart, false),
                    hideRecordButton: toBoolean(config.hideRecordButton, false),
                    autoPlayback: toBoolean(config.autoPlayback, false),
                    playSound: toBoolean(config.playSound, false),

                    delaySeconds: toInteger(config.delaySeconds, 0),
                    delayMinutes: toInteger(config.delayMinutes, 0),

                    maxRecords: toInteger(config.maxRecords, 3),
                    maxRecordingTime: toInteger(config.maxRecordingTime, 120),

                    isCompressed: toBoolean(config.isCompressed, true),
                    audioBitrate: toInteger(config.audioBitrate, 20000),
                    isStereo: toBoolean(config.isStereo, false),

                    media: config.media || {},

                    displayDownloadLink: toBoolean(config.displayDownloadLink, false),
                    updateResponsePartially: toBoolean(config.updateResponsePartially, true),
                    partialUpdateInterval: toInteger(config.partialUpdateInterval, 1000),

                    enableDomEvents: toBoolean(config.enableDomEvents, false)
                };
            },

            /**
             * Instanciate the recorder and its event listeners
             */
            initRecorder: function initRecorder() {
                var self = this;

                this.recorder = recorderFactory(this.config);

                this.recorder.on('cancel', function () {
                    self.progressBar.reset();
                    self.$meterContainer.removeClass('record');
                });

                this.recorder.on('recordingavailable', function (blob, durationMs) {
                    var recordingUrl = window.URL && window.URL.createObjectURL && window.URL.createObjectURL(blob),
                        filename = getFileName(self._filePrefix, blob),
                        filesize = blob.size;

                    self.getBase64Recoding(blob, filename)
                        .then(function (recording) {
                            self.updateResponse(recording);

                            // shortcut if the PCI is being destroyed, as in this case some internal properties would be unreachable.
                            if (!self.progressBar || !self.player) {
                                return;
                            }

                            // now that the response is ready, we can turn off the visual recording feedback that we had had let
                            // "turned on" as a hint to the test taker that the recording was not completely over,
                            // and that he should not leave the item yet. In most case, this little delay should go completely unnoticed.
                            self.progressBar.reset();
                            self.$meterContainer.removeClass('record');

                            // load recording in the player
                            self.player.unload();
                            if (self.config.autoPlayback) {
                                self.player.on('oncanplay', function () {
                                    self.player.off('oncanplay');

                                    function doPlayRecording() {
                                        self._isAutoPlayingBack = true;
                                        self.playRecording();
                                        dispatchInteractiontraceEvent({
                                            domEventType: 'play',
                                            autostart: true
                                        });
                                    }
                                    if (self.beepPlayer && self.beepPlayer.getIsPlayingEndSound()) {
                                        self.beepPlayer.on('beep-endsound-played.autoplayback', () => {
                                            self.beepPlayer.off('beep-endsound-played.autoplayback');
                                            doPlayRecording();
                                        });
                                    } else {
                                        doPlayRecording();
                                    }
                                });
                            }
                            self.player.loadFromBase64(recording.data, recording.mime);

                            self.displayDownloadLink(recordingUrl, filename, filesize, durationMs);
                        })
                        .catch(function () {
                            self.resetRecording();
                        });
                });

                this.recorder.on('partialrecordingavailable', function (blob) {
                    var filename = getFileName(self._filePrefix, blob);

                    self.getBase64Recoding(blob, filename)
                        .then(function (recording) {
                            self.updateResponse(recording);
                        })
                        .catch(function () {
                            self.resetRecording();
                        });
                });

                this.recorder.on('statechange', function () {
                    self.updateControls();
                });

                this.recorder.on('timeupdate', function (currentTime) {
                    self.progressBar.setValue(currentTime);
                });

                this.recorder.on('levelUpdate', function (level) {
                    self.inputMeter.draw(level);
                });

                this.recorder.on('stop', function (durationMs) {
                    if (self.beepPlayer) {
                        self.beepPlayer.playEndSound(durationMs).then(() => {
                            self.updateControls();
                        });
                    }
                });
            },

            /**
             * Instanciate the audio player and its event listeners.
             * This player is only for the playback of the recording.
             */
            initPlayer: function initPlayer() {
                var self = this;

                this.player = playerFactory();

                this.player.on('statechange', function () {
                    self.updateControls();
                });

                this.player.on('playbackend', function () {
                    dispatchInteractiontraceEvent({
                        domEventType: 'ended'
                    });
                    self.progressBar.setStyle('');
                    self._isAutoPlayingBack = false;
                });

                this.player.on('timeupdate', function (currentTime) {
                    self.progressBar.setValue(currentTime);
                });

                this.player.on('durationchange', function (durationSeconds) {
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

            /**
             * Instantiate the player that plays beep sound when recording starts and ends
             */
            initBeepPlayer: function initBeepPlayer() {
                if (this.config.playSound === true && this.config.isReviewMode !== true) {
                    this.beepPlayer = uiElements.beepPlayerFactory();
                }
            },

            initRecording: function initRecording() {
                var delayInSeconds = this.getDelayInSeconds();
                var self = this;
                this.ctrCache = {};

                // no auto start, don't start recording
                if (this.config.autoStart !== true || this.config.isReviewMode === true) {
                    return;
                }

                // no delay, start recording now
                if (delayInSeconds === 0 && !this.inQtiCreator()) {
                    this.startRecording();
                    dispatchInteractiontraceEvent({
                        domEventType: 'record',
                        autostart: true
                    });
                    return;
                }

                // cache controls states
                Object.keys(this.controls || {}).forEach(function (id) {
                    var ctr = self.controls[id];
                    self.ctrCache[id] = ctr.getState();
                    ctr.disable();
                });

                if (delayInSeconds > 0 && !this.inQtiCreator()) {
                    // init countdown
                    this.initCountdown();
                }

                if (!this.inQtiCreator()) {
                    this.initDelay();
                }
            },

            initDelay: function initDelay() {
                var self = this;

                // cleaning up delay callback
                this._cleanDelayCallback();

                // waiting for permission
                this.askPermissionAccessMic(function () {
                    self.countdown.start();

                    // adding a delay before start recording...
                    self._delayCallback = setTimeout(function () {
                        self.countdown.destroy();

                        // restore controls states
                        Object.keys(this.controls || {}).forEach(function (id) {
                            var ctr = self.controls[id];
                            ctr.setState(self.ctrCache[id]);
                        });

                        self._cleanDelayCallback();
                        self.startRecording();
                        dispatchInteractiontraceEvent({
                            domEventType: 'record',
                            autostart: true,
                            delay: self.getDelayInSeconds()
                        });
                    }, self.getDelayInSeconds() * 1000);
                });
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
             * Init recording if no permission to access the mic, ask for it.
             * @param {Function} callback
             */
            askPermissionAccessMic: function askPermissionAccessMic(callback) {
                // recorder instance created, but microphone access not granted
                if (this.recorder && this.recorder.is('created')) {
                    this.recorder
                        .init()
                        .then(function () {
                            callback();
                        })
                        .catch(function (err) {
                            // eslint-disable-next-line no-console
                            console.error(err);
                        });
                }
                // ready to record, microphone access is granted
                if (this.recorder && this.recorder.is('idle')) {
                    callback();
                }
            },

            /**
             * Starts the recording if has permission to access the mic. If not, ask for it.
             */
            startRecording: function startRecording() {
                var self = this;

                if (this.recorder.isNeedInit()) {
                    // if recorder is not initialised yet or need create new stream
                    this.recorder
                        .init()
                        .then(function () {
                            return playBeepAndStartRecording();
                        })
                        .catch(function (err) {
                            // eslint-disable-next-line no-console
                            console.error(err);
                        });
                } else {
                    playBeepAndStartRecording();
                }

                function playBeepAndStartRecording() {
                    if (self.beepPlayer) {
                        return self.beepPlayer.playStartSound().then(startForReal);
                    }
                    startForReal();
                }

                function startForReal() {
                    self.resetRecording();
                    self._recordsAttempts++;
                    self.recorder.start();
                    self.updateResetCount();
                    self.$container.get(0).dispatchEvent(new CustomEvent('recorder-start'));
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
                this.updateAriaLabel();
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
                if (this.player) {
                    this.player.play();
                    this.progressBar.setStyle('playback');
                    this.updateControls();
                }
            },

            /**
             * Pause the playback of the recording
             */
            pausePlayback: function pausePlayback() {
                this.player.pause();
                this.updateControls();
            },

            /**
             * Clear the PCI response, reset the player as well as the UI elements
             */
            resetRecording: function resetRecording() {
                this.player.unload();
                this.updateResponse(null);
                this.updateControls();
                this.updateAriaLabel();

                this.progressBar.reset();
                this.$meterContainer.removeClass('record');
                if (this.recorder.is('recording')) {
                    this.recorder.cancel();
                }
                this.$container.get(0).dispatchEvent(new CustomEvent('recorder-reset'));
            },

            /**
             * This function is called when the recordings ends.
             * It creates a base64 encoded file from the output of the recorder and resolves when it's done
             * @param {Blob} blob - the recording
             * @param {String} filename - will be part of the QTI response
             * @returns {Object} recording data structure ready to be stored as the QTI response
             */
            getBase64Recoding: function getBase64Recoding(blob, filename) {
                return new Promise(function (resolve) {
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
                        resolve(recording);
                    };
                });
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
                var isRecording = this.recorder && typeof this.recorder.is === 'function' && this.recorder.is('recording');
                var recordableAmount = (!this.getRecording() && !isRecording) ? 1 : 0,
                    remaining = this.config.maxRecords - this._recordsAttempts - recordableAmount,
                    resetLabel = deleteIcon,
                    canRecordAgain;

                if (this.config.maxRecords > 1) {
                    resetLabel += ' (' + remaining + ')';
                }
                if (this.controls.reset) {
                    this.controls.reset.updateLabel(resetLabel);
                }
                // reflect can-record-again state in the DOM
                canRecordAgain = this.config.maxRecords === 0 || remaining >= 0;
                this.$container.find('.audio-rec').attr('data-disabled', !canRecordAgain);
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
                        'download ' +
                        this._recordsAttempts +
                        ' - ' +
                        Math.round(filesize / 1000) +
                        'KB - ' +
                        Math.round(durationMs / 1000) +
                        's';
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
                this.$controlsContainer.attr('role', 'group');
                this.controls = {};

                // Record button
                if (this.config.hideRecordButton !== true && this.config.isReviewMode !== true) {
                    record = uiElements.controlFactory({
                        id: 'record',
                        label: recordIcon,
                        container: this.$controlsContainer
                    });
                    record.on(
                        'click',
                        function () {
                            if (this.is('enabled')) {
                                self.startRecording();
                                dispatchInteractiontraceEvent({
                                    domEventType: 'record',
                                    target: record.getDOMElement()
                                });
                            }
                        }.bind(record)
                    );
                    record.on(
                        'updatestate',
                        function () {
                            if (self.player.is('created') && !self.recorder.is('recording') && !self.getRecording() && !self.config.isDisabled) {
                                this.enable();
                            } else {
                                this.disable();
                            }
                        }.bind(record)
                    );
                    this.controls.record = record;
                }

                // Stop button
                if (this.config.hideStopButton !== true || this.config.isReviewMode === true) {
                    stop = uiElements.controlFactory({
                        id: 'stop',
                        label: stopIcon,
                        container: this.$controlsContainer
                    });
                    stop.on(
                        'click',
                        function () {
                            if (this.is('enabled')) {
                                if (self.recorder.is('recording')) {
                                    self.stopRecording();
                                    dispatchInteractiontraceEvent({
                                        domEventType: 'stop',
                                        target: stop.getDOMElement()
                                    });
                                } else if (self.player.is('playing')) {
                                    self.stopPlayback();
                                    dispatchInteractiontraceEvent({
                                        domEventType: 'stop',
                                        target: stop.getDOMElement()
                                    });
                                }
                            }
                        }.bind(stop)
                    );
                    stop.on(
                        'updatestate',
                        function () {
                            if (
                                (self.player.is('playing') && !self._isAutoPlayingBack && !self.config.isDisabled) ||
                                self.recorder.is('recording')
                            ) {
                                this.enable();
                            } else {
                                this.disable();
                            }
                        }.bind(stop)
                    );
                    this.controls.stop = stop;
                }

                // Play button
                if (this.config.allowPlayback === true || this.config.isReviewMode === true) {
                    play = uiElements.controlFactory({
                        id: 'play',
                        label: playIcon,
                        container: this.$controlsContainer
                    });
                    play.on(
                        'click',
                        function () {
                            if (this.is('enabled')) {
                                self.playRecording();
                                dispatchInteractiontraceEvent({
                                    domEventType: 'play',
                                    target: play.getDOMElement()
                                });
                            }
                        }.bind(play)
                    );
                    play.on(
                        'updatestate',
                        function () {
                            if (
                                (self.player.is('idle') || (self.getRecording() && !self._isAutoPlayingBack)) &&
                                !(self.beepPlayer && self.beepPlayer.getIsPlayingEndSound()) &&
                                !self.config.isDisabled
                            ) {
                                this.enable();
                            } else {
                                this.disable();
                            }
                        }.bind(play)
                    );
                    this.controls.play = play;
                }

                // Reset button
                if (this.config.maxRecords !== 1 && this.config.isReviewMode !== true) {
                    reset = uiElements.controlFactory({
                        id: 'reset',
                        label: deleteIcon,
                        container: this.$controlsContainer
                    });
                    reset.on(
                        'click',
                        function () {
                            if (this.is('enabled')) {
                                self.resetRecording();
                                self.updateResetCount();
                                dispatchInteractiontraceEvent({
                                    domEventType: 'reset',
                                    target: reset.getDOMElement()
                                });

                                if (self.config.hideRecordButton === true) {
                                    self.startRecording();
                                    dispatchInteractiontraceEvent({
                                        domEventType: 'record',
                                        autostart: true
                                    });
                                }
                            }
                        }.bind(reset)
                    );
                    reset.on(
                        'updatestate',
                        function () {
                            if (self.config.maxRecords > 1 && self.config.maxRecords === self._recordsAttempts) {
                                this.disable();
                            } else if (
                                self.player.is('idle') &&
                                !(self.beepPlayer && self.beepPlayer.getIsPlayingEndSound()) &&
                                !self.config.isDisabled
                            ) {
                                this.enable();
                            } else {
                                this.disable();
                            }
                        }.bind(reset)
                    );
                    this.controls.reset = reset;
                }

                self.updateControls();
            },

            /**
             * Update the state of all the controls
             */
            updateControls: function updateControls() {
                var self = this;
                // dont't change controls state, waiting for delay callback
                if (this._delayCallback || (this.countdown && this.countdown.isDisplayed())) {
                    return;
                }
                Object.keys(this.controls || {}).forEach(function (id) {
                    self.controls[id].updateState();
                });
            },

            /**
             * Destroy the state of all the controls
             */
            destroyControls: function destroyControls() {
                var self = this;
                Object.keys(this.controls || {}).forEach(function (id) {
                    self.controls[id].destroy();
                });
                this.controls = null;
            },

            /**
             * Update the aria-label of the interaction
             */
            updateAriaLabel: function updateAriaLabel() {
                const label = this.getRecording() ? 'Audio recording interaction, with a recording' : 'Audio recording interaction, no recording';
                this.$container.find('.audio-rec').attr('role', 'region').attr('aria-label', label);
            }
        };
    };

    qtiCustomInteractionContext.register({
        /*********************************
         *
         * IMS specific PCI API property and methods
         *
         *********************************/
        typeIdentifier: _typeIdentifier,
        /**
         * initialize the PCI object. As this object is cloned for each instance, using "this" is safe practice.
         * @param {DOMELement} dom - the dom element the PCI can use
         * @param {Object} config - the sandard configuration object
         * @param {Object} [state] - the json serialized state object, returned by previous call to getStatus(), use to initialize an
         */
        getInstance: function getInstance(dom, config, state) {
            const dispatchInteractiontraceEvent = detail => {
                const interactiontraceEvent = new CustomEvent('interactiontrace', {
                    detail,
                    bubbles: true
                });
                dom.dispatchEvent(interactiontraceEvent);
            };

            var response = config.boundTo;
            var responseIdentifier = Object.keys(response)[0];
            var audioRecordingInteraction = audioRecordingInteractionFactory(dispatchInteractiontraceEvent);
            // config.properties.media is serialized string
            // because in tao-item-runner-qti-fe/src/qtiCommonRenderer/renderers/interactions/pci/ims.js:82
            // property value is serialize if it is array or object
            if (config.properties && config.properties.media && typeof config.properties.media === 'string') {
                config.properties.media = JSON.parse(config.properties.media);
            }
            //simply mapped to existing TAO PCI API
            audioRecordingInteraction.initialize(responseIdentifier, dom, config.properties, config.assetManager);
            audioRecordingInteraction.setResponse(response[responseIdentifier]);
            audioRecordingInteraction.setSerializedState(state);

            //tell the rendering engine that I am ready
            if (typeof config.onready === 'function') {
                config.onready(audioRecordingInteraction, audioRecordingInteraction.getState());
            }
        }
    });
});
