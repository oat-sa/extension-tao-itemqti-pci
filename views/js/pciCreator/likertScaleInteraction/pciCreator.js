define([
    'i18n',
    'qtiLikertScaleCreator/widget/Widget',
    'tpl!qtiLikertScaleCreator/tpl/xml'
], function(__, Widget, xmlTpl){

    var likertScaleInteractionCreator = {
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
                prompt : '',
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
            //do nothing
        },
        /**
         * (required) Gives the qti pci xml template 
         * 
         * @returns {function} handlebar template
         */  
        getXmlTemplate : function(){
            return xmlTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         * 
         * @returns {function} handlebar template
         */ 
        getXmlData : function(pci, defaultData){
            return defaultData;
        },
        /**
         * (required) get data needed to display
         * @returns {object}
         */
        getAuthoringData : function(){
            return {
                title : __('Likert Interaction'),
                icon : 'likert', //@todo : generalize here
                short : __('Likert'),
                qtiClass : 'customInteraction.likert',//custom interaction is block type
                tags:['mcq']
            };
        }
    };
    
    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});