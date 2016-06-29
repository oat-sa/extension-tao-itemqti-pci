define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'qtiItemPci/pciManager/pciManager',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'css!qtiItemPciCss/pci-manager'
], function($, _, __, pluginFactory, interactionsToolbar, PciManager, triggerTpl) {
    'use strict';

    var _ns = '.customRpEditor';

    function addManagerButton($container, $interactionSidebar, itemUri){

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
            container : $container,
            interactionSidebar : $interactionSidebar,
            itemUri : itemUri
        });
        $button.on('click', function(){
            pciManager.open();
        });
    }

    return pluginFactory({
        name : 'pciManager',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var itemUri = this.getHost().getItem().data('uri');
            var $container = this.getAreaBroker().getModalContainerArea();
            var $interactionSidebar = this.getAreaBroker().getInteractionPanelArea();

            if(interactionsToolbar.isReady($interactionSidebar)){
                addManagerButton($container, $interactionSidebar, itemUri);
            }else{
                //wait until the interaction toolbar construciton is done:
                $interactionSidebar.on('interactiontoolbarready.qti-widget', function(){
                    addManagerButton($container, $interactionSidebar, itemUri);
                });
            }
        }
    });
});

