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
 * Copyright (c) 2015 (original work) Open Assessment Technologies;
 *               
 */   
define([
    'ui/feedback',
    'i18n'
],
function (feedback, __) {
    'use strict';
    return function (options) {
        var that = this,
            defaultOptions = {};

        this.options = {};
        this.eventNs = 'adaptiveChoiceInteraction';

        /**
         * Function returns Handlebars template options (helpers) that will be used when rendering.
         * @param {object} data - interavtion properties
         * @returns {object} - Handlebars template options
         */
        function getTemplateData(data) {
            data.states = {
                'question' : that.options.state === 'question'
            };

            return data;
        }

        this.init = function () {
            _.assign(that.options, defaultOptions, options);
        };
        /**
         * Function sets interaction state.
         * @param {string} state name (e.g. 'question' | 'answer')
         * @return {object} this
         */
        this.setState = function (state) {
            this.options.state = state;

            if (state === 'runtime') {
                this.initEliminator();
            }

            return this;
        };

        /**
         * Initialize the answer eliminator.
         * @returns {object} this
         */
        this.initEliminator = function () {
            that.options.$container.on('change', '.js-answer-input', function () {
                var val = parseInt($(this).val(), 10);

                if (!options.interaction.properties.choices[val].correct) {
                    $(this).closest('.qti-choice').remove();
                    feedback().info(__('This is the wrong answer. Please try again.'));
                }
            });
            return this;
        };

        /**
         * Render interaction
         * @param {object} data - interaction properties
         * @return {object} this
         */
        this.render = function (data) {
            if (that.options.templates && that.options.templates.markupTpl) {
                var templateData;
                data = _.cloneDeep(data);

                templateData = getTemplateData(data);
                that.options.$container
                    .find('.qti-customInteraction')
                    .html(that.options.templates.markupTpl(templateData));

                options.interaction.updateMarkup();
                options.interaction.triggerPci('render' + that.eventNs + that.options.state);
            }

            return that;
        };

        this.init();
    };
});