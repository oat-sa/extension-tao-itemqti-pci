define([
    'qtiCustomInteractionContext',
    // fixme: embed jQuery 1.4.3+ or update PCI jQuery version - remove jQuery shared lib dependency
    'jquery',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/util/html',
    // fixme: use a relative path from PCI runtime
    'qtiItemPci/pciCreator/dev/mathEntryInteraction/runtime/mathquill/mathquill',
    'jqueryui'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    event,
    html,
    MathQuill
){
    'use strict';

    var mathEntryInteraction;

    /**
     * @property {String} DISABLED  - not clickable
     * @property {String} ENABLED   - clickable
     * @property {String} ACTIVE    - clicked, triggered action is ongoing
     */
    var controlStates = {
        DISABLED: 'disabled',
        ENABLED: 'enabled',
        ACTIVE: 'active'
    };

    /**
     * Creates a button for recording/playback control
     * @param {Object}  config
     * @param {Number}  config.id - control id
     * @param {String}  config.label - text displayed inside the button
     * @param {String}  config.defaultState - state in which the button will be created
     * @param {$}       config.container - jQuery Dom element that the button will be appended to
     */
    function controlFactory(config) {
        var state,
            control,
            $control = $('<div>', {
                'class': 'audiorec-control',
                'data-identifier': config.id,
                text: config.label
            });

        $control.appendTo(config.container);

        setState(config.defaultState || controlStates.DISABLED);

        function setState(newState) {
            $control.removeClass(state);
            state = newState;
            $control.addClass(state);
        }

        control = {
            getState: function() {
                return state;
            },
            enable: function() {
                setState(controlStates.ENABLED);
            },
            disable: function() {
                setState(controlStates.DISABLED);
            },
            activate: function() {
                setState(controlStates.ACTIVE);
            },
            updateState: function() {
                this.trigger('updatestate');
            }
        };
        event.addEventMgr(control);

        $control.on('click.qtiCommonRenderer', function() {
            control.trigger('click');
        });

        return control;
    }


    /**
     * Main interaction code
     */

    mathEntryInteraction = {
        /**
         * PCI State
         */
        _mathEntry: null,


        /**
         * PCI public interface
         */

        id: -1,

        getTypeIdentifier: function () {
            return 'mathEntryInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize: function (id, dom, config) {
            var self = this;

            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.controls = {};

            this.$container = $(dom);
            this.$instructionsContainer = this.$container.find('.audioRec > .instructions');
            this.$controlsContainer = this.$container.find('.audioRec > .controls');
            this.$progressContainer = this.$container.find('.audioRec > .progress');

            // Mathquill specific
            var MQ = MathQuill.getInterface(2);
            var mathEntryField = this.$container.find('.mathEntryField').get(0);
            var answerMathField = MQ.MathField(mathEntryField, {
                handlers: {
                    edit: function() {
                        // var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
                        // console.log(enteredMath);
                    }
                }
            });

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            // useful to react to some authoring changes
            // this.on('configChange', function (newConfig) {
            //     self.render(newConfig);
            // });

            // render rich text content in prompt
            html.render(this.$container.find('.prompt'));
        },
        /**
         * Programmatically set the response following the json schema described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @param {Object} response
         */
        setResponse: function (response) {

        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse: function() {

        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function () {

        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function () {
            // this.$container.off('.qtiCommonRenderer');
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState: function (state) {
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function () {
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(mathEntryInteraction);
});