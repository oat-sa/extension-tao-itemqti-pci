define([
    'helpers',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar'
], function(helpers, interactionsToolbar){

    var pciManagerContext = {
        get : function(typeIdentifier){

            return {
                baseUrl : helpers._url('getFile', 'Creator', 'qtiItemPci', {file : typeIdentifier + '/'}),
                tags : [interactionsToolbar.getCustomInteractionTag()]
            };
        }
    };
    
    return pciManagerContext;
});