define([
    'qtiCustomInteractionContext',
    'IMSGlobal/jquery_2_1_1',
    //'audioRecordingInteraction/runtime/js/renderer',
    'renderer',
    'OAT/util/event'
], function(qtiCustomInteractionContext, $, renderer, event){
    'use strict';

    var _renderer;

    var audioRecordingInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'audioRecordingInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config || {};

            // todo: make this async ?
            _renderer = renderer(this.id, this.dom, this.config);
            _renderer.render();

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){
            if (response.base && response.base.file) {
                _renderer.setRecording(response.base.file);
            } else {
                _renderer.setRecording();
            }
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){
            var recording = _renderer.getRecording();
            var response;
            if (! recording) {
                response = {
                    base: null
                };
            } else {
                response = {
                    base: {
                        file: recording
                    }
                };
            }
            return response;
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse : function(){
            //todo: implement this
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy : function(){
            //todo: implement this
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState : function(state){
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(audioRecordingInteraction);
});