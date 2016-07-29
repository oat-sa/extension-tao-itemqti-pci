define([
    'qtiCustomInteractionContext',
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/util/html',
    'tpl!audioRecordingInteraction/runtime/tpl/control'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    event,
    html,
    controlTpl
){
    'use strict';


    //todo: check licence or rewrite
    // MediaDevices.getUserMedia polyfill
    // https://github.com/mozdevs/mediaDevices-getUserMedia-polyfill/
    // Mozilla Public License, version 2.0
    (function setGetUserMedia() {

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
    }());


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
     * todo: jsdoc
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
                };

                audioEl.onplaying = function() {
                    self._setState(playerStates.PLAYING);
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
     * @property {String} CREATED   - recorder instance created, but not not initialized
     * @property {String} IDLE      - ready to record
     * @property {String} RECORDING - record is in progress
     */
    var recorderStates = {
        CREATED:    'created',
        IDLE:       'idle',
        RECORDING:  'recording'
    };

    /**
     * todo: jsdoc
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
            chunkSize = 1000,
            startTime,
            timerId;

        if (typeof MediaRecorder === 'undefined') {
            throw new Error('MediaRecorder API not supported. Please use a compatible browser');
        }

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

                        self._setState(recorderStates.IDLE);

                        mediaRecorder.ondataavailable = function(e) {
                            chunks.push(e.data);
                        };

                        mediaRecorder.onstop = function() {
                            var blob = new Blob(chunks, { type: mimeType });
                            var duration = new window.Date().getTime() - startTime;

                            clearTimeout(timerId);

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
                var self = this;

                mediaRecorder.start(chunkSize);
                startTime = new window.Date().getTime();

                this._setState(recorderStates.RECORDING);

                if (config.maxRecordingTime > 0) {
                    timerId = _.delay(function() {
                        if (mediaRecorder.state === 'recording') {
                            self.stop();
                        }
                    }, config.maxRecordingTime * 1000);
                }
            },

            stop: function() {
                mediaRecorder.stop();
                // state change is triggered by onstop handler
            }
        };
        event.addEventMgr(recorder);

        return recorder;
    }


    /**
     * todo: jsdoc
     */
    function controlFactory(config) {
        var state,
            $control = $(controlTpl({
                id: config.id,
                label: config.label
            })),
            controlStates = {
                DISABLED: 'disabled',
                ENABLED: 'enabled',
                ACTIVE: 'active'
            };

        $control.on('click', function() {
            if (state === controlStates.ENABLED) {
                config.onclick();
            }
        });
        $control.appendTo(config.container);

        setState(config.defaultState || controlStates.DISABLED);

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        return {
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
                config.updateState.call(this);
            }
        };
    }

    function updateControlsState(controls) {
        var control;
        for (control in controls) {
            if (controls.hasOwnProperty(control)) {
                controls[control].updateState();
            }
        }
    }

    /**
     * Main interaction code
     * @returns {Object} - implements the PCI interface and will be passed to qtiCustomInteractionContext.register()
     */
    function audioRecordingInteraction() {
        var options = {};

        var $container,
            $instructionsContainer,
            $controlsContainer;

        var filePrefix = 'audioRecording';

        var player,
            recorder,
            controls = {},
            updateControls = updateControlsState.bind(null, controls);

        // interaction state
        var _recording = null,
            _recordsAttempts = 0;

        function init(dom, config) {
            $container = $(dom);
            $instructionsContainer = $container.find('.audioRec > .instructions');
            $controlsContainer = $container.find('.audioRec > .controls');

            options = _.defaults(options, config, {
                allowPlayback: true,
                audioBitrate: 20000,
                autoStart: false,
                displayDownloadLink: true, // this is for testing purposes only
                maxRecords: 3, // 1 = no records / x = x records / 0 = unlimited
                maxRecordingTime: 10,

                // todo: consider this
                allowStopRecord: true,
                allowStopPlayback: true,
                minRecordingTime: 5
            });
        }

        function initRecorder() {
            recorder = recorderFactory(options);

            recorder.on('recordingavailable', function(blob, duration) {
                var recordingUrl = window.URL.createObjectURL(blob),
                    filename =
                        filePrefix + '_' +
                        window.Date.now() + '.' +
                        // extract extension (ex: 'webm') from strings like: 'audio/webm;codecs=opus' or 'audio/webm'
                        blob.type.split(';')[0].split('/')[1],
                    filesize = blob.size;

                player.load(recordingUrl);
                createBase64Recoding(blob, filename);

                _recordsAttempts++;

                displayRemainingAttempts();
                displayDownloadLink(recordingUrl, filename, filesize, duration);
            });

            recorder.on('statechange', function() {
                updateControls();
            });
        }

        function initPlayer() {
            player = playerFactory();

            player.on('statechange', function() {
                updateControls();
            });
        }

        function startRecording() {
            function startForReal() {
                recorder.start();
                updateControls();
            }
            if (recorder.getState() === recorderStates.CREATED) {
                recorder.init().then(function() {
                    startForReal();
                });
            } else {
                startForReal();
            }
        }

        function stopRecordingOrPlayback() {
            if (recorder.getState() === recorderStates.RECORDING) {
                recorder.stop();

            } else if (player.getState() === playerStates.PLAYING) {
                player.stop();
            }
            updateControls();
        }

        function playRecording() {
            player.play();
            updateControls();
        }

        function resetRecording() {
            player.unload();
            setRecording(null);
            updateControls();
        }

        function createBase64Recoding(blob, filename) {
            //todo: implement a spinner or something to feedback that work is in progress while this is happening:
            //todo: as the response is not yet ready, the user shouldn't leave the item in the meantime
            var reader = new FileReader();
            reader.readAsDataURL(blob);

            reader.onloadend = function onLoadEnd(e) {
                var base64Raw = e.target.result;
                var commaPosition = base64Raw.indexOf(',');
                var base64Data = base64Raw.substring(commaPosition + 1);

                setRecording({
                    mime: blob.type,
                    name: filename,
                    data: base64Data
                });
            };
        }

        function setRecording(recording) {
            _recording = recording;
        }

        function displayRemainingAttempts() {
            var remaining = options.maxRecords - _recordsAttempts,
                message;

            if (options.maxRecords > 1) {
                if (remaining === 0) {
                    message = 'You have no more attempts left';
                } else {
                    message = 'Remaining attempts: ' + remaining;
                }
                $instructionsContainer.html(message);
            }
        }

        function displayDownloadLink(url, filename, filesize, duration) {
            var downloadLink;

            if (options.displayDownloadLink === true) {
                downloadLink = document.createElement('a');
                // fixme: append the link in a better place
                // container.appendChild(downloadLink); // doesn't work in FF...
                document.body.appendChild(downloadLink); // but this works !!!
                document.body.appendChild(document.createElement('br'));
                downloadLink.text =
                    'download ' + _recordsAttempts + ' - ' +
                    Math.round(filesize / 1000) + 'KB - ' +
                    Math.round(duration / 1000) + 's';
                downloadLink.download = filename;
                downloadLink.href = url;
            }
        }

        function createControls() {
            controls.record = controlFactory({
                id: 'record',
                label: 'Record',
                defaultState: 'enabled',
                container: $controlsContainer,
                onclick: function onclick() {
                    startRecording();
                },
                updateState: function updateState() {
                    if (player.getState() === playerStates.CREATED) {
                        if (recorder.getState() === recorderStates.RECORDING) {
                            this.activate();
                        } else {
                            this.enable();
                        }
                    } else {
                        this.disable();
                    }
                }
            });

            controls.stop = controlFactory({
                id: 'stop',
                label: 'Stop',
                defaultState: 'disabled',
                container: $controlsContainer,
                onclick: function onclick() {
                    stopRecordingOrPlayback();
                },
                updateState: function updateState() {
                    if (player.getState() === playerStates.PLAYING ||
                        recorder.getState() === recorderStates.RECORDING) {
                        this.enable();
                    } else {
                        this.disable();
                    }
                }
            });

            if (options.allowPlayback === true) {
                controls.play = controlFactory({
                    id: 'play',
                    label: 'Play',
                    defaultState: 'disabled',
                    container: $controlsContainer,
                    onclick: function onclick() {
                        playRecording();
                    },
                    updateState: function updateState() {
                        switch (player.getState()) {
                        case playerStates.IDLE:
                            this.enable();
                            break;
                        case playerStates.PLAYING:
                            this.activate();
                            break;
                        default:
                            this.disable();
                            break;
                        }
                    }
                });
            }

            if (options.maxRecords !== 1) {
                controls.reset = controlFactory({
                    id: 'reset',
                    label: 'Try again',
                    defaultState: 'disabled',
                    container: $controlsContainer,
                    onclick: function onclick() {
                        resetRecording();
                    },
                    updateState: function updateState() {
                        if (options.maxRecords > 1 && options.maxRecords === _recordsAttempts) {
                            this.disable();
                        } else if (player.getState() === playerStates.IDLE) {
                            this.enable();
                        } else {
                            this.disable();
                        }
                    }
                });
            }
        }


        /**
         * PCI interface implementation
         */
        return {
            id: -1,
            getTypeIdentifier: function () {
                return 'audioRecordingInteraction';
            },
            /**
             * Render the PCI :
             * @param {String} id
             * @param {Node} dom
             * @param {Object} config - json
             */
            initialize: function (id, dom, config) {
                init(dom, config);
                initRecorder();
                initPlayer();

                this.id = id;
                this.dom = dom;
                this.config = options;

                event.addEventMgr(this);

                // render rich text content in prompt
                html.render($container.find('.prompt'));

                // render interaction
                createControls();
                displayRemainingAttempts();

                //tell the rendering engine that I am ready
                qtiCustomInteractionContext.notifyReady(this);

                if (options.autoStart === true) {
                    startRecording();
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
                    base64Prefix;

                if (response.base && response.base.file) {
                    recording = response.base.file;
                }
                setRecording(recording);
                if (_recording) {
                    base64Prefix = 'data:' + recording.mime + ';base64,';
                    player.load(base64Prefix + recording.data);
                }
            },
            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @returns {Object}
             */
            getResponse: function () {
                var response;
                if (!_recording) {
                    response = {
                        base: null
                    };
                } else {
                    response = {
                        base: {
                            file: _recording
                        }
                    };
                }
                return response;
            },
            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             *
             * @param {Object} interaction
             */
            resetResponse: function () {
                resetRecording();
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             * Event listeners are removed and the state and the response are reset
             *
             * @param {Object} interaction
             */
            destroy: function () {
                player = null;
                recorder = null;
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
    }

    qtiCustomInteractionContext.register(audioRecordingInteraction());
});