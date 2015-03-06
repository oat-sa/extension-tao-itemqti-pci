/*global define,console*/
define(
    [
        'qtiCustomInteractionContext',
        'OAT/util/event',
        'pagingPassageInteraction/runtime/js/renderer'
    ],
    function (qtiCustomInteractionContext, event, renderer) {
        'use strict';
        qtiCustomInteractionContext.register({
            id : -1,
            getTypeIdentifier : function () {
                return 'pagingPassageInteraction';
            },
            /**
             * Render the PCI : 
             * @param {String} id
             * @param {Node} dom
             * @param {Object} config - json
             */
            initialize : function (id, dom, config) {
                var that = this;
                this.id = id;
                this.dom = dom;
                this.config = config || {};
                this.$container = $(dom);
                //add method on(), off() and trigger() to the current object
                event.addEventMgr(this);
                
                //tell the rendering engine that I am ready
                qtiCustomInteractionContext.notifyReady(this);
                renderer.setContainer(this.$container);
                
                renderer.renderChoices(config);
                renderer.test = 123;
                this.$container.on('click', '.js-add-choice', function () {
                    var num = config.choices.length + 1;
                    config.choices.push('choice_' + num);
                    renderer.renderChoices(config);
                });
                
                this.$container.on('click', '.js-remove-choice', function () {
                    var num = $(this).data('choice-index');
                    config.choices.splice(num, 1);                    
                    renderer.renderChoices(config);
                });
                
                //listening to dynamic configuration change
                /*this.on('levelchange', function(level){
                    _this.config.level = level;
                    renderer.renderChoices(_this.id, _this.dom, _this.config);
                });*/
            },
            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             * 
             * @param {Object} interaction
             * @param {Object} response
             */
            setResponse : function (response) {
                var value = response && response.base ? parseInt(response.base.integer) : -1;

                this.$container.find('input[value="' + value + '"]').prop('checked', true);
            },
            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             * 
             * @param {Object} interaction
             * @returns {Object}
             */
            getResponse : function () {
                var value = parseInt(this.$container.find('input:checked').val()) || 0;

                return {base : {integer : value}};
            },
            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             * 
             * @param {Object} interaction
             */
            resetResponse : function () {
                this.$container.find('input').prop('checked', false);
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains 
             * Event listeners are removed and the state and the response are reset
             * 
             * @param {Object} interaction
             */
            destroy : function () {
                this.$container.off().empty();
            },
            /**
             * Restore the state of the interaction from the serializedState.
             * 
             * @param {Object} interaction
             * @param {Object} serializedState - json format
             */
            setSerializedState : function (state) {
                
            },
            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             * 
             * @param {Object} interaction
             * @returns {Object} json format
             */
            getSerializedState : function () {

                return {};
            }
        });
    }
);