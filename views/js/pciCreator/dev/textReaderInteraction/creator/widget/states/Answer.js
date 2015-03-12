define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState',
    'textReaderInteraction/runtime/js/renderer'
], function(stateFactory, Answer, answerStateHelper, renderer){

    var textReaderStateAnswer = stateFactory.extend(Answer, function(){
        //forward to one of the available sub state, according to the response processing template
        answerStateHelper.forward(this.widget);
        
    }, function(){
        
    });
    
    return  textReaderStateAnswer;
});