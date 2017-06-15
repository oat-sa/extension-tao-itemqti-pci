/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
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

    var _ns = '.pciManager';

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

