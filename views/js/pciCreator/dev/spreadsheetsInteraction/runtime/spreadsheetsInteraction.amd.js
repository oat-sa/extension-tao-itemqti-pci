define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event',
    '../lib/handsontable/handsontable'
], function($, qtiCustomInteractionContext, event, Handsontable) {
    'use strict';

    var spreadsheetsInteraction = {
        
        /**
         * Custom Interaction Hook API: id
         */
        id : -1,
        
        /**
         * Custom Interaction Hook API: getTypeIdentifier
         * 
         * A unique identifier allowing custom interactions to be identified within an item.
         * 
         * @returns {String} The unique identifier of this PCI Hook implementation.
         */
        getTypeIdentifier : function(){
            return 'spreadsheetsInteraction';
        },
        
        /**
         * 
         * 
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config){
            
            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);
            
            // Register the value for the 'id' attribute of this Custom Interaction Hook instance.
            // We consider in this proposal that the 'id' attribute 
            this.id = id;
            this.dom = dom;
            this.config = config || {};

            // Tell the rendering engine that I am ready.
            // Please note that in this proposal, we consider the 'id' attribute to be part of the
            // Custom Interaction Hood API. The Global Context will then inspect the 'id' attribute
            // to know which instance of the PCI hook is requesting a service to be achieved.
            qtiCustomInteractionContext.notifyReady(this);
            
            var self = this;

            var data = [
                ["", "Ford", "Volvo", "Toyota", "Honda"],
                ["2016", 10, 11, 12, 13],
                ["2017", 20, 11, 14, 13],
                ["2018", 30, 15, 12, 13]
            ];

            var $container = $(this.dom);
            var spreadsheet = $container.find('.spreadsheet');

            var hot = new Handsontable(spreadsheet.get(0), {
                data: data,
                rowHeaders: true,
                colHeaders: true
            });
            
            // Bind events
            // $(canvas).on('click', function(e) {
            //
            // });
        },
        
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){
            var y = this._yFromResponse(response);
            

            this._updateResponse(y);
        },
        
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){
            return this._currentResponse;
        },
        
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         * 
         * @param {Object} interaction
         */
        resetResponse : function(){

            this._currentResponse = { base: null };
        },
        
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains 
         * Event listeners are removed and the state and the response are reset
         * 
         * @param {Object} interaction
         */
        destroy : function(){

            var $container = $(this.dom);
            //$container.find('.canvas').off();
        },
        
        /**
         * Restore the state of the interaction from the serializedState.
         * 
         * @param {Object} interaction
         * @param {Object} serializedState - json format
         */
        setSerializedState : function(state){

        },
        
        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         * 
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState : function(){
            return {};
        },
        
        _currentResponse: { base : null },
        _callbacks: [],
        
        _closestMultiple : function(numeric, multiple) {
            return multiple * Math.floor((numeric + multiple / 2) / multiple);
        },
        
        _yFromResponse : function(response) {
            if (response.base === null) {
                return 350;
            } else {
                return 350 - this._closestMultiple(response.base.integer * 25, 25);
            }
        },
        
        _updateResponse : function(y) {
            this._currentResponse = { base: { integer: Math.abs((this._closestMultiple(y, 25) - 350) / 25) } };
        }
    };

    qtiCustomInteractionContext.register(spreadsheetsInteraction);
});
