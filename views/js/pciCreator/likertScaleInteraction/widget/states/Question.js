define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!taoQtiItem/qtiCreator/tpl/forms/interactions/choice',
    'lodash'
], function(stateFactory, Question, formElement, formTpl, _){

    var LikertInteractionStateQuestion = stateFactory.extend(Question);

    LikertInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element;

        $form.html(formTpl({
            shuffle : !!interaction.attr('shuffle'),
            maxChoices : parseInt(interaction.attr('maxChoices')),
            minChoices : parseInt(interaction.attr('minChoices')),
            choicesCount : _.size(_widget.element.getChoices())
        }));

        formElement.initWidget($form);
        
        //init data change callbacks
        var callbacks = {};
        formElement.setChangeCallbacks($form, interaction, callbacks);
        
    };

    return LikertInteractionStateQuestion;
});
