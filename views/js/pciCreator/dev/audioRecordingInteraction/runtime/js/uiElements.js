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
 * Those are the UI elements used by the audio recording PCI: media stimulus, progress bar, input meter and controls
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'taoQtiItem/portableLib/OAT/mediaPlayer'
], function($, _, event, mediaPlayerFactory) {
    'use strict';

    /**
     * @property {String} DISABLED  - not clickable
     * @property {String} ENABLED   - clickable
     * @property {String} ACTIVE    - clicked, triggered action is ongoing
     */
    var controlStates = {
        DISABLED:   'disabled',
        ENABLED:    'enabled',
        ACTIVE:     'active'
    };

    /**
     * @property {String} CREATED   - mediaStimulus instance created, but no media loaded
     * @property {String} IDLE      - stimulus loaded, ready to be played
     * @property {String} PLAYING   - stimulus is being played
     * @property {String} ENDED     - playing is over
     * @property {String} DISABLED  - no more playing is possible
     */
    var mediaStimulusStates = {
        CREATED:    'created',
        IDLE:       'idle',
        PLAYING:    'playing',
        ENDED:      'ended',
        DISABLED:   'disabled'
    };

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
                return (state === queriedState);
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
            }
        };
        event.addEventMgr(control);

        $control.on('click.audioPCI', function() {
            control.trigger('click');
        });

        return control;
    }

    /**
     * Creates a progress bar to display recording or playback progress
     * @param {$} $container - jQuery element that the progress bar will be appended to
     * @param {Object} config
     * @param {Number} config.maxRecordingTime - in seconds
     */
    function progressBarFactory($container, config) {
        var progressBar,
            $progressBar = $('<progress>',{
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
     * @param {$} config.$container - jQuery Dom element that the meter will be appended to
     */
    function inputMeterFactory(config) {
        var inputMeter,
            canvas,
            canvasCtx;

        var grey    = '#cccccc',
            green   = '#00aa00',
            orange  = '#ff9300',
            red     = '#ff0000';

        var ledHeight = 3,
            ledWidth = 10,
            ledPadding = 0,
            ledColors = [
                green, green, green, green, green, green,
                orange, orange, orange, orange,
                red, red, red
            ],
            ledNumbers = ledColors.length,

            width = ledWidth,
            height = (ledHeight * ledNumbers) + (ledPadding * (ledNumbers - 1));

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

                scaledLevel = Math.floor(level / config.maxLevel * height);

                for (i = 0; i < ledNumbers; i += 1) {
                    currentColor = grey;
                    if ((i === 0 && scaledLevel > 0)
                        || scaledLevel > (config.maxLevel / ledNumbers * i)) {
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
     * This is just a tiny wrapper around the media player instance, for the goal of having a consistent API with the rest of the components
     * @param {Object} config
     * @param {Object} config.$container
     * @param {Object} config.assetManager - the PCI assetmanager used to resolve the media URL
     * @param {Object} config.media - the media properties as given by the PCI media manager helper
     */
    function mediaStimulusFactory(config) {
        var $container   = config.$container,
            assetManager = config.assetManager,
            media        = config.media || {};

        var state = mediaStimulusStates.CREATED;

        var mediaStimulus,
            mediaPlayer,
            mediaPlayerOptions,
            mediaElement;

        mediaStimulus = {
            /**
             * Set state of the mediaStimulus
             * @param {String} newState
             * @private
             */
            setState: function setState(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(state);
            },

            /**
             * Check current state
             * @param {String} queriedState
             * @returns {boolean}
             */
            is: function is(queriedState) {
                return (state === queriedState);
            },

            /**
             * Render the media player
             */
            render: function render() {
                var self = this;

                $container.empty();
                if (mediaPlayer) {
                    mediaPlayer.destroy();
                }

                if (media.uri) {
                    mediaPlayerOptions = _.assign({}, media, {
                        $container: $container,
                        url:        assetManager.resolve(media.uri)
                    });

                    mediaPlayer = mediaPlayerFactory(mediaPlayerOptions);
                    mediaPlayer.render();

                    mediaElement = mediaPlayer.getMediaElement();

                    if (mediaElement) {
                        mediaElement
                            .on('ready pause stop', function() {
                                self.setState(mediaStimulusStates.IDLE);
                            })
                            .on('play', function() {
                                self.setState(mediaStimulusStates.PLAYING);
                            })
                            .on('ended', function() {
                                self.setState(mediaStimulusStates.ENDED);
                            })
                            .on('disabled', function() {
                                self.setState(mediaStimulusStates.DISABLED);
                            });
                    }
                }
            },

            destroy: function destroy() {
                mediaPlayer.destroy();
                $container.empty();
            }
        };

        event.addEventMgr(mediaStimulus);

        return mediaStimulus;
    }

    /**
     * Creates a countdown timer as a pie chart
     * @param {Object} config
     * @param {Object} config.$container - jQuery element that the countdown timer will be appended to
     * @param {Number} config.delayInSeconds - delay in seconds
     */
    function countdownPieChartFactory(config) {
        var countdownPieChart;
        var $container   = config.$container;
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

    return {
        controlFactory:         controlFactory,
        progressBarFactory:     progressBarFactory,
        inputMeterFactory:      inputMeterFactory,
        mediaStimulusFactory:   mediaStimulusFactory,
        countdownPieChartFactory: countdownPieChartFactory
    };

});
