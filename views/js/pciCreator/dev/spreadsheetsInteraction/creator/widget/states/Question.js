define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!liquidsInteraction/creator/tpl/propertiesForm'
    // 'tpl!taoQtiItem/qtiCreator/tpl/notifications/widgetOverlay'
], function (stateFactory, Question, formElement, formTpl, overlayTpl) {
    'use strict';



    var SpreadsheetsInteractionStateQuestion = stateFactory.extend(Question, function () {
        // this.widget.$container.append(overlayTpl());

        var that = this,
            $container = that.widget.$container,
            interaction = that.widget.element,
            templateData = interaction.widgetRenderer.templateData;



    }, function () {
        var that = this,
            interaction = that.widget.element,
            $container = that.widget.$container;

        $container.off('.' + interaction.typeIdentifier);
        //interaction.widgetRenderer.destroyEditors();

    });

    SpreadsheetsInteractionStateQuestion.prototype.initForm = function () {

        var widget = this.widget,
            $form = widget.$form,
            interaction = widget.element;
            //templateData = interaction.widgetRenderer.templateData;
        var templateData = {};

        console.log(interaction.widgetRenderer);

        // $form.html(formTpl({
        //     // serial : response.serial,
        //     //identifier : interaction.attr('responseIdentifier')
        // }));

        $form.html(formTpl(templateData));
        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, interaction, {
            // identifier : function (i, value) {
            //     response.id(value);
            //     interaction.attr('responseIdentifier', value);
            // }
        });

        // $form.find('.js-')
    };

    return SpreadsheetsInteractionStateQuestion;
});
