define([
    'qtiCustomInteractionContext',
    './DomApi',
    'taoQtiItem/portableLib/OAT/util/event'
], function (qtiCustomInteractionContext, DomApi, event) {
    'use strict';

    const _typeIdentifier = 'htmlTemplateTextboxInteraction';

    const maxlength = 10000; // limit payload

    function getBlobURL(code, type) {
        const blob = new Blob([code], { type })
        return URL.createObjectURL(blob)
    };

    function getCounts(text = '') {
        const wordSeparators = '\\s.,:;?!&#%/*+=';
        const wordRegex = new RegExp(`[^${wordSeparators}]+`, 'g');
        const wordMatches = (typeof text === 'string' && text.match(wordRegex)) || [];
        return {
            words: wordMatches.length,
            chars: text.length
        };
    }

    function htmlTemplateTextboxInteractionFactory() {
        return {

            /*********************************
             *
             * IMS specific PCI API property and methods
             *
             *********************************/

            typeIdentifier: _typeIdentifier,

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
                const responseElt = this.getResponseElt();
                this.responseValue = responseElt?.value?.substring(0, maxlength) || this.responseValue?.substring(0, maxlength) || null;
                this.response = { base: { string: this.responseValue } };
                return this.response;
            },

            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             * Event listeners are removed and the state and the response are reset
             *
             * @param {Object} interaction
             */
            destroy: function() {
                this.dom.innerHTML = '';
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
             * Render the PCI
             * @param {String} responseIdentifier
             * @param {HTMLElement} dom - container provided by host
             * @param {Object} properties (PCI's config.properties)
             */
            initialize: function(responseIdentifier, dom, properties) {
                this.responseIdentifier = responseIdentifier;
                this.dom = dom;
                this.properties = properties || {};

                // get the markup-iframe (always present)
                this.iframe = dom.querySelector('iframe');
                this.iframe.setAttribute('sandbox', 'allow-same-origin');
                this.iframe.dataset.responseIdentifier = responseIdentifier;
                this.iframe.style = 'border:none; width:100%;';
                this.render();
            },

            render: function() {
                const iframeOnload = () => this.postRender();

                // may not be needed - can I just add in initialize?
                this.iframe.removeEventListener('load', iframeOnload);
                this.iframe.addEventListener('load', iframeOnload);

                // fill the markup-iframe
                try {
                    this.iframe.src = getBlobURL(this.properties.html, 'text/html' );
                } catch (e) {
                    this.iframe.src = getBlobURL('<i>invalid or missing <code>html</code> property</i>', 'text/html' );
                }
            },

            /**
             * Wire up events and attributes after the iframe is done loading
             */
            postRender: function() {
                this.iframe.height = this.iframe.contentWindow?.document?.body?.scrollHeight || 500;

                const responseElt = this.getResponseElt();

                // set initial response
                if (responseElt) {
                    responseElt.value = this.responseValue;

                    if (!responseElt.getAttribute('maxlength')) {
                        responseElt.setAttribute('maxlength', maxlength);
                    }

                    if (this.properties.isReviewMode) {
                        responseElt.setAttribute('readonly', 'true');
                    }
                    // set up events API
                    responseElt.addEventListener('input', e => {
                        this.domApi.dispatch('responsechange', { detail: e.target.value });
                    });
                }

                this.updateWordcount();
            },

            /**
             * Update the innerHTML of the defined wordcount element with the word count text
             */
            updateWordcount: function() {
                if (this.properties?.wordcountSelector) {
                    const wordcountElt = this.iframe?.contentDocument?.querySelector(this.properties.wordcountSelector);
                    if (wordcountElt) {
                        // initial
                        const { words } = getCounts(this.responseValue);
                        wordcountElt.innerHTML = `${words} word(s)`;

                        const responseElt = this.getResponseElt();
                        if (responseElt) {
                            // updates
                            responseElt.addEventListener('input', (e) => {
                                const { words } = getCounts(e.target.value);
                                wordcountElt.innerHTML = `${words} word(s)`;
                            });
                        }
                    }
                }
            },

            /**
             * Get the rendered element defined by the properties as holding the response.
             * Typically it will be a textarea or an input in this PCI.
             * @returns {HTMLElement|null}
             */
            getResponseElt: function() {
                return this.iframe?.contentDocument?.querySelector(this.properties.responseSelector);
            },

            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} interaction
             * @param {Object} response
             */
            setResponse: function(response) {
                const responseElt = this.getResponseElt();
                if (responseElt) {
                    responseElt.value = response?.base?.string || '';
                }
            },

            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             *
             * @param {Object} interaction
             */
            resetResponse: function() {
                this.setResponse({ base: null });
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

        /**
         * initialize the PCI object. As this object is cloned for each instance, using "this" is safe practice.
         * @param {HTMLElement} dom - the interaction DOM container
         * @param {Object} config
         * @param {Object} config.properties - PCI properties
         * @param {Object} config.boundTo - the response bound to the interaction
         * @param {Function} config.onready - to be called when the PCI is ready to be used by test taker
         * @param {Object} state - the state to restore
         */
        getInstance(dom, config, state) {
            const interaction = htmlTemplateTextboxInteractionFactory();

            // create a IMS PCI instance object that will be provided in onready
            const pciInstance = {
                getResponse() {
                    return interaction.getResponse();
                },

                /**
                 * Get the current state of the PCI
                 * @returns {Object}
                 */
                getState() {
                    return interaction.getSerializedState();
                },

                /**
                 * Called by delivery engine when PCI is fully completed
                 */
                oncompleted() {
                    interaction.destroy();
                }
            };

            const responseIdentifier = Object.keys(config.boundTo)[0];
            let response = config.boundTo[responseIdentifier] || {};

            interaction.responseValue = typeof response.base?.string === 'string' ? response.base.string : '';
            interaction.domApi = new DomApi(dom);

            interaction.initialize(responseIdentifier, dom, config.properties);
            interaction.setResponse(response);
            interaction.setSerializedState(state);

            // event manager is necessary only for creator part
            event.addEventMgr(pciInstance); // adds methods 'on', 'off', 'trigger'

            pciInstance.on('configChange', newProperties => {
                console.log('configChange', newProperties);
                Object.assign(interaction.properties, newProperties);
                interaction.render();
            });

            // callback when the PCI is ready to be used
            if (typeof config.onready === 'function') {
                config.onready(pciInstance, state);
            }

            interaction.pciInstance = pciInstance;
        }
    });
});
