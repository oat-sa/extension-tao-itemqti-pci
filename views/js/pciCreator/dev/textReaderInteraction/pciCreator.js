/*global define*/
define([
    './creator/widget/Widget',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'tpl!./creator/tpl/markup'
], function (Widget, registry, markupTpl) {
    'use strict';
    var _typeIdentifier = 'textReaderInteraction';

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
                choiceType: 'radio',
                pageHeight: 200,
                tabsPosition: 'top',
                choices: ['Choice 1', 'Choice 2', 'Choice 3'],
                pages: [
                    {label : 'Page 1', content : 'page 1 content', id : 0, columns: 1}, 
                    {label : 'Page 2', content : 'page 2 content', id : 1, columns: 2},
                    {label : 'Page 3', content : 'page 3 content', id : 2, columns: 3}
                ],
                buttonLabels : {
                    prev : 'Previous',
                    next : 'Next'
                }
            };
        },
        /**
         * (optional) Callback to execute on the 
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        afterCreate : function (pci) {
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
            return defaultData;
        }
    };
});