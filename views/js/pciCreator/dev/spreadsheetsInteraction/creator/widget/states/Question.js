define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!liquidsInteraction/creator/tpl/propertiesForm',
    'tpl!taoQtiItem/qtiCreator/tpl/notifications/widgetOverlay'
], function (stateFactory, Question, formElement, formTpl, overlayTpl) {
    "use strict";

    var SpreadsheetsInteractionStateQuestion = stateFactory.extend(Question, function () {
        this.widget.$container.append(overlayTpl());
    }, function () {
        this.widget.$container.children('.overlay').remove();
    });

    SpreadsheetsInteractionStateQuestion.prototype.initForm = function () {

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier')
        }));

        formElement.initWidget($form);

        formElement.setChangeCallbacks($form, interaction, {
            identifier : function (i, value) {
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });
    };

    return SpreadsheetsInteractionStateQuestion;
});
