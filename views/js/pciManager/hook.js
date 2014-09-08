define([
    'i18n',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'qtiItemPci/pciManager/pciManager',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'css!qtiItemPci_css/pci-manager'
], function(__, interactionsToolbar, PciManager, triggerTpl){
    
    function addManagerButton($interactionBar, $modalContainer){
        
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
        
        var pciManager = new PciManager($modalContainer);
        $button.on('click', function(){
            pciManager.open();
        });
    }

    var pciManagerHook = {
        init : function(config){
            
            var $interactionBar = config.dom.getInteractionToolbar(),
                $modalContainer = config.dom.getModalContainer();
            
            if(interactionsToolbar.isReady($interactionBar)){
                addManagerButton($interactionBar, $modalContainer);
            }else{
                //wait until the interaction toolbar construciton is done:
                $interactionBar.on('interactiontoolbarready.qti-widget', function(){
                    addManagerButton($interactionBar, $modalContainer);
                });
            }

        }
    };

    return pciManagerHook;
});