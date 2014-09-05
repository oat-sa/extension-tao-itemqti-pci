define([
    'i18n',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar'
], function(__, interactionsToolbar){

    function addManagerButton($interactionBar){
        
        //get the custom interaction section in the toolbar
        var customInteractionTag = interactionsToolbar.getCustomInteractionTag();
        var $section = interactionsToolbar.getGroup($interactionBar, customInteractionTag);
        if(!$section.length){
            //no custom interaction yet, add a section
            $section = interactionsToolbar.addGroup($interactionBar, customInteractionTag);
        }
        
        //add button
        var $button = $('<button>', {text : __('manage ...')});
        $section.children('.panel').append($button);

    }

    var pciManagerHook = {
        init : function(config){

            var $interactionBar = config.dom.interactionToolbar;
            
            if(interactionsToolbar.isReady($interactionBar)){
                addManagerButton($interactionBar);
            }else{
                //wait until the interaction toolbar construciton is done:
                $interactionBar.on('interactiontoolbarready.qti-widget', function(){
                    addManagerButton($interactionBar);
                });
            }

        }
    };

    return pciManagerHook;
});