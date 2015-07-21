/**  
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies;
 *               
 */   
define([
    './creator/widget/Widget',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    './runtime/js/renderer',
    'tpl!./runtime/tpl/markup'
], function (Widget, registry, Renderer, markupTpl) {
    'use strict';
    var _typeIdentifier = 'adaptiveChoiceInteraction';

    return {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         * 
         * @returns {String}
         */
        getTypeIdentifier : function () {
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         * 
         * @returns {Object} Widget
         */
        getWidget : function () {
            Widget.beforeStateInit(function (event, pci, state) {
                if (pci.typeIdentifier && pci.typeIdentifier === "adaptiveChoiceInteraction") {
                    if (!pci.widgetRenderer) {
                        pci.widgetRenderer = new Renderer({
                            serial : pci.serial,
                            $container : state.widget.$container,
                            templates : {
                                markupTpl : markupTpl
                            },
                            interaction : pci        
                        });
                    }
                    pci.widgetRenderer.setState(state.name);
                    pci.widgetRenderer.render(pci.properties);
                }
            });
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         * 
         * @params {object} pci - interaction instance
         * @returns {Object}
         */
        getDefaultProperties : function (pci) {
            return {
                prompt : 'lorem ipsum',
                choiceType : 'radio',
                choices : [
                    {label : 'Choice 1'}, 
                    {label : 'Choice 2'} 
                ]
            };
        },
        /**
         * (optional) Callback to execute on the 
         * Used on new pci instance creation
         * 
         * @params {object} pci - interaction instance
         * @returns {Object}
         */
        afterCreate : function (pci) {
            var response = pci.getResponseDeclaration();
        },
        /**
         * (required) Gives the qti pci xml template 
         * 
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function () {
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         * @params {object} pci - interaction instance
         * @params {object} defaultData - deafault interaction properties {@see this.getDefaultProperties()}
         * @returns {object} handlebar template context.
         */
        getMarkupData : function (pci, defaultData) {
            var data = _.merge(pci.properties, defaultData);
            data.states = {answer : true};
            
            return data;
        }
    };
});