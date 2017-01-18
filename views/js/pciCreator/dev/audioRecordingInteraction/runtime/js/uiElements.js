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
    'OAT/util/event'
], function($, event) {
    'use strict';

    /**
     * Creates a button for recording/playback control
     * @param {Object}  config
     * @param {Number}  config.id - control id
     * @param {String}  config.label - text displayed inside the button
     * @param {String}  config.defaultState - state in which the button will be created
     * @param {$}       config.container - jQuery Dom element that the button will be appended to
     */
    function controlFactory(config) {
        /**
         * @property {String} DISABLED  - not clickable
         * @property {String} ENABLED   - clickable
         * @property {String} ACTIVE    - clicked, triggered action is ongoing
         */
        var states = {
            DISABLED:   'disabled',
            ENABLED:    'enabled',
            ACTIVE:     'active'
        };

        var state,
            control,
            $control = $('<button>', {
                'class': 'audiorec-control',
                'data-identifier': config.id,
                html: config.label
            });

        $control.appendTo(config.container);

        setState(config.defaultState || states.DISABLED);

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        control = {
            is: function(queriedState) {
                return (state === queriedState);
            },
            enable: function() {
                setState(states.ENABLED);
            },
            disable: function() {
                setState(states.DISABLED);
            },
            activate: function() {
                setState(states.ACTIVE);
            },
            updateState: function() {
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

    return {
        controlFactory:     controlFactory,
        progressBarFactory: progressBarFactory,
        inputMeterFactory:  inputMeterFactory
    };

});