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
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/mediaPlayer'
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

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        control = {
            is: function is(queriedState) {
                return (state === queriedState);
            },
            enable: function enable() {
                setState(controlStates.ENABLED);
            },
            disable: function disable() {
                setState(controlStates.DISABLED);
            },
            activate: function activate() {
                setState(controlStates.ACTIVE);
            },
            updateState: function updateState() {
                this.trigger('updatestate');
            },
            updateLabel: function updateLabel(label) {
                $control.html(label);
            }
        };
        event.addEventMgr(control);

        $control.on('click.qtiCommonRenderer', function() {//todo: remove this, implement destroy function
            control.trigger('click');
        });

        return control;
    }

    /**
     * Creates a progress bar to display recording or playback progress
     * @param {Object}  config
     * @param {$}       config.$container - jQuery Dom element that the progress bar will be appended to
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

            render: function() {
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

        progressBar.clear();
        progressBar.render();

        return progressBar;
    }


    /**
     * Creates a input meter for microphone input signal
     * @param {Object}  config
     * @param {Integer} config.maxLevel - level for which all meter leds will be lit
     * @param {$}       config.$container - jQuery Dom element that the meter will be appended to
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
     * This is just a tiny wrapper around the media player instance.
     * The goal is to have a consistent API with the rest of the components
     *
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
            _setState: function setState(newState) {
                state = newState;
                this.trigger('statechange');
                this.trigger(state);
            },

            is: function is(queriedState) {
                return (state === queriedState);
            },

            render: function render() {
                var self = this;

                $container.empty();
                if (mediaPlayer) {
                    mediaPlayer.destroy();
                }

                if (media.uri) {
                    mediaPlayerOptions = _.defaults({
                        $container: $container,
                        url:        assetManager.resolve(media.uri)
                        //fixme: add media here to avoid polluting the xml markup with the url
                    }, media);

                    mediaPlayer = mediaPlayerFactory(mediaPlayerOptions);
                    mediaPlayer.render();

                    mediaElement = mediaPlayer.getMediaElement();

                    if (mediaElement) {
                        mediaElement
                            .on('ready pause stop', function() {
                                self._setState(mediaStimulusStates.IDLE);
                            })
                            .on('play', function() {
                                self._setState(mediaStimulusStates.PLAYING);
                            })
                            .on('ended', function() {
                                self._setState(mediaStimulusStates.ENDED);
                            })
                            .on('disabled', function() {
                                self._setState(mediaStimulusStates.DISABLED); //fixme: useless? if so, remove trigger event in media player
                            });
                    }
                }
            }
        };

        event.addEventMgr(mediaStimulus);

        return mediaStimulus;
    }


    return {
        controlFactory:         controlFactory,
        progressBarFactory:     progressBarFactory,
        inputMeterFactory:      inputMeterFactory,
        mediaStimulusFactory:   mediaStimulusFactory
    };

});