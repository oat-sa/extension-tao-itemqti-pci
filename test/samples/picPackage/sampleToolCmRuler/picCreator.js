define([
    'lodash',
    'taoQtiItem/qtiCreator/editor/infoControlRegistry',
    'sampleToolCmRuler/creator/widget/Widget',
    'tpl!sampleToolCmRuler/creator/tpl/cm-ruler'
], 
function(_, registry, Widget, markupTpl){


    /**
     * Retrieve data from manifest
     */
    var manifest = registry.get('sampleToolCmRuler').manifest;

    /**
     * Configuration of the container
     *
     * t/r/b/l is meant to be an alternative to the tl/tr/br/bl syntax.
     * Using them together might look rather weird.
     */
    var is = {
        transparent: true, 
        movable: true, 
        rotatable: {
            tl: false,
            tr: false,
            bl: false,
            br: false,
            t:  false,
            r:  true,
            b:  false,
            l:  false
        },
        adjustable: {
            x:  false, 
            y:  false, 
            xy: false
        } 
    };
    is.transmutable = _.some(is.rotatable, Boolean) || _.some(is.adjustable, Boolean);

    // the position in which the checkbox should appear
    var position = 4;

    return {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         * 
         * @returns {String}
         */
        getTypeIdentifier : function(){
            return manifest.typeIdentifier;
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
         * (optional) Get the default properties values of the PIC.
         * Used on new PIC instance creation
         * 
         * @returns {Object}
         */
        getDefaultProperties : function(pic){
            return {
                is: is,
                position: position
            };
        },

        /**
         * (optional) Callback to execute on the 
         * Used on new pic instance creation
         * 
         * @returns {Object}
         */
        afterCreate : function(pic){
            //do some stuff
        },

        /**
         * (required) Returns the QTI PIC XML template 
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
        getMarkupData : function(pic, defaultData){
            
            defaultData = _.defaults(defaultData, {
                typeIdentifier : manifest.typeIdentifier,
                title : manifest.label,
                is: is,
                position: position,
                //referenced as a required file in manifest.media[]
                icon : manifest.typeIdentifier + '/runtime/media/cm-ruler-icon.svg',
                alt : manifest.short || manifest.label
            });
            
            return defaultData;
        }
    };
});