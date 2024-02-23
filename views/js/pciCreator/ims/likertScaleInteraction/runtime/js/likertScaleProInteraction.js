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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'qtiCustomInteractionContext',
    'likertScaleInteraction/runtime/js/renderer',
    'likertScaleInteraction/runtime/js/event'
], function(qtiCustomInteractionContext, renderer, event){
    'use strict';

    const _typeIdentifier = 'likertScaleInteraction';

    function likertInteractionFactory() {
        return {

            /*********************************
             *
             * IMS specific PCI API property and methods
             *
             *********************************/

            typeIdentifier: _typeIdentifier,

            /**
             * initialize the PCI object. As this object is cloned for each instance, using "this" is safe practice.
             * @param {DOMELement} dom - the dom element the PCI can use
             * @param {Object} config - the standard configuration object
             * @param {Object} [state] - the json serialized state object, returned by previous call to getStatus(), use to initialize an
             */
            // getInstance: function getInstance(dom, config, state) {
            //     var response = config.boundTo;
            //     //simply mapped to existing TAO PCI API
            //     this.initialize(Object.getOwnPropertyNames(response).pop(), dom, config.properties, config.assetManager);
            //     this.setSerializedState(state);

            //     //tell the rendering engine that I am ready
            //     if (typeof config.onready === 'function') {
            //         config.onready(this, this.getState());
            //     }
            // },

            /**
             * Get the current state fo the PCI
             * @returns {Object}
             */
            // getState: function getState() {
            //     //simply mapped to existing TAO PCI API
            //     return this.getSerializedState();
            // },

            /**
             * Called by delivery engine when PCI is fully completed
             */
            // oncompleted: function oncompleted() {
            //     this.destroy();
            // },

            /*********************************
             *
             * TAO and IMS shared PCI API methods
             *
             *********************************/

            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @returns {Object}
             */
            getResponse: function() {
                const checkedInput = this.dom.querySelector('input:checked');
                const value = (checkedInput && parseInt(checkedInput.value)) || 0;

                return { base: { integer: value } };
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             * Event listeners are removed and the state and the response are reset
             *
             * @param {Object} interaction
             */
            destroy: function() {
                this.dom.replaceChildren();
            },


            /*********************************
             *
             * TAO specific PCI API methods
             *
             *********************************/

            /**
             * Get the type identifier of a pci
              * @returns {string}
             */
            getTypeIdentifier: function() {
                return _typeIdentifier;
            },

            /**
             * Render the PCI :
             * @param {String} id - responseIdentifier
             * @param {Node} dom - container provided by host
             * @param {Object} properties (PCI's config.properties)
             */
            initialize: function(id, dom, properties) {
                //add methods on(), off() and trigger() to the current object
                // event.addEventMgr(this);

                this.dom = dom;
                this.properties = properties || {};

                renderer.render(id, this.dom, this.properties);

                //listening to dynamic configuration changes
                // this.on('levelchange', level => {
                //     this.config.level = level;
                //     renderer.renderChoices(id, this.dom, this.config);
                // });
                // this.on('configChange', detail => {
                //     Object.assign(this.config, detail);
                //     renderer.renderChoices(id, this.dom, this.config);
                //     renderer.renderLabels(this.dom, this.config);
                // });
            },

            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @param {Object} response
             */
            setResponse: function(response) {
                const value = response && response.base ? parseInt(response.base.integer) : -1;
                const input = this.dom.querySelector(`input[value="${value}"]`);
                if (input) {
                    input.setAttribute('checked', true);
                }
            },

            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             *
             * @param {Object} interaction
             */
            resetResponse: function() {
                this.dom.querySelector('input:checked').setAttribute('checked', false);
            },

            /**
             * Restore the state of the interaction from the serializedState.
             *
             * @param {Object} interaction
             * @param {Object} serializedState - json format
             */
            setSerializedState: function(state) {
                if(state && state.response) {
                    this.setResponse(state.response);
                }
            },

            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             *
             * @param {Object} interaction
             * @returns {Object} json format
             */
            getSerializedState: function() {
                return { response : this.getResponse() };
            }
        }
    };

    qtiCustomInteractionContext.register({
        typeIdentifier: _typeIdentifier,

        getInstance(dom, config, state) {
            const likertInteraction = likertInteractionFactory();

            // create a IMS PCI instance object that will be provided in onready
            const pciInstance = {
                getResponse() {
                    return likertInteraction.getResponse();
                },

                /**
                 * Get the current state of the PCI
                 * @returns {Object}
                 */
                getState() {
                    return likertInteraction.getSerializedState();
                },

                /**
                 * Called by delivery engine when PCI is fully completed
                 */
                oncompleted() {
                    likertInteraction.destroy();
                }
            };

            // event manager is necessary only for creator part
            event.addEventMgr(pciInstance);

            const boundTo = config.boundTo;
            const responseIdentifier = Object.keys(boundTo)[0];
            let response = boundTo[responseIdentifier];

            // initialize and set previous response/state
            likertInteraction.initialize(responseIdentifier, dom, config.properties);
            likertInteraction.setResponse(response);
            likertInteraction.setSerializedState(state);

            pciInstance.on('configChange', newProperties => {
                Object.assign(likertInteraction.properties, newProperties);
                renderer.render(responseIdentifier, dom, likertInteraction.properties);
            });

            // PCI instance is ready to run
            config.onready(pciInstance);

            likertInteraction.pciInstance = pciInstance;
        }
    });

    // return likertInteraction;
});