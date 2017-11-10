define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'taoQtiItem/qtiCreator/widgets/helpers/content'
], function(stateFactory, Answer, answerStateHelper){
    'use strict';

    var InteractionStateAnswer = stateFactory.extend(Answer, function initAnswerState(){
        this.widget.$original.find('.likert input').prop('disabled', 'disabled');
    }, function exitAnswerState(){
        this.widget.$original.find('.likert input').removeProp('disabled');
    });

    InteractionStateAnswer.prototype.initResponseForm = function initResponseForm(){

        answerStateHelper.initResponseForm(this.widget, {rpTemplates : ['CUSTOM', 'NONE']});
    };

    return InteractionStateAnswer;
});