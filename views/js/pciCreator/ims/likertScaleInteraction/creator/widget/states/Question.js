define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
], function(stateFactory, Question, formElement) {
    'use strict';

    var stateQuestion = stateFactory.extend(
        Question,
        function enterQuestionState() {
            //
        },
        function leaveQuestionState() {
            //
        }
    );

    /**
     * Setup the property panel
     */
    stateQuestion.prototype.initForm = function() {
        const interaction = this.widget.element;
        const $form = this.widget.$form;

        //render the form using the form template
        this.widget.$form.html(
            //some HTML
        );

        //init form javascript
        formElement.initWidget(this.widget.$form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            //example
            // propertyName: function(i, value){
            //    i.properties[propertyName] = value;
            // }
        });
    };
    return stateQuestion;
});

