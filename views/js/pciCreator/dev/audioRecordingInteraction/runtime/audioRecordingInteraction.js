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
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/util/html',
    'audioRecordingInteraction/runtime/js/player',
    'audioRecordingInteraction/runtime/js/recorder',
    'audioRecordingInteraction/runtime/js/uiElements'
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

    var ICONS_FILE = 'audioRecordingInteraction/runtime/img/controls.svg';

    var audioRecordingInteraction = {

        _filePrefix: 'audioRecording',
        _recording: null,
        _recordsAttempts: 0,

        render: function render(config) {
            // initialization
            this._recording = null;
            this._recordsAttempts = 0;
            this.iconsFileUrl = this.assetManager.resolve(ICONS_FILE);

            this.initConfig(config);
            this.initRecorder();
            this.initPlayer();
            this.initProgressBar();
            this.initMeter();

            // ui rendering
            this.createControls();
            this.updateResetCount();
            this.progressBar.clear();
            this.progressBar.display();
            if (this.config.useMediaStimulus) {
                this.initMediaStimulus();
                this.mediaStimulus.render();
            }

            this.updateControls();
        },

        /**
         * @param {Object}  config
         * @param {Boolean} config.allowPlayback - display the play button
         * @param {Number}  config.audioBitrate - number of bits per seconds for audio encoding
         * @param {Boolean} config.autoStart - start recording immediately after interaction is loaded
         * @param {Boolean} config.displayDownloadLink - for testing purposes only: allow to download the recorded file
         * @param {Number}  config.maxRecords - 0 = unlimited / 1 = no retry / x = x attempts
         * @param {Number}  config.maxRecordingTime - in seconds
         */
        initConfig: function init(config) {
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

            this.config = {
                allowPlayback:          toBoolean(config.allowPlayback, true),
                audioBitrate:           toInteger(config.audioBitrate, 20000),
                autoStart:              toBoolean(config.autoStart, false),
                displayDownloadLink:    toBoolean(config.displayDownloadLink, false),
                maxRecords:             toInteger(config.maxRecords, 3),
                maxRecordingTime:       toInteger(config.maxRecordingTime, 120),
                useMediaStimulus:       toBoolean(config.useMediaStimulus, false),
                replayTimeout:          toBoolean(config.replayTimeout, false),
                media:                  config.media || {}
            };
        },

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
                var recordingUrl = window.URL.createObjectURL(blob),
                    filename =
                        self._filePrefix + '_' +
                        window.Date.now() + '.' +
                        // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
                        blob.type.split(';')[0].split('/')[1],
                    filesize = blob.size;

                self.player.load(recordingUrl);
                self.createBase64Recoding(blob, filename);

                self.progressBar.setMax((durationMs / 1000).toFixed(1));

                self.displayDownloadLink(recordingUrl, filename, filesize, durationMs);
            });

            this.recorder.on('statechange', function() {
                self.updateControls();
            });

            this.recorder.on('timeupdate', function(currentTime) {
                self.progressBar.setValue(currentTime.toFixed(1));
            });

            this.recorder.on('levelUpdate', function(level) {
                self.inputMeter.draw(level);
            });
        },

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
                self.progressBar.setValue(currentTime.toFixed(1));
            });
        },

        initProgressBar: function initProgressBar() {
            this.progressBar = uiElements.progressBarFactory({
                $container: this.$progressContainer
            });
        },

        initMeter: function initMeter() {
            this.inputMeter = uiElements.inputMeterFactory({
                $container: this.$meterContainer.find('.leds'),
                maxLevel: 100 // this is closely related to the values analyser.minDecibels and analyser.maxDecibels in recorderFactory
            });
        },

        initMediaStimulus: function initMediaStimulus() {
            var self = this;

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
        },

        startRecording: function startRecording() {
            var self = this;

            if (this.recorder.is('created')) {
                this.recorder.init().then(function() {
                    startForReal();
                });
            } else {
                startForReal();
            }
            //todo: move this one level up?
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

        stopRecording: function stopRecording() {
            this.recorder.stop();
            this.updateControls();
        },

        stopPlayback: function stopPlayback() {
            this.player.stop();
            this.updateControls();
        },

        playRecording: function playRecording() {
            this.player.play();
            this.progressBar.setStyle('playback');
            this.updateControls();
        },

        resetRecording: function resetRecording() {
            this.player.unload();
            this.updateResponse(null, this._recordsAttempts);
            this.updateControls();
        },

        createBase64Recoding: function createBase64Recoding(blob, filename) {
            var self = this;

            //todo: implement a spinner or something to feedback that work is in progress while this is happening:
            //todo: as the response is not yet ready, the user shouldn't leave the item in the meantime
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
                self.updateResponse(recording, self._recordsAttempts + 1);
            };
        },

        updateResponse: function updateResponse(recording) {
            this._recording = recording;
            if (typeof this.trigger === 'function') {
                this.trigger('responseChange');
            }
        },

        updateResetCount: function updateResetCount() {
            var remaining = this.config.maxRecords - this._recordsAttempts - 1,
                resetLabel = controlIcon(this.iconsFileUrl, 'reset');

            if (this.config.maxRecords > 1) {
                resetLabel += ' (' + remaining + ')';
            }
            if (this.controls.reset) {
                this.controls.reset.updateLabel(resetLabel);
            }
        },

        displayDownloadLink: function displayDownloadLink(url, filename, filesize, duration) {
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
                    Math.round(duration / 1000) + 's';
                downloadLink.download = filename;
                downloadLink.href = url;
            }
        },

        createControls: function createControls() {
            var self = this,

                record,
                stop,
                play,
                reset;

            this.clearControls();


            // Record button
            record = uiElements.controlFactory({
                id: 'record',
                label: controlIcon(this.iconsFileUrl, 'record'),
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
                        self.mediaStimulus && (self.mediaStimulus.is('ended') || self.mediaStimulus.is('disabled'))
                        || ! self.mediaStimulus
                        // todo: make sure this is reseted on render
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
                label: controlIcon(this.iconsFileUrl, 'stop'),
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
                    label: controlIcon(this.iconsFileUrl, 'play'),
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
                    label: controlIcon(this.iconsFileUrl, 'reset'),
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
        },

        updateControls: function updateControls() {
            var control;
            for (control in this.controls) {
                if (this.controls.hasOwnProperty(control)) {
                    this.controls[control].updateState();
                }
            }
        },

        clearControls: function clearControls() {
            this.$controlsContainer.empty();
            //todo: destroy?
            this.controls = {};
        },


        /**
         * PCI public interface
         */

        id: -1,

        getTypeIdentifier: function () {
            return 'audioRecordingInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         * @param {Object} assetManager
         */
        initialize: function (id, dom, config, assetManager) {
            var self = this;

            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.controls = {};
            this.assetManager = assetManager;


            // implement a reset

            this.$container = $(dom);
            this.$mediaStimulusContainer = this.$container.find('.media-stimulus');
            this.$controlsContainer = this.$container.find('.audio-rec > .controls');
            this.$progressContainer = this.$container.find('.audio-rec > .progress');
            this.$meterContainer = this.$container.find('.audio-rec > .input-meter');
            this.$meterContainer.find('.mic').append($('<img>',
                { src: assetManager.resolve('audioRecordingInteraction/runtime/img/mic.svg')}
            ));
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
        setResponse: function (response) {
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
        getResponse: function() {
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
        resetResponse: function () {
            this.updateResponse(null);
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function () {
            this.$container.off('.qtiCommonRenderer');
            if (this.player) {
                this.resetResponse();
                this.player = null;
            }
            if (this.recorder) {
                this.recorder = null;
            }
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState: function (state) {
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function () {
            return this.getResponse();
        }
    };

    function controlIcon(url, iconId) {
        return '<svg title="' + iconId + '">' +
            '<use xlink:href="' + url + '#' + iconId + '"/>' +
            '</svg>';
    }

    qtiCustomInteractionContext.register(audioRecordingInteraction);
});