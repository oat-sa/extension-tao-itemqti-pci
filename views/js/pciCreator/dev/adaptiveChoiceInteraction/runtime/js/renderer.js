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
    'jquery',
    'ui/feedback',
    'i18n'
], function ($, feedback, __) {
    'use strict';
    return function adaptiveChoiceRenderer(options) {
        var renderer,
            defaultOptions = {};


        /**
         * Function returns Handlebars template options (helpers) that will be used when rendering.
         * @param {object} data - interavtion properties
         * @returns {object} - Handlebars template options
         */
        function getTemplateData(data) {
            data.states = {
                'question' : renderer.options.state === 'question'
            };

            return data;
        }

        renderer = {
            options : {},
            eventNs : 'adaptiveChoiceInteraction',
            init : function init() {
                _.assign(this.options, defaultOptions, options);
            },
            /**
             * Function sets interaction state.
             * @param {string} state name (e.g. 'question' | 'answer')
             * @return {object} this
             */
            setState: function setState(state) {
                this.options.state = state;

                if (state === 'runtime') {
                    this.initEliminator();
                }

                return this;
            },
            /**
             * Initialize the answer eliminator.
             * @returns {object} this
             */
            initEliminator : function initEliminator() {
                var self = this,
                    incorrectChoices,
                    val;
            
                this.options.$container
                    .off('change.choiceEliminator.' + this.eventNs)
                    .on('change.choiceEliminator.' + this.eventNs, '.js-answer-input', function () {
                        val = parseInt($(this).val(), 10);
                        if (!options.interaction.properties.choices[val].correct) {
                            incorrectChoices = self.options.$container.find('.js-answer-input:not(.correct)');
                            if (incorrectChoices.length) {
                                incorrectChoices[0].closest('.qti-choice').remove();
                                feedback().info(__('This is the wrong answer. Please try again.'));
                                $(this).prop('checked', false);
                            }
                        }
                    });

                return this;
            },
            /**
             * Render interaction
             * @param {object} data - interaction properties
             * @return {object} this
             */
            render : function render(data) {
                var templateData;
                if (this.options.templates && this.options.templates.markupTpl) {
                    data = _.cloneDeep(data);

                    templateData = getTemplateData(data);
                    this.options.$container
                        .find('.qti-customInteraction')
                        .html(this.options.templates.markupTpl(templateData));

                    this.options.interaction.updateMarkup();
                    this.options.interaction.triggerPci('render' + this.eventNs + this.options.state);
                }

                return this;
            }
        };
        
        renderer.init();
        
        return renderer;
    };
});