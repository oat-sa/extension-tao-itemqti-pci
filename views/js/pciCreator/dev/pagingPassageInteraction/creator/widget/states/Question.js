/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!pagingPassageInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function (stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $) {
    'use strict';
    var stateQuestion = stateFactory.extend(Question, function () {
        var $container = this.widget.$container,
            interaction = this.widget.element;

        containerEditor.create($container.find('.passage'), {
            change : function (text) {
                interaction.data('passage', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.passage',
            related : interaction
        });

        containerEditor.create($container.find('.prompt'), {
            change : function (text) {
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });

        simpleEditor.create($container, '.js-choice-label', function () {

        });

    }, function () {
        var $container = this.widget.$container,
            interaction = this.widget.element,
            choices = [];

        simpleEditor.destroy($container);
        containerEditor.destroy($container.find('.prompt'));
        containerEditor.destroy($container.find('.passage'));

        $container.find('.js-choice-label').each(function () {
            var val = $.trim($(this).text());
            choices.push(val);
        });
        interaction.prop('choices', choices);
    });

    stateQuestion.prototype.initForm = function () {

        /*var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            level = parseInt(interaction.prop('level'), 10) || 5,
            levels = [5, 7, 9],
            levelData = {};

        //build select option data for the template
        _.each(levels, function (lvl) {
            levelData[lvl] = {
                label : lvl,
                selected : (lvl === level)
            };
        });

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            levels : levelData,
            identifier : interaction.attr('responseIdentifier')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            level : function (interaction, value) {

                //update the pci property value:
                interaction.prop('level', value);
                
                //trigger change event:
                interaction.triggerPci('levelchange', [parseInt(value)]);
            },
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });*/

    };

    return stateQuestion;
});
