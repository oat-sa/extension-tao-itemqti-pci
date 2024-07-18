/*
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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!htmlTemplateTextboxInteraction/creator/tpl/propertiesForm'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl) {
    'use strict';

    var stateQuestion = stateFactory.extend(
        Question,
        function enterQuestionState() {
            const $container = this.widget.$container;
            const $prompt = $container.find('.prompt');
            const interaction = this.widget.element;

            containerEditor.create($prompt, {
                change : function change(text){
                    interaction.data('prompt', text);
                    interaction.updateMarkup();
                },
                markup : interaction.markup,
                markupSelector : '.prompt',
                related : interaction,
                areaBroker: this.widget.getAreaBroker()
            });
        },
        function leaveQuestionState() {
            const $container = this.widget.$container;
            const $prompt = $container.find('.prompt');

            simpleEditor.destroy(this.widget.$container);
            containerEditor.destroy($prompt);
        }
    );

    /**
     * Change callback of form values
     * @param {Object} interaction - TAO Authoring's CustomInteraction model
     * @param {*} value
     * @param {String} name
     */
    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    /**
     * Setup the property panel
     */
    stateQuestion.prototype.initForm = function() {
        const interaction = this.widget.element;
        const $form = this.widget.$form;

        //render the form using the form template
        $form.html(formTpl({
            serial: interaction.getResponseDeclaration().serial,
            html: interaction.prop('html'),
            responseSelector: interaction.prop('responseSelector'),
            wordcountSelector: interaction.prop('wordcountSelector')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            html: function(i, value){
                // i.properties.html = value;
                // i.triggerPci('configChange', [{ html: value }]);
                configChangeCallBack(i, value, 'html');
            },
            responseSelector: function(i, value){
                i.prop('responseSelector', value);
                i.triggerPci('configChange', [{ responseSelector: value }]);
            },
            wordcountSelector: function(i, value){
                i.prop('wordcountSelector', value);
                i.triggerPci('configChange', [{ wordcountSelector: value }]);
            }
        });
    };
    return stateQuestion;
});
