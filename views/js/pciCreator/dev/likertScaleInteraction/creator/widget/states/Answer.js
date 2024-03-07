define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/helpers/content'
], function(stateFactory, Answer, answerStateHelper){
    'use strict';

    var InteractionStateAnswer = stateFactory.extend(Answer, function initAnswerState(){
        this.widget.$original.find('.likert input').prop('disabled', true);
    }, function exitAnswerState(){
        this.widget.$original.find('.likert input').prop('disabled', false);
    });

    InteractionStateAnswer.prototype.initResponseForm = function initResponseForm(){

        // CUSTOM option won't appear except with xmlResponseProcessor extension!
        answerStateHelper.initResponseForm(this.widget, {rpTemplates : ['CUSTOM', 'NONE']});
    };

    return InteractionStateAnswer;
});
