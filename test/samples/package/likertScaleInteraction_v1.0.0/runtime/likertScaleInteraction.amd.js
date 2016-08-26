/*
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define(['qtiCustomInteractionContext', 'IMSGlobal/jquery_2_1_1', 'likertScaleInteraction/runtime/js/renderer', 'OAT/util/event'], function(qtiCustomInteractionContext, $, renderer, event){
    'use strict';

    var likertScaleInteraction = {
        id : -1,
        getTypeIdentifier : function(){
            return 'likertScaleInteraction';
        },
        /**
         * Render the PCI : 
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize : function(id, dom, config, assetManager){

            //add method on(), off() and trigger() to the current object
            event.addEventMgr(this);

            var _this = this;
//            var assetManager = qtiCustomInteractionContext.getAssetResolver(this.getTypeIdentifier());//that would introduce dependency between the asset manager and global pci runtime context
            this.id = id;
            this.dom = dom;
            this.config = config || {};

            renderer.render(this.id, this.dom, this.config, assetManager);

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            //listening to dynamic configuration change
            this.on('levelchange', function(level){
                _this.config.level = level;
                renderer.renderChoices(_this.id, _this.dom, _this.config);
            });
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse : function(response){

            var $container = $(this.dom),
                value = response && response.base ? parseInt(response.base.integer) : -1;

            $container.find('input[value="' + value + '"]').prop('checked', true);
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         * 
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse : function(){

            var $container = $(this.dom),
                value = parseInt($container.find('input:checked').val()) || 0;

            return {base : {integer : value}};
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         * 
         * @param {Object} interaction
         */
        resetResponse : function(){

            var $container = $(this.dom);

            $container.find('input').prop('checked', false);
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
            $container.off().empty();
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
        }
    };

    qtiCustomInteractionContext.register(likertScaleInteraction);
});