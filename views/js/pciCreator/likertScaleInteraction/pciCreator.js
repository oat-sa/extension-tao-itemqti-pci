define([
    'lodash',
    'qtiItemPci/pciManager/context',
    'likertScaleInteraction/widget/Widget',
    'tpl!likertScaleInteraction/tpl/markup',
    'json!likertScaleInteraction/pciCreator'
], function(_, context, Widget, markupTpl, manifest){

    var _typeIdentifier = manifest.typeIdentifier;
    var _context = context.get(_typeIdentifier);
    
    //@todo : to be moved in proper location
    function getAuthoringDataFromManifest(manifest){

        return {
            label : manifest.label, //currently no translation available 
            icon : _context.baseUrl + manifest.icon, //use baseUrl from context
            short : manifest.short,
            qtiClass : 'customInteraction.' + manifest.typeIdentifier, //custom interaction is block type
            tags : _.union(['Custom Interactions'], manifest.tags),
        };
    }

    var likertScaleInteractionCreator = {
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
        getDefaultPciProperties : function(pci){
            return {
                literal : 0,
                scale : 5,
                'label-min' : 'min',
                'label-max' : 'max'
            };
        },
        /**
         * (optional) Callback to execute on the 
         * Used on new pci instance creation
         * 
         * @returns {Object}
         */
        afterCreate : function(pci){

            pci.markup = '<div>stuff</div>';
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
            return defaultData;
        },
        
        /**
         * (required) get data needed to display
         * 
         * @deprecated
         * @todo no longer useful as the manifest qtiCreator.json contains all need data to build it
         * @returns {object}
         */
        getAuthoringData : function(){
            
            return getAuthoringDataFromManifest(manifest);
        },
        
        getManifest : function(){
            return manifest;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});