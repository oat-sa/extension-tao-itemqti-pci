define([
    'qtiCustomInteractionContext',
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/util/html',
    'OAT/mediaPlayer'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    event,
    html,
    mediaPlayerFactory
){
    'use strict';

    var audioRecordingInteraction;

    /**
     * @property {String} CREATED   - player instance created, but no media loaded
     * @property {String} IDLE      - media loaded and playable
     * @property {String} PLAYING   - media is playing
     */
    var playerStates = {
        CREATED:    'created',
        IDLE:       'idle',
        PLAYING:    'playing'
    };

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
     * @property {String} DISABLED  - not clickable
     * @property {String} ENABLED   - clickable
     * @property {String} ACTIVE    - clicked, triggered action is ongoing
     */
    var controlStates = {
        DISABLED: 'disabled',
        ENABLED: 'enabled',
        ACTIVE: 'active'
    };


    /**
     * @returns {Object} - wrapper for an HTMLAudioElement
     */
    function playerFactory() {
        var audioEl,
            player,
            state = playerStates.CREATED;

        player = {
            _setState: function(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(newState);
            },

            getState: function() {
                return state;
            },

            load: function(url) {
                var self = this;

                audioEl = new Audio(url);

                // when playback is stopped by user or when the media is loaded:
                audioEl.oncanplay = function() {
                    self._setState(playerStates.IDLE);
                };

                // when playbacks ends on its own:
                audioEl.onended = function() {
                    self._setState(playerStates.IDLE);
                    audioEl.currentTime = 0;
                    self.trigger('timeupdate', [0]);
                };

                audioEl.onplaying = function() {
                    self._setState(playerStates.PLAYING);
                };

                audioEl.ontimeupdate = function() {
                    self.trigger('timeupdate', [audioEl.currentTime]);
                };
            },

            play: function() {
                audioEl.play();
                // state change has to be triggered by the onplaying listener
            },

            stop: function() {
                audioEl.pause();
                audioEl.currentTime = 0;
                // state change is triggered by the oncanplay listener
            },

            unload: function() {
                audioEl = null;
                this._setState(playerStates.CREATED);
            }
        };
        event.addEventMgr(player);

        return player;
    }

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
    function recorderFactory(config) {
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

            getState: function() {
                return state;
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

                        // build the final recording
                        mediaRecorder.onstop = function() {
                            var blob = new Blob(chunks, { type: mimeType });
                            var duration = new window.Date().getTime() - startTimeMs;

                            cancelAnimationFrame(timerId);
                            self.trigger('levelUpdate', [0]);

                            self.trigger('recordingavailable', [blob, duration]);
                            self._setState(recorderStates.IDLE);

                            chunks = [];
                        };
                    })
                    .catch(function(err) {
                        throw err;
                    });
            },

            start: function() {
                mediaRecorder.start(chunkSizeMs);

                startTimeMs = new window.Date().getTime();

                this._setState(recorderStates.RECORDING);

                this._monitorRecording();
            },

            stop: function() {
                mediaRecorder.stop();
                // state change is triggered by onstop handler
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
    }

    /**
     * Creates a button for recording/playback control
     * @param {Object}  config
     * @param {Number}  config.id - control id
     * @param {String}  config.label - text displayed inside the button
     * @param {String}  config.defaultState - state in which the button will be created
     * @param {$}       config.container - jQuery Dom element that the button will be appended to
     */
    function controlFactory(config) {
        var state,
            control,
            $control = $('<button>', {
                'class': 'audiorec-control',
                'data-identifier': config.id,
                html: config.label
            });

        $control.appendTo(config.container);

        setState(config.defaultState || controlStates.DISABLED);

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        control = {
            getState: function() {
                return state;
            },
            enable: function() {
                setState(controlStates.ENABLED);
            },
            disable: function() {
                setState(controlStates.DISABLED);
            },
            activate: function() {
                setState(controlStates.ACTIVE);
            },
            updateState: function() {
                this.trigger('updatestate');
            },
            updateLabel: function updateLabel(label) {
                $control.html(label);
            }
        };
        event.addEventMgr(control);

        $control.on('click.qtiCommonRenderer', function() {
            control.trigger('click');
        });

        return control;
    }

    function controlIconFactory(assetManager, iconId) {
        var url = assetManager.resolve('audioRecordingInteraction/runtime/img/controls.svg');
        return '<svg title="' + iconId + '">' +
                '<use xlink:href="' + url + '#' + iconId + '"/>' +
            '</svg>';
    }

    /**
     * Creates a progress bar to display recording or playback progress
     * @param {Object}  config
     * @param {$}       config.container - jQuery Dom element that the progress bar will be appended to
     */
    function progressBarFactory(config) {
        var progressBar,
            $progressBar = $('<progress>',{
                value: '0'
            }),
            currentClass;

        progressBar = {
            clear: function() {
                config.$container.empty();
            },

            display: function() {
                config.$container.append($progressBar);
            },

            setMax: function setMax(max) {
                $progressBar.attr('max', max);
            },

            setValue: function setValue(value) {
                $progressBar.attr('value', value);
                $progressBar.text(value);
            },

            setStyle: function setStyle(className) {
                $progressBar.removeClass(currentClass);
                currentClass = className;
                $progressBar.addClass(currentClass);
            }
        };
        return progressBar;
    }


    /**
     * Creates a input meter for microphone input signal
     * @param {Object}  config
     * @param {Integer} config.maxLevel - level for which all meter leds will be lit
     * @param {$}       config.container - jQuery Dom element that the meter will be appended to
     */
    function inputMeterFactory(config) {
        var inputMeter,
            canvas,
            canvasCtx,

            grey    = '#cccccc',
            green   = '#00aa00',
            orange  = '#ff9300',
            red     = '#ff0000',

            ledHeight = 3,
            ledWidth = 10,
            ledPadding = 0,
            ledColors = [
                green, green, green, green, green, green,
                orange, orange, orange, orange,
                red, red, red
            ],
            ledNumbers = ledColors.length,

            width = ledWidth,
            height = (ledHeight * ledNumbers) + (ledPadding * (ledNumbers - 1)),

            scaledLevel;

        canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;

        config.$container.empty();
        config.$container.append($(canvas));

        canvasCtx = canvas.getContext('2d');

        function drawLed(index, color) {
            var x = 0,
                y = (ledHeight + ledPadding) * (ledNumbers - (index + 1));

            canvasCtx.fillStyle = color;
            canvasCtx.fillRect(x, y, ledWidth, ledHeight);
        }

        inputMeter = {
            draw: function(level) {
                var currentColor, i;

                scaledLevel = (level / config.maxLevel * height).toFixed(0);

                for (i = 0; i < ledNumbers; i += 1) {
                    currentColor = grey;
                    if ((i === 0 && scaledLevel > 0)
                        || scaledLevel > (config.maxLevel / ledNumbers * i)) {
                        currentColor = ledColors[i];
                    }
                    drawLed(i, currentColor);
                }
            }
        };

        inputMeter.draw(0);

        return inputMeter;
    }


    /**
     * Main interaction code
     */

    audioRecordingInteraction = {

        _filePrefix: 'audioRecording',
        _recording: null,
        _recordsAttempts: 0,

        render: function render(config) {
            // initialization
            this._recording = null;
            this._recordsAttempts = 0;

            this.initConfig(config);
            this.initRecorder();
            this.initPlayer();
            this.initProgressBar();
            this.initMeter();

            // ui rendering
            this.renderStimulus();
            this.clearControls();
            this.createControls();
            this.displayRemainingAttempts();
            this.progressBar.clear();
            this.progressBar.display();
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
                media:                  config.media || {}
            };
        },

        initRecorder: function initRecorder() {
            var self = this;

            this.recorder = recorderFactory(this.config);

            this.recorder.on('recordingavailable', function(blob, duration) {
                var recordingUrl = window.URL.createObjectURL(blob),
                    filename =
                        self._filePrefix + '_' +
                        window.Date.now() + '.' +
                        // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
                        blob.type.split(';')[0].split('/')[1],
                    filesize = blob.size;

                self.player.load(recordingUrl);
                self.createBase64Recoding(blob, filename);

                self.displayDownloadLink(recordingUrl, filename, filesize, duration);
                self.progressBar.setValue(0);
                self.progressBar.setMax((duration / 1000).toFixed(1));
                self.progressBar.setStyle('');

                self.$meterContainer.removeClass('record');
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
            this.progressBar = progressBarFactory({
                $container: this.$progressContainer
            });
        },

        initMeter: function initMeter() {
            this.inputMeter = inputMeterFactory({
                $container: this.$meterContainer.find('.leds'),
                maxLevel: 100 // this is closely related to the values analyser.minDecibels and analyser.maxDecibels in recorderFactory
            });
        },

        startRecording: function startRecording() {
            var self = this;

            if (this.recorder.getState() === recorderStates.CREATED) {
                this.recorder.init().then(function() {
                    startForReal();
                });
            } else {
                startForReal();
            }
            function startForReal() {
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

        updateResponse: function updateResponse(recording, recordsAttempts) {
            this._recording = recording;
            this._recordsAttempts = recordsAttempts;
            if (typeof this.trigger === 'function') {
                this.trigger('responseChange');
            }
        },

        displayRemainingAttempts: function displayRemainingAttempts() {
            var remaining = this.config.maxRecords - this._recordsAttempts - 1,
                resetLabel = controlIconFactory(this.assetManager, 'reset');

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

        renderStimulus: function renderStimulus() {
            var media = this.config.media || {},
                mediaPlayer;

            if (media.uri) {
                media.url = this.assetManager.resolve(media.uri);
                mediaPlayer = mediaPlayerFactory({
                    $container: this.$mediaStimulusContainer,
                    media: media
                });
                mediaPlayer.render();
            }
        },

        createControls: function createControls() {
            var self = this,

                record,
                stop,
                play,
                reset;

            // Record button
            record = controlFactory({
                id: 'record',
                label: controlIconFactory(this.assetManager, 'record'),
                defaultState: 'enabled',
                container: this.$controlsContainer
            });
            record.on('click', function() {
                if (this.getState() === controlStates.ENABLED) {
                    self.startRecording();
                }
            }.bind(record));
            record.on('updatestate', function() {
                if (self.player.getState() === playerStates.CREATED && self.recorder.getState() === recorderStates.IDLE) {
                    this.enable();
                } else {
                    this.disable();
                }
            }.bind(record));
            this.controls.record = record;


            // Stop button
            stop = controlFactory({
                id: 'stop',
                label: controlIconFactory(this.assetManager, 'stop'),
                defaultState: 'disabled',
                container: this.$controlsContainer
            });
            stop.on('click', function() {
                if (this.getState() === controlStates.ENABLED) {
                    if (self.recorder.getState() === recorderStates.RECORDING) {
                        self.stopRecording();

                    } else if (self.player.getState() === playerStates.PLAYING) {
                        self.stopPlayback();
                    }
                }
            }.bind(stop));
            stop.on('updatestate', function() {
                if (self.player.getState() === playerStates.PLAYING ||
                    self.recorder.getState() === recorderStates.RECORDING) {
                    this.enable();
                } else {
                    this.disable();
                }
            }.bind(stop));
            this.controls.stop = stop;


            // Play button
            if (this.config.allowPlayback === true) {
                play = controlFactory({
                    id: 'play',
                    label: controlIconFactory(this.assetManager, 'play'),
                    defaultState: 'disabled',
                    container: this.$controlsContainer
                });
                play.on('click', function() {
                    if (this.getState() === controlStates.ENABLED) {
                        self.playRecording();
                    }
                }.bind(play));
                play.on('updatestate', function() {
                    switch (self.player.getState()) {
                        case playerStates.IDLE:
                            this.enable();
                            break;
                        case playerStates.PLAYING:
                        default:
                            this.disable();
                            break;
                    }
                }.bind(play));
                this.controls.play = play;
            }


            // Reset button
            if (this.config.maxRecords !== 1) {
                reset = controlFactory({
                    id: 'reset',
                    label: controlIconFactory(this.assetManager, 'reset'),
                    defaultState: 'disabled',
                    container: this.$controlsContainer
                });
                reset.on('click', function() {
                    if (this.getState() === controlStates.ENABLED) {
                        self.resetRecording();
                    }
                    self.displayRemainingAttempts();
                }.bind(reset));
                reset.on('updatestate', function() {
                    if (self.config.maxRecords > 1 && self.config.maxRecords === self._recordsAttempts) {
                        this.disable();
                    } else if (self.player.getState() === playerStates.IDLE) {
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

            if (this.config.autoStart === true) {
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
            var recording,
                recordsAttempts,
                base64Prefix;

            if (response.record && _.isArray(response.record)) {
                response.record.forEach(function (record) {
                    switch(record.name) {
                        case 'recording':
                            recording = record.base.file;
                            break;
                        case 'recordsAttempts':
                            recordsAttempts = record.base.integer;
                            break;
                    }
                });
                if (recording && recordsAttempts) {
                    this.updateResponse(recording, recordsAttempts);

                    // restore interaction state
                    base64Prefix = 'data:' + recording.mime + ';base64,';
                    this.player.load(base64Prefix + recording.data);
                }
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
            var recordingResponse = {
                    name: 'recording',
                    base: {
                        file: this._recording
                    }
                },
                recordAttemptsResponse = {
                    name: 'recordsAttempts',
                    base: {
                        integer: this._recordsAttempts
                    }
                },
                response = {
                    record: [
                        recordingResponse,
                        recordAttemptsResponse
                    ]
                };
            return response;
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function () {
            this.updateResponse(null, 0);
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

    qtiCustomInteractionContext.register(audioRecordingInteraction);
});