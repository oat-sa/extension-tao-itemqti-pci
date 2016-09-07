define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/customInteractionRegistry',
    'mathEntryInteraction/creator/widget/Widget',
    'tpl!mathEntryInteraction/creator/tpl/markup'
], function(_, ciRegistry, Widget, markupTpl){

    var _typeIdentifier = 'mathEntryInteraction';

    var mathEntryInteractionCreator = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier : function(){
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget : function(){
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties : function(){
            return {
                tool_frac:      true,
                tool_sqrt:      true,
                tool_exp:       true,
                tool_log:       true,
                tool_ln:        true,
                tool_e:         true,
                tool_pi:        true,
                tool_cos:       true,
                tool_sin:       true,
                tool_lte:       true,
                tool_gte:       true,
                tool_times:     true,
                tool_divide:    true
            };
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate : function(pci){
            //do some stuff
        },
        /**
         * (required) Gives the qti pci xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupTemplate : function(){
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupData : function(pci, defaultData){
            defaultData.prompt = pci.data('prompt');
            return defaultData;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return mathEntryInteractionCreator;
});