define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'spreadsheetsInteraction/creator/widget/Widget',
    'spreadsheetsInteraction/runtime/js/renderer',
    'tpl!spreadsheetsInteraction/creator/tpl/markup'
], function (_, ciRegistry, Widget, Renderer, markupTpl) {
    'use strict';

    var _typeIdentifier = 'spreadsheetsInteraction';

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier: function () {
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget: function () {
            var self = this;

            Widget.offEvents(_typeIdentifier);
            Widget.beforeStateInit(function (event, pci, state) {
                if (pci.typeIdentifier && pci.typeIdentifier === "spreadsheetsInteraction") {
                    if (!pci.widgetRenderer) {
                        pci.widgetRenderer = new Renderer({
                            serial : pci.serial,
                            $container : state.widget.$container,
                            interaction : pci,
                            markup : self.getMarkupTemplate()
                        });
                    }
                }
            }, _typeIdentifier);

            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties: function (pci) {
            return {};
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate: function (pci) {
            //do some stuff

            //var response = pci.getResponseDeclaration();


        },

        /**
         * (required) Gives the qti pci xml template
         * @returns {function} handlebar template
         */
        getMarkupTemplate: function getMarkupTemplate() {
            return markupTpl;
        },

        /**
         * (optional) Allows passing additional data to xml template
         * @params {object} pci - interaction instance
         * @params {object} defaultData - default interaction properties {@see this.getDefaultProperties()}
         * @returns {object} handlebar template context.
         */
        getMarkupData: function getMarkupData(pci, defaultData) {
            return defaultData;
        }
    };

});
