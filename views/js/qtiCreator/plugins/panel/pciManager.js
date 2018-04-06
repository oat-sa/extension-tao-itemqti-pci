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
    'util/url',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'qtiItemPci/pciManager/pciManager',
    'tpl!qtiItemPci/pciManager/tpl/managerTrigger',
    'css!qtiItemPciCss/pci-manager'
], function($, _, __, pluginFactory, url, ciRegistry, interactionsToolbar, pciManager, triggerTpl) {
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

                //instantiate the pci manager component
                var pciMgr = pciManager({
                    renderTo : $container,
                    loadUrl : url.route('getRegisteredImplementations', 'PciManager', 'qtiItemPci'),
                    disableUrl : url.route('disable', 'PciManager', 'qtiItemPci'),
                    enableUrl : url.route('enable', 'PciManager', 'qtiItemPci'),
                    verifyUrl : url.route('verify', 'PciManager', 'qtiItemPci'),
                    addUrl : url.route('add', 'PciManager', 'qtiItemPci')
                }).on('pciAdded', function(typeIdentifier){
                    this.trigger('pciEnabled', typeIdentifier);
                }).on('pciEnabled', function(typeIdentifier){
                    if(interactionsToolbar.exists($interactionSidebar, 'customInteraction.' + typeIdentifier)){
                        ciRegistry.enable(typeIdentifier);
                        interactionsToolbar.enable($interactionSidebar, 'customInteraction.' + typeIdentifier);
                    }else{
                        ciRegistry.loadCreators({reload: true}).then(function(){
                            var $insertable, $itemBody;
                            var data = ciRegistry.getAuthoringData(typeIdentifier);
                            if(data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                                ciRegistry.enable(typeIdentifier);
                                if(!interactionsToolbar.exists($interactionSidebar, data.qtiClass)){

                                    //add toolbar button
                                    $insertable = interactionsToolbar.add($interactionSidebar, data);

                                    //init insertable
                                    $itemBody = $('.qti-itemBody');//current editor instance
                                    $itemBody.gridEditor('addInsertables', $insertable, {
                                        helper : function(){
                                            return $(this).find('.icon').clone().addClass('dragging');
                                        }
                                    });
                                }
                            }else{
                                throw 'invalid authoring data for custom interaction';
                            }
                        });
                    }
                }).on('pciDisabled', function(typeIdentifier){
                    ciRegistry.disable(typeIdentifier);
                    interactionsToolbar.disable($interactionSidebar, 'customInteraction.' + typeIdentifier);
                });

                //get the custom interaction section in the interaction toolbar toolbar
                var customInteractionTag = interactionsToolbar.getCustomInteractionTag();

                //get the location of the pci manager trigger
                var $section = interactionsToolbar.getGroup($interactionSidebar, customInteractionTag);
                if(!$section.length){
                    //no custom interaction yet, add a section
                    $section = interactionsToolbar.addGroup($interactionSidebar, customInteractionTag);
                }

                //add pci manager trigger
                $(triggerTpl({
                    title : __('Manage custom interactions')
                })).on('click'+_ns, function(){
                    pciMgr.open();
                }).appendTo($section.children('.panel'));
            });
        }
    });
});

