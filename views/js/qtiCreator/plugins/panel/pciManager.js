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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/plugin',
    'core/promise',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'qtiItemPci/pciManager/pciManager',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'css!qtiItemPciCss/pci-manager'
], function($, _, __, pluginFactory, Promise, interactionsToolbar, pciManager, ciRegistry, triggerTpl) {
    'use strict';

    var _ns = '.pciManager';

    return pluginFactory({
        name : 'pciManager',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){

            var $container = this.getAreaBroker().getModalContainerArea();
            var $interactionSidebar = this.getAreaBroker().getInteractionPanelArea();

            interactionsToolbar.whenReady($interactionSidebar).then(function addManagerButton(){

                var pciMgr;
                var $button;

                //get the custom interaction section in the toolbar
                var customInteractionTag = interactionsToolbar.getCustomInteractionTag();
                var $section = interactionsToolbar.getGroup($interactionSidebar, customInteractionTag);
                if(!$section.length){
                    //no custom interaction yet, add a section
                    $section = interactionsToolbar.addGroup($interactionSidebar, customInteractionTag);
                }

                //instantiate the pci manager component
                pciMgr = pciManager({
                    renderTo : $container,
                }).on('pciAdded', function(typeIdentifier){
                    console.log('pciAdded', typeIdentifier);
                }).on('pciEnabled', function(typeIdentifier){
                    console.log('pciEnabled', typeIdentifier);
                    if(interactionsToolbar.exists($interactionSidebar, 'customInteraction.' + typeIdentifier)){
                        interactionsToolbar.enable($interactionSidebar, 'customInteraction.' + typeIdentifier);
                    }else{
                        ciRegistry.loadCreators({reload: true, enabledOnly : true}).then(function(){
                            var data = ciRegistry.getAuthoringData(typeIdentifier);
                            if(data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                                if(!interactionsToolbar.exists($interactionSidebar, data.qtiClass)){

                                    //add toolbar button
                                    var $insertable = interactionsToolbar.add($interactionSidebar, data);

                                    //init insertable
                                    var $itemBody = $('.qti-itemBody');//current editor instance
                                    $itemBody.gridEditor('addInsertables', $insertable, {
                                        helper : function(){
                                            return $(this).find('.icon').clone().addClass('dragging');
                                        }
                                    });
                                    //self.trigger('updateListing');
                                }
                            }else{
                                throw 'invalid authoring data for custom interaction';
                            }
                        }).catch(function(err){
                            console.log('err', err);
                        });
                    }
                }).on('pciDisabled', function(typeIdentifier){
                    console.log('pciDisabled', typeIdentifier);
                    interactionsToolbar.disable($interactionSidebar, 'customInteraction.' + typeIdentifier);
                });

                //add button
                $button = $(triggerTpl({
                    title : __('Manage custom interactions')
                })).on('click'+_ns, function(){
                    pciMgr.open();
                });
                $section.children('.panel').append($button);
            });
        }
    });
});

