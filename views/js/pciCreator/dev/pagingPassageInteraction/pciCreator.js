/*global define*/
define([
    './creator/widget/Widget',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'tpl!./creator/tpl/markup',
], function (Widget, registry, markupTpl) {
    'use strict';
    var _typeIdentifier = 'pagingPassageInteraction';

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
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        getDefaultProperties : function (pci) {
            return {
                choiceType: 'checkbox',
                choices: ['choice_1']
            };
        },
        /**
         * (optional) Callback to execute on the 
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        afterCreate : function (pci) {
            //do some stuff
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
         * 
         * @returns {function} handlebar template
         */
        getMarkupData : function (pci, defaultData) {
            defaultData.prompt = pci.data('prompt');
            defaultData.passage = pci.data('passage');
            return defaultData;
        }
    };
});