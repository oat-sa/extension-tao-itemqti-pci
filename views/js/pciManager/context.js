define([
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
], function(interactionsToolbar, ciRegistry){

    var pciManagerContext = {
        get : function(typeIdentifier){

            return {
                baseUrl : ciRegistry.getPath(typeIdentifier),
                tags : [interactionsToolbar.getCustomInteractionTag()]
            };
        }
    };

    return pciManagerContext;
});