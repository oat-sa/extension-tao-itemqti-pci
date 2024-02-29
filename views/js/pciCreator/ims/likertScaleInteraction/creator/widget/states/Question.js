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
 * Copyright (c) 2016-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!likertScaleInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _){
    'use strict';

    const LikertInteractionStateQuestion = stateFactory.extend(Question, function(){
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

        simpleEditor.create($container, '.likert-label-min', function(text) {
            interaction.prop('label-min', text);
        });

        simpleEditor.create($container, '.likert-label-max', function(text) {
            interaction.prop('label-max', text);
        });

    }, function destroy() {
        const $container = this.widget.$container;
        const $prompt = $container.find('.prompt');

        simpleEditor.destroy(this.widget.$container);
        containerEditor.destroy($prompt);
    });

    LikertInteractionStateQuestion.prototype.initForm = function(){
        const _widget = this.widget;
        const $form = _widget.$form;
        const interaction = _widget.element;
        const response = interaction.getResponseDeclaration();

        const level = parseInt(interaction.prop('level')) || 5;
        const levels = [2, 3, 4, 5, 6, 7, 8, 9, 10];
        const levelData = {};

        const icons = [true, 'true'].includes(interaction.prop('icons'));
        const numbers = [true, 'true'].includes(interaction.prop('numbers'));

        //build select option data for the template
        levels.forEach(lvl => {
            levelData[lvl] = {
                label: lvl,
                selected: lvl === level
            };
        });

        //render the form using the form template
        $form.html(formTpl({
            serial: response.serial,
            levels: levelData,
            icons,
            numbers
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            level: function(interaction, value) {
                //update the pci property value:
                interaction.prop('level', value);

                //trigger change event:
                interaction.triggerPci('configChange', [{ level: parseInt(value) }]);
            },

            icons: function(interaction, value) {
                interaction.prop('icons', value);
                interaction.triggerPci('configChange', [{ icons: value }]);
            },

            numbers: function(interaction, value) {
                interaction.prop('numbers', value);
                interaction.triggerPci('configChange', [{ numbers: value }]);
            }
        });
    };

    return LikertInteractionStateQuestion;
});
