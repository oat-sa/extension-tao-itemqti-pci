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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!likertInteraction/likert/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $){
    'use strict';

    var LikertInteractionStateQuestion = stateFactory.extend(Question, function(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        containerEditor.create($prompt, {
            change : function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction,
            areaBroker: this.widget.getAreaBroker()
        });

        simpleEditor.create($container, '.likert-label-min', function(text){
            interaction.prop('label-min', text);
        });

        simpleEditor.create($container, '.likert-label-max', function(text){
            interaction.prop('label-max', text);
        });

    }, function(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    LikertInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            level = parseInt(interaction.prop('level')) || 5,
            levels = [5, 7, 9],
            levelData = {};

        //build select option data for the template
        _.each(levels, function(lvl){
            levelData[lvl] = {
                label : lvl,
                selected : (lvl === level)
            };
        });

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            levels : levelData
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            level : function(interaction, value){

                //update the pci property value:
                interaction.prop('level', value);

                //trigger change event:
                interaction.triggerPci('levelchange', [parseInt(value)]);
            }
        });

    };

    return LikertInteractionStateQuestion;
});
