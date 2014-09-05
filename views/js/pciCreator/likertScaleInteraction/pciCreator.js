define([
    'qtiItemPci/pciManager/context',
    'likertScaleInteraction/widget/Widget',
    'tpl!likertScaleInteraction/tpl/xml',
], function(context, Widget, xmlTpl){

    var _context = context.get('likertScaleInteraction');
    
    var _typeIdentifier = 'likertScaleInteraction';

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

            _context.tags.push('mcq', 'likert');

            return {
                title : 'Likert Interaction', //currently no translation available 
                icon : _context.baseUrl + 'img/icon.svg', //use baseUrl from context
                short : 'Likert',
                qtiClass : 'customInteraction.' + likertScaleInteractionCreator.getTypeIdentifier(), //custom interaction is block type
                tags : _context.tags
            };
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return likertScaleInteractionCreator;
});