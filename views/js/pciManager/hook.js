define([
    'i18n',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'qtiItemPci/pciManager/pciManager',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'helpers',
    'css!qtiItemPci_css/pci-manager'
], function(__, interactionsToolbar, PciManager, triggerTpl, helpers){

    var _urls = {
        addRequiredResources : helpers._url('addRequiredResources', 'PciManager', 'qtiItemPci')
    };

    function addManagerButton($interactionSidebar, $modalContainer){

        //get the custom interaction section in the toolbar
        var customInteractionTag = interactionsToolbar.getCustomInteractionTag();
        var $section = interactionsToolbar.getGroup($interactionSidebar, customInteractionTag);
        if(!$section.length){
            //no custom interaction yet, add a section
            $section = interactionsToolbar.addGroup($interactionSidebar, customInteractionTag);
        }

        //add button
        var $button = $(triggerTpl({
            title : __('Manage custom interactions')
        }));
        $section.children('.panel').append($button);

        var pciManager = new PciManager({
            container : $modalContainer,
            interactionSidebar : $interactionSidebar
        });
        $button.on('click', function(){
            pciManager.open();
        });
    }
    
    function addNewInteractionListener(uri){
        //listener:
        $(document).on('elementCreated.qti-widget.pci-hook', function(e, data){
            var element = data.element;
            if(element.qtiClass === 'customInteraction'){
                return;
                $.getJSON(_urls.addRequiredResources, {typeIdentifier : element.typeIdentifier, uri:uri}, function(data){
                    if(data.success){
                        console.log(data.resources);
                    }
                });
            }
        });
    }
    
    var pciManagerHook = {
        init : function(config){
            
            var $interactionSidebar = config.dom.getInteractionToolbar(),
                $modalContainer = config.dom.getModalContainer();

            if(interactionsToolbar.isReady($interactionSidebar)){
                addManagerButton($interactionSidebar, $modalContainer);
            }else{
                //wait until the interaction toolbar construciton is done:
                $interactionSidebar.on('interactiontoolbarready.qti-widget', function(){
                    addManagerButton($interactionSidebar, $modalContainer);
                });
            }
            
            addNewInteractionListener(config.uri);

        }
    };

    return pciManagerHook;
});