define([
    'htmlTemplateTextboxInteraction/creator/widget/Widget',
    'tpl!htmlTemplateTextboxInteraction/creator/tpl/markup'
], function (Widget, markupTpl) {
    'use strict';

    const typeIdentifier = 'htmlTemplateTextboxInteraction';

    return {

        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier() {
            return typeIdentifier;
        },

        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget() {
            return Widget;
        },

        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties() {
            return {
                html: '<div><textarea></textarea><p class="wordcount"></p></div>',
                responseSelector: 'textarea',
                wordcountSelector: '.wordcount',
                isReviewMode: false
            };
        },

        /**
         * (optional) Callback to execute on the
         * new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate() {

        },

        /**
         * (required) Gives the qti pci markup template
         *
         * @returns {function} template function
         */
        getMarkupTemplate() {
            return markupTpl;
        },

        /**
         * (optional) Allows passing additional data to xml template (see templateData)
         *
         * @returns {Object} template data
         */
        getMarkupData(pci, defaultData) {
            return Object.assign({
                serial: Date.now(),
                prompt: pci.data('prompt')
            }, defaultData);
        }
    };
});
