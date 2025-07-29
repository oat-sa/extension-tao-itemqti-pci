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
/**
 * Those are the UI elements used by the audio recording PCI: progress bar, input meter and controls
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'text!audioRecordingInteraction/runtime/media/beep.txt'
], function ($, _, event, beepSoundDataUrl) {
    'use strict';

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
     * Creates a button for recording/playback control
     * @param {Object}  config
     * @param {Number}  config.id - control id
     * @param {String}  config.label - text displayed inside the button
     * @param {String}  config.defaultState - state in which the button will be created
     * @param {jQuery}  config.container - jQuery Dom element that the button will be appended to
     * @returns {Object} control
     */
    function controlFactory(config) {
        var state,
            control,
            $control = $('<button>', {
                class: 'audiorec-control',
                'data-identifier': config.id,
                'aria-label': config.id,
                html: config.label
            });

        $control.appendTo(config.container);

        setState(config.defaultState || controlStates.DISABLED);

        /**
         * Set the state of the control
         * @param {String} newState
         */
        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        /**
         * The control instance
         */
        control = {
            /**
             * Check the current state
             * @param {String} queriedState
             * @returns {boolean}
             */
            is: function is(queriedState) {
                return state === queriedState;
            },

            /**
             * Enable the control
             */
            enable: function enable() {
                setState(controlStates.ENABLED);
            },

            /**
             * Disable the control
             */
            disable: function disable() {
                setState(controlStates.DISABLED);
            },

            /**
             * Activate the control
             */
            activate: function activate() {
                setState(controlStates.ACTIVE);
            },

            /**
             * Get current state
             * @returns {string} state - the current state
             */
            getState: function getState() {
                return state;
            },

            /**
             * Set the state of the control
             * @param {String} newState
             */
            setState: setState,

            /**
             * Trigger the update state callback
             */
            updateState: function updateState() {
                this.trigger('updatestate');
            },

            /**
             * Change the control label
             * @param {String} label
             */
            updateLabel: function updateLabel(label) {
                $control.html(label);
            },

            /**
             * Destroy the control
             */
            destroy: function destroy() {
                $control.off('.audioPCI');
                $control.remove();
                $control = null;
            },

            /**
             * Returns with DOM element of the control
             * @returns {HTMLElement|null}
             */
            getDOMElement() {
                return $control ? $control.get(0) : null;
            }
        };
        event.addEventMgr(control);

        $control.on('click.audioPCI', function () {
            control.trigger('click');
        });

        return control;
    }

    /**
     * Creates a progress bar to display recording or playback progress
     * @param {jQuery} $container - jQuery element that the progress bar will be appended to
     * @param {Object} config
     * @param {Number} config.maxRecordingTime - in secondsabstract
     * @returns {jQuery} progressBar
     */
    function progressBarFactory($container, config) {
        var progressBar,
            $progressBar = $('<progress>', {
                value: '0'
            }),
            currentClass;

        progressBar = {
            /**
             * Set the maximum value of the progress bar
             * @param {Number} max - in seconds
             */
            setMax: function setMax(max) {
                $progressBar.attr('max', max);
            },

            /**
             * Set the current value of the progress bar
             * @param {Number} value
             */
            setValue: function setValue(value) {
                $progressBar.attr('value', value);
                $progressBar.text(value);
            },

            /**
             * Set the CSS class on the progressbar element
             * @param {String} className
             */
            setStyle: function setStyle(className) {
                $progressBar.removeClass(currentClass);
                currentClass = className;
                $progressBar.addClass(currentClass);
            },

            reset: function reset() {
                this.setValue(0);
                this.setStyle('');
                if (config.maxRecordingTime) {
                    this.setMax(config.maxRecordingTime);
                }
            }
        };

        $container.empty();
        $container.append($progressBar);

        return progressBar;
    }

    /**
     * Creates a input meter for microphone input signal. Uses the canvas.
     * The meter is actually composed of multiple "leds" stacked on top of each other.
     * @param {Object} config
     * @param {Integer} config.maxLevel - level for which all meter leds will be lit
     * @param {jQuery} config.$container - jQuery Dom element that the meter will be appended to
     * @returns {jQuery} inputMeter
     */
    function inputMeterFactory(config) {
        var inputMeter, canvas, canvasCtx;

        var grey = '#cccccc',
            green = '#00aa00',
            orange = '#ff9300',
            red = '#ff0000';

        var ledHeight = 3,
            ledWidth = 10,
            ledPadding = 0,
            ledColors = [green, green, green, green, green, green, orange, orange, orange, orange, red, red, red],
            ledNumbers = ledColors.length,
            width = ledWidth,
            height = ledHeight * ledNumbers + ledPadding * (ledNumbers - 1);

        var scaledLevel;

        canvas = document.createElement('canvas');
        canvas.height = height;
        canvas.width = width;

        config.$container.empty();
        config.$container.append($(canvas));

        canvasCtx = canvas.getContext('2d');

        /**
         * Draw a single led
         * @param {Number} index - of the Led to draw
         * @param {String} color - hex code in which to draw the led
         */
        function drawLed(index, color) {
            var x = 0,
                y = (ledHeight + ledPadding) * (ledNumbers - (index + 1));

            canvasCtx.fillStyle = color;
            canvasCtx.fillRect(x, y, ledWidth, ledHeight);
        }

        inputMeter = {
            /**
             * Draw the whole meter with the given input level
             * @param {Number} level
             */
            draw: function draw(level) {
                var currentColor, i;

                scaledLevel = Math.floor((level / config.maxLevel) * height);

                for (i = 0; i < ledNumbers; i += 1) {
                    currentColor = grey;
                    if ((i === 0 && scaledLevel > 0) || scaledLevel > (config.maxLevel / ledNumbers) * i) {
                        currentColor = ledColors[i];
                    }
                    drawLed(i, currentColor);
                }
            },

            /**
             * Destroy the canvas element
             */
            destroy: function destroy() {
                canvasCtx = null;
                canvas = null;
                config.$container.empty();
            }
        };

        inputMeter.draw(0);

        return inputMeter;
    }

    /**
     * Creates a countdown timer as a pie chart
     * @param {Object} config
     * @param {Object} config.$container - jQuery element that the countdown timer will be appended to
     * @param {Number} config.delayInSeconds - delay in seconds
     * @returns {jQuery} countdownPieChart
     */
    function countdownPieChartFactory(config) {
        var countdownPieChart;
        var $container = config.$container;
        var delay = config.delayInSeconds - 1;
        var $countdownPieChart = $(
            '<div class="countdown-pie-container countdown-pie-animated">' +
                '<div class="countdown-pie-circle">' +
                '<div class="countdown-pie countdown-pie-spinner countdown-pie-animated"></div>' +
                '<div class="countdown-pie countdown-pie-filler countdown-pie-animated"></div>' +
                '<div class="countdown-pie-mask countdown-pie-animated"></div>' +
                '</div>' +
                '</div>'
        );

        var displayed = true;

        countdownPieChart = {
            isDisplayed: function isDisplayed() {
                return displayed;
            },
            start: function start() {
                $countdownPieChart.css('animation-play-state', 'running');
                $countdownPieChart.find('.countdown-pie-animated').css('animation-play-state', 'running');
            },
            destroy: function destroy() {
                displayed = false;
                $container.empty();
            }
        };

        $countdownPieChart.css('animation-duration', delay + 's');
        $countdownPieChart.find('.countdown-pie-animated').css('animation-duration', delay + 's');

        $container.empty();
        $container.append($countdownPieChart);

        return countdownPieChart;
    }

    /**
     * Creates a player for beep sound at the beginning and end of recording
     * @returns {jQuery} beepPlayer
     */
    function beepPlayerFactory() {
        const timeoutMs = 2000;
        const soundUrl = beepSoundDataUrl;

        let beepPlayer;
        let audioEl = new Audio();
        let playedToTheEndPromise;

        function createDeferredPromise() {
            const deferred = {};
            deferred.promise = new Promise((resolve, reject) => {
                deferred.resolve = resolve;
                deferred.reject = reject;
            });
            return deferred;
        }

        function playSound() {
            if (playedToTheEndPromise) {
                playedToTheEndPromise.reject();
            }
            playedToTheEndPromise = createDeferredPromise();

            return Promise.resolve()
                .then(() => {
                    if (!audioEl) {
                        playedToTheEndPromise.reject();
                        return;
                    }

                    audioEl.pause();
                    audioEl.src = soundUrl;
                    audioEl.currentTime = 0;
                    audioEl.muted = false;

                    audioEl.onended = () => {
                        clearTimeout(timeoutId);
                        if (playedToTheEndPromise) {
                            playedToTheEndPromise.resolve();
                        }
                    };
                    audioEl.onerror = err => {
                        clearTimeout(timeoutId);
                        if (playedToTheEndPromise) {
                            playedToTheEndPromise.reject(err);
                        }
                    };
                    const timeoutId = setTimeout(() => {
                        if (playedToTheEndPromise) {
                            playedToTheEndPromise.reject(new Error('beep was not played in time'));
                        }
                    }, timeoutMs);

                    return audioEl.play();
                })
                .then(() => playedToTheEndPromise.promise)
                .catch(function onError(err) {
                    if (err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                    }
                })
                .finally(() => {
                    playedToTheEndPromise = null;
                });
        }

        function playSilentSound() {
            if (!playedToTheEndPromise && audioEl) {
                audioEl.src = soundUrl;
                audioEl.muted = true;
                audioEl.play().catch(() => {});
            }
        }

        /**
         * try to workaround the issue where iOS doesn't play audio if play wasn't started by the user action
         * (happens if recording is set to autostart after the specified delay)
         */
        document.body.addEventListener('click', playSilentSound, { once: true });

        beepPlayer = {
            playStartSound: function playStartSound() {
                this.isPlayingStartSound = true;
                return playSound().then(() => {
                    this.isPlayingStartSound = false;
                });
            },
            playEndSound: function playEndSound(durationMs) {
                this.isPlayingEndSound = true;
                return playSound()
                    .then(() => {
                        if (!this.isPlayingStartSound) {
                            return playSound();
                        }
                    })
                    .then(() => {
                        this.isPlayingEndSound = false;
                        this.trigger('beep-endsound-played', [durationMs]);
                    });
            },
            getIsPlayingEndSound: function getIsPlayingEndSound() {
                return this.isPlayingEndSound;
            },
            destroy: function destroy() {
                document.body.removeEventListener('click', playSilentSound);
                if (playedToTheEndPromise) {
                    playedToTheEndPromise.reject();
                }
                if (audioEl) {
                    audioEl.pause();
                    audioEl = null;
                }
            }
        };
        event.addEventMgr(beepPlayer);
        return beepPlayer;
    }

    return {
        controlFactory: controlFactory,
        progressBarFactory: progressBarFactory,
        inputMeterFactory: inputMeterFactory,
        countdownPieChartFactory: countdownPieChartFactory,
        beepPlayerFactory: beepPlayerFactory
    };
});
