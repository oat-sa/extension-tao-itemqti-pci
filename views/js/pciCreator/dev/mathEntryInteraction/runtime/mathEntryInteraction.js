/**
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
 * @author Christophe Noël <christophe@taotesting.com>
 *
 */
define([
    'qtiCustomInteractionContext',
    'IMSGlobal/jquery_2_1_1',
    'OAT/lodash',
    'OAT/util/event',
    'OAT/util/html',
    'mathEntryInteraction/runtime/mathquill/mathquill'
], function(
    qtiCustomInteractionContext,
    $,
    _,
    event,
    html,
    MathQuill
){
    'use strict';

    var mathEntryInteraction = {

        /**
         * Render PCI
         */
        render: function render(config) {
            this.initConfig(config);

            this.createToolbar();
            this.createMathField();
        },

        /**
         * Initialise configuration
         *
         * @param {Object} config
         * @param {Boolean} config.tool_toolId - is the given tool enabled?
         */
        initConfig: function initConfig(config) {
            function toBoolean(value, defaultValue) {
                if (typeof(value) === "undefined") {
                    return defaultValue;
                } else {
                    return (value === true || value === "true");
                }
            }

            this.config = {
                toolsStatus: {
                    frac:     toBoolean(config.tool_frac,     true),
                    sqrt:     toBoolean(config.tool_sqrt,     true),
                    exp:      toBoolean(config.tool_exp,      true),
                    log:      toBoolean(config.tool_log,      true),
                    ln:       toBoolean(config.tool_ln,       true),
                    e:        toBoolean(config.tool_e,        true),
                    infinity: toBoolean(config.tool_infinity, true),
                    lbrack:   toBoolean(config.tool_lbrack,   true),
                    rbrack:   toBoolean(config.tool_rbrack,   true),
                    pi:       toBoolean(config.tool_pi,       true),
                    cos:      toBoolean(config.tool_cos,      true),
                    sin:      toBoolean(config.tool_sin,      true),
                    lte:      toBoolean(config.tool_lte,      true),
                    gte:      toBoolean(config.tool_gte,      true),
                    times:    toBoolean(config.tool_times,    true),
                    divide:   toBoolean(config.tool_divide,   true),
                    plusminus:toBoolean(config.tool_plusminus,true)
                },
                allowNewLine:           toBoolean(config.allowNewLine,  false),
                authorizeWhiteSpace:    toBoolean(config.authorizeWhiteSpace,   false)
            };
        },

        /**
         * transform a DOM element into a MathQuill Field
         */
        createMathField: function createMathField() {
            var self = this,
                MQ = MathQuill.getInterface(2),
                config = {
                    spaceBehavesLikeTab: !this.config.authorizeWhiteSpace,
                    handlers: {
                        edit: function() {
                            self.trigger('responseChange');
                        }
                    }
                };

            if(this.mathField && this.mathField instanceof MathQuill){
                //if mathquill element already exists, update the config
                this.mathField.config(config);
            }else{
                //if mathquill element does not exist yet, create it
                this.mathField = MQ.MathField(this.$input.get(0), config);
            }
        },

        /**
         * Create the toolbar markup with event attached
         */
        createToolbar: function createToolbar() {
            var self = this,
                availableTools = {
                    frac:   { label: 'x/y',         latex: '\\frac',    fn: 'cmd',      desc: 'Fraction' },
                    sqrt:   { label: '&radic;',     latex: '\\sqrt',    fn: 'cmd',      desc: 'Square root' },
                    exp:    { label: 'x&#8319;',    latex: '^',         fn: 'cmd',      desc: 'Exponent' },
                    log:    { label: 'log',         latex: '\\log',     fn: 'write',    desc: 'Log' },
                    ln:     { label: 'ln',          latex: '\\ln',      fn: 'write',    desc: 'Ln' },
                    e:      { label: '&#8494;',     latex: '\\mathrm{e}',fn: 'write',   desc: 'Euler\'s constant' },
                    infinity: { label: '&#8734;',   latex: '\\infty',   fn: 'write',    desc: 'Infinity' },
                    lbrack: { label: '[',           latex: '\\lbrack',  fn: 'write',    desc: 'Left bracket' },
                    rbrack: { label: ']',           latex: '\\rbrack',  fn: 'write',    desc: 'Right bracket' },
                    pi:     { label: '&pi;',        latex: '\\pi',      fn: 'write',    desc: 'Pi' },
                    cos:    { label: 'cos',         latex: '\\cos',     fn: 'write',    desc: 'Cosinus' },
                    sin:    { label: 'sin',         latex: '\\sin',     fn: 'write',    desc: 'Sinus' },
                    lte:    { label: '&le;',        latex: '\\le',      fn: 'write',    desc: 'Lower than or equal' },
                    gte:    { label: '&ge;',        latex: '\\ge',      fn: 'write',    desc: 'Greater than or equal' },
                    times:  { label: '&times;',     latex: '\\times',   fn: 'cmd',      desc: 'Multiply' },
                    divide: { label: '&divide;',    latex: '\\div',     fn: 'cmd',      desc: 'Divide' },
                    plusminus: { label: '&#177;',   latex: '\\pm',      fn: 'write',    desc: 'Plus/minus' }
                },
                availableToolGroups = [ // we use an array to maintain order
                    { id: 'functions',  tools: ['sqrt', 'frac', 'exp', 'log', 'ln'] },
                    { id: 'symbols',    tools: ['e', 'infinity', 'lbrack', 'rbrack'] },
                    { id: 'trigo',      tools: ['pi', 'sin', 'cos'] },
                    { id: 'comparison', tools: ['lte', 'gte'] },
                    { id: 'operands',   tools: ['times', 'divide', 'plusminus'] }
                ];


            // create buttons
            this.$toolbar.empty();

            availableToolGroups.forEach(function (toolgroup) {
                self.$toolbar.append(createToolGroup(toolgroup));
            });

            /**
             * Create a group of buttons
             * @param {String} group - description of the toolgroup
             * @param {String} group.id
             * @param {Array} group.tools - ids of tools
             * @returns {JQuery|string} the created element or an empty string
             */
            function createToolGroup(group) {
                var $toolGroup = $('<div>', {
                        'class': 'math-entry-toolgroup',
                        'data-identifier': group.id
                    }),
                    activeTools = 0;

                group.tools.forEach(function(toolId) {
                    var toolConfig = availableTools[toolId];

                    toolConfig.id = toolId;
                    if (self.config.toolsStatus[toolId] === true) {
                        $toolGroup.append(createTool(toolConfig));
                        activeTools++;
                    }
                });

                return (activeTools > 0) ? $toolGroup : '';
            }

            /**
             * Create a single button
             * @param {Object} config
             * @param {String} config.id    - id of the tool
             * @param {String} config.latex - latex code to be generated
             * @param {String} config.fn    - Mathquill function to be called (ie. cmd or write)
             * @param {String} config.label - label of the rendered button
             * @returns {jQuery} - the created button
             */
            function createTool(config) {
                return $('<div>', {
                    'class': 'math-entry-tool',
                    'data-identifier': config.id,
                    'data-latex': config.latex,
                    'data-fn': config.fn,
                    html: config.label
                });
            }

            // add behaviour

            this.$toolbar.off('mousedown.qtiCommonRenderer');
            this.$toolbar.on('mousedown.qtiCommonRenderer', function(e) {
                var $target = $(e.target),
                    fn = $target.data('fn'),
                    latex = $target.data('latex');

                e.stopPropagation();
                e.preventDefault();

                switch (fn) {
                    case 'cmd':
                        self.mathField.cmd(latex);
                        break;
                    case 'write':
                        self.mathField.write(latex);
                        break;
                }

                self.mathField.focus();
            });

            /**
             * Ugly hack to allow for a line break on enter
             * inspired by https://github.com/mathquill/mathquill/issues/174
             *
             * The latex will turn into the following markup:
             * <span class="mq-textcolor" style="color:newline"> </span>
             *
             * which, along with the following css:
             * .mq-textcolor[style="color:newline"] {
             *      display: block;
             * }
             *
             *  ...creates a newline!!!
             */
            this.$input.on('keypress.qtiCommonRenderer', function (e) {
                var latex = '\\textcolor{newline}{ }';
                if (self.config.allowNewLine && e.keyCode === 13) {
                    self.mathField.write(latex);
                }
            });
        },


        /**
         * PCI public interface
         */

        id: -1,

        getTypeIdentifier: function getTypeIdentifier() {
            return 'mathEntryInteraction';
        },
        /**
         * Render the PCI :
         * @param {String} id
         * @param {Node} dom
         * @param {Object} config - json
         */
        initialize: function initialize(id, dom, config) {
            var self = this;

            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;

            this.$container = $(dom);
            this.$toolbar = this.$container.find('.toolbar');
            this.$input = this.$container.find('.math-entry-input');

            this.render(config);

            //tell the rendering engine that I am ready
            qtiCustomInteractionContext.notifyReady(this);

            this.on('configChange', function (newConfig) {
                self.render(newConfig);
            });

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
        setResponse: function setResponse(response) {
            if (response && response.base && response.base.string) {
                this.mathField.latex(response.base.string);
            }
        },
        /**
         * Get the response in the json format described in
         * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
         *
         * @param {Object} interaction
         * @returns {Object}
         */
        getResponse: function getResponse() {
            return {
                base: {
                    string : this.mathField.latex()
                }
            };
        },
        /**
         * Remove the current response set in the interaction
         * The state may not be restored at this point.
         *
         * @param {Object} interaction
         */
        resetResponse: function resetResponse() {
            this.mathField.latex('');
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function destroy() {
            this.$toolbar.off('mousedown.qtiCommonRenderer');
            this.$input.off('keypress.qtiCommonRenderer');
            this.resetResponse();
            this.mathField.revert();
        },
        /**
         * Restore the state of the interaction from the serializedState.
         *
         * @param {Object} interaction
         * @param {Object} state - json format
         */
        setSerializedState: function setSerializedState(state) {
            this.setResponse(state);
        },

        /**
         * Get the current state of the interaction as a string.
         * It enables saving the state for later usage.
         *
         * @param {Object} interaction
         * @returns {Object} json format
         */
        getSerializedState: function getSerializedState() {
            return this.getResponse();
        }
    };

    qtiCustomInteractionContext.register(mathEntryInteraction);
});