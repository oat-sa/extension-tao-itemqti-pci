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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/OAT/util/event'
], function (qtiCustomInteractionContext, event) {
    'use strict';

    console.log('in src runtime');

    const _typeIdentifier = 'htmlTemplateInteraction';

    const maxlength = 10000; // limit individual input value lengths

    let blobUrls = new Set();

    /**
     * Prepare iframe src from html template
     * @param {string} code
     * @param {string} [type]
     * @returns {string} blob URL - should be revoked when finished with
     */
    function createBlobURL(code, type = 'text/html') {
        const blobUrl = URL.createObjectURL(new Blob([code], { type }));
        blobUrls.add(blobUrl);
        return blobUrl;
    };

    /**
     * Revoke all stored blob URLs. Prevents memory leak when repeatedly editing html property in creator.
     */
    function revokeBlobUrls() {
        blobUrls.values().forEach(URL.revokeObjectURL);
        blobUrls = new Set();
    }

    /**
     * Count words/chars in string according to built-in word separators
     * @param {string} text
     * @returns {Object} counts
     */
    function getCounts(text = '') {
        const wordSeparators = '\\s.,:;?!&#%/*+=';
        const wordRegex = new RegExp(`[^${wordSeparators}]+`, 'g');
        const wordMatches = (typeof text === 'string' && text.match(wordRegex)) || [];
        return {
            words: wordMatches.length,
            chars: text.length
        };
    }

    /**
     * Find out what type of HTMLElement a response element is.
     * Supported types:
     * - textarea
     * - select
     * - input type="text|number|email|url|search"
     * - input type="checkbox"
     * - input type="radio"
     * @param {HTMLElement} element
     * @returns {Object}
     */
    function getElementInfo(element) {
        if (!element) {
            return {};
        }
        const typeAttr = element.getAttribute('type');
        const isTextArea = element.tagName === 'TEXTAREA';
        const isSelect = element.tagName === 'SELECT';
        const isTextInput = element.tagName === 'INPUT' && ['text', 'number', 'email', 'url', 'search'].includes(typeAttr);
        const isCheckboxInput = element.tagName === 'INPUT' && typeAttr === 'checkbox';
        const isRadioInput = element.tagName === 'INPUT' && typeAttr === 'radio';
        const isUnsupportedElement = !isTextArea && !isSelect && !isTextInput && !isCheckboxInput && !isRadioInput;

        return { isTextArea, isSelect, isTextInput, isCheckboxInput, isRadioInput, isUnsupportedElement };
    }

    function htmlTemplateInteractionFactory() {
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
             * HTML response elements give up the following data:
             * - textarea: { [string: name]: [string: value] }
             * - select: { [string: name]: [string: option_name] }
             * - input type="text|number|email|url|search": { [string: name]: [string: value] }
             * - input type="checkbox": { [string: name]: [boolean: checked] }
             * - input type="radio": { [string: name]: [string: value] }
             *
             * @returns {Object}
             */
            getResponse: function() {
                let data = {};
                this.getResponseElts().forEach(element => {
                    const { isUnsupportedElement, isCheckboxInput, isRadioInput, isSelect } = getElementInfo(element);

                    if (!isUnsupportedElement || element.name) {
                        if (isCheckboxInput) {
                            data[element.name] = element.checked; // boolean
                        } else if (isRadioInput || isSelect) {
                            data[element.name] = element.value; // identifier
                        } else {
                            data[element.name] = element.value && element.value.substring(0, maxlength); // string
                        }
                    }
                });
                // in case DOM was already destroyed, we can return last known response TODO: is it safe?
                if (Object.keys(data).length) {
                    this.responseValueObj = data;
                }
                this.response = { base: { string: JSON.stringify(this.responseValueObj) } };
                return this.response;
            },

            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains
             */
            destroy: function() {
                this.dom.innerHTML = '';
                revokeBlobUrls();
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
                // IMPORTANT! Never set 'allow-scripts' on the iframe. It can give content author power to influence platform code.
                this.iframe.setAttribute('sandbox', 'allow-same-origin');
                this.iframe.dataset.responseIdentifier = responseIdentifier;
                this.iframe.style = 'border:none; width:100%;';
                this.iframe.title = 'interaction';
                this.render();
            },

            render: function() {
                const iframeOnload = () => this.postRender();

                // may not be needed - can I just add once in initialize? TODO:
                this.iframe.removeEventListener('load', iframeOnload);
                this.iframe.addEventListener('load', iframeOnload);

                // fill the markup-iframe
                revokeBlobUrls();
                try {
                    this.iframe.src = createBlobURL(this.properties.html);
                } catch (e) {
                    console.error(e);
                    this.iframe.src = createBlobURL('Invalid or missing <code>html</code> property');
                }
            },

            /**
             * Wire up events and attributes after the iframe is done loading
             */
            postRender: function() {
                this.iframe.height = this.iframe.contentWindow.document.body.scrollHeight || 500;

                // Update some attributes (not response values) on rendered response elements
                this.getResponseElts().forEach(element => {
                    const { isTextArea, isSelect, isTextInput, isCheckboxInput, isRadioInput, isUnsupportedElement } = getElementInfo(element);

                    if (isUnsupportedElement) {
                        console.warn('Unsupported data-response element in template:', element.outerHTML);
                    } else if (!element.name) {
                        console.warn('Response element found without name attribute and won\'t be considered:', element.outerHTML);
                    } else if (isTextArea || isTextInput) {
                        element.setAttribute('maxlength', element.getAttribute('maxlength') || maxlength);
                        if (this.properties.isReviewMode) {
                            element.setAttribute('readonly', 'true');
                        }
                    } else if (isSelect || isCheckboxInput || isRadioInput) {
                        if (this.properties.isReviewMode) {
                            element.setAttribute('disabled', 'true');
                        }
                    }
                });

                this.renderResponseValues();
                this.connectWordcounts();
            },

            /**
             * Update the content of data-wordcount-for elements with their word count texts
             */
            connectWordcounts: function() {
                const wordcountTargets = this.iframe.contentDocument.querySelectorAll('[data-wordcount-for]') || [];
                wordcountTargets.forEach(wcTarget => {
                    const wcSource = this.iframe.contentDocument.querySelector(`[name=${wcTarget.dataset.wordcountFor}]`);
                    const { isTextArea, isTextInput } = getElementInfo(wcSource);
                    if (isTextArea || isTextInput) {
                        // initial
                        const { words } = getCounts(wcSource.value);
                        wcTarget.textContent = `${words} word(s)`;

                        // updates
                        wcSource.addEventListener('input', (e) => {
                            const { words } = getCounts(e.target.value);
                            wcTarget.textContent = `${words} word(s)`;
                        });
                    }
                });
            },

            /**
             * Get the rendered element(s) defined by the template as holding the response(s).
             * @returns {HTMLCollection|Array}
             */
            getResponseElts: function() {
                return this.iframe.contentDocument && this.iframe.contentDocument.querySelectorAll('[data-response][name]') || [];
            },

            /**
             * Renders known response values into their DOM elements
             */
            renderResponseValues: function() {
                if (!this.responseValueObj) {
                    return;
                }
                this.getResponseElts().forEach(element => {
                    const { isSelect, isCheckboxInput, isRadioInput } = getElementInfo(element);

                    const elementResponseValue = this.responseValueObj[element.name];

                    if (isRadioInput && elementResponseValue === element.getAttribute('value')) {
                        element.checked = true;
                    } else if (isCheckboxInput && elementResponseValue) {
                        element.checked = true;
                    } else if (isSelect) {
                        const selectedOption = element.querySelector(`option[value=${elementResponseValue}]`);
                        if (selectedOption) {
                            selectedOption.selected = true;
                        }
                    } else if (element.name in this.responseValueObj){
                        element.value = elementResponseValue;
                    }
                });
            },

            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} response
             */
            setResponse: function(response) {
                if (response && response.base && response.base.string) {
                    this.responseValueObj = JSON.parse(response.base.string) || {};
                    console.log('setResponse set responseValueObj', this.responseValueObj);
                    this.renderResponseValues();
                }
            },

            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             */
            resetResponse: function() {
                this.setResponse({ base: null });
            },

            /**
             * Restore the state of the interaction from the serializedState.
             *
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
             * @returns {Object} json format
             */
            getSerializedState: function() {
                return { response: this.getResponse() };
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
            const interaction = htmlTemplateInteractionFactory();

            // create a IMS PCI instance object that will be provided in onready
            const pciInstance = {
                /**
                 * Get the current response of the PCI
                 * @returns {Object}
                 */
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

            interaction.responseValueObj = response && response.base && typeof response.base.string === 'string' ? JSON.parse(response.base.string) : {};

            interaction.initialize(responseIdentifier, dom, config.properties);
            interaction.setResponse(response);
            interaction.setSerializedState(state);

            // event manager is necessary only for creator part
            event.addEventMgr(pciInstance); // adds methods 'on', 'off', 'trigger'

            // when in creator, respond to property changes
            pciInstance.on('configChange', newProperties => {
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
