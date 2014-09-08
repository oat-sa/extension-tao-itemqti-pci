define([
    'i18n',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'css!qtiItemPci_css/pci-manager'
], function(__, interactionsToolbar, triggerTpl){
    
    function openManager(){
        
    }
    
    function addManagerButton($interactionBar){
        
        //get the custom interaction section in the toolbar
        var customInteractionTag = interactionsToolbar.getCustomInteractionTag();
        var $section = interactionsToolbar.getGroup($interactionBar, customInteractionTag);
        if(!$section.length){
            //no custom interaction yet, add a section
            $section = interactionsToolbar.addGroup($interactionBar, customInteractionTag);
        }
        
        //add button
        var $button = $(triggerTpl({
            title : __('Manage custom interactions')
        }));
        $section.children('.panel').append($button);
        $button.on('click', function(){
            openManager();
        });
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