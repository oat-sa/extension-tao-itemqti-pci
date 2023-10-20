define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
], function(stateFactory, Correct){

    var LiquidsInteractionStateCorrect = stateFactory.create(Correct, function(){

        var widget = this.widget;
        var interaction = widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        var correct = Object.values(responseDeclaration.getCorrect());

        // show correct response in liquid container.
        if (typeof correct[0] !== 'undefined') {
            interaction.setResponse( { base: { integer: correct[0] } });
        }

        interaction.onPci('responsechange.question', function(response){
            var correctResponse = [];

            if (response.base !== null) {
                correctResponse.push(response.base.integer);
            }

            responseDeclaration.setCorrect(correctResponse);
        });

    }, function(){
        var widget = this.widget;
        var interaction = widget.element;

        interaction.resetResponse();
        interaction.offPci('.question');
    });

    return LiquidsInteractionStateCorrect;
});
