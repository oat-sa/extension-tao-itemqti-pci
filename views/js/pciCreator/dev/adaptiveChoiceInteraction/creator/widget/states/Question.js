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
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!adaptiveChoiceInteraction/creator/tpl/propertiesForm',
    'css!adaptiveChoiceInteraction/creator/css/adaptiveChoiceInteraction'
], function (_, $, stateFactory, Question, formElement, formTpl) {
    'use strict';
    var stateQuestion = stateFactory.extend(Question, function () {
        var that = this,
            $container = that.widget.$container,
            interaction = that.widget.element;
        //add choice event
        $container.on('click.' + interaction.typeIdentifier, '.js-add-choice', function () {
            var choiceNum = interaction.properties.choices.length + 1;
            
            interaction.widgetRenderer.destroyEditors();
            interaction.properties.choices.push({label : 'Choice ' + choiceNum});
            interaction.widgetRenderer.render(interaction.properties);
        });
        
        //add remove event
        $container.on('click.' + interaction.typeIdentifier, '.js-remove-choice', function () {
            var choiceNum = $(this).data('choice-index');
            
            interaction.widgetRenderer.destroyEditors();
            interaction.properties.choices.splice(choiceNum, 1);
            interaction.widgetRenderer.render(interaction.properties);
        });
        
        interaction.offPci('render' + interaction.typeIdentifier + 'question');
        interaction.onPci('render' + interaction.typeIdentifier + 'question', function () {
            interaction.widgetRenderer.initEditors();
        });
    }, function () {
        var that = this,
            interaction = that.widget.element,
            $container = that.widget.$container;
            
        $container.off('.' + interaction.typeIdentifier);
        that.widget.$form.find('.js-choice-type-select').select2('destroy');
        interaction.widgetRenderer.destroyEditors();
    });

    stateQuestion.prototype.initForm = function () {
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        //render the form using the form template
        $form.html(formTpl(
            interaction.properties
        ));

        $form.find('.js-choice-type-select').val(interaction.properties.choiceType);
        
        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            choiceType : function (interaction, value) {
                interaction.properties.choiceType = value;
                interaction.widgetRenderer.render(interaction.properties);
            }
        });
    };

    return stateQuestion;
});
