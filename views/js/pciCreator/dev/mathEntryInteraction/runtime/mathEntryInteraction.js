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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
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

    var ns = '.mathEntryInteraction';
    var MQ = MathQuill.getInterface(2);
    var mathEntryInteraction;

    // Warning: this is an experimental MathQuill API that might change or be removed upon MathQuill update.
    // Still, it is the most satisfying way to implement some required functionality without ugly hacks.
    MQ.registerEmbed('gap', function registerGap() {
        return {
            htmlString: '<span class="mq-tao-gap"></span>',
            text: function text() {
                return 'tao_gap';
            },
            latex: function latex() {
                return '\\taoGap';
            }
        };
    });
    // Experimental line break...
    MQ.registerEmbed('br', function registerBr() {
        return {
            htmlString: '<div class="mq-tao-br"></div>', // <div> is displayed as block: that's enough to create a new line. "<br />" breaks Mathquill.
            text: function text() {
                return 'tao_br';
            },
            latex: function latex() {
                return '\\taoBr';
            }
        };
    });

    mathEntryInteraction = {

        /**
         * return {Boolean} - Are we in a TAO QTI Creator context?
         */
        inQtiCreator: function isInCreator() {
            if (_.isUndefined(this._inQtiCreator) && this.$container) {
                this._inQtiCreator = this.$container.hasClass('tao-qti-creator-context');
            }
            return this._inQtiCreator;
        },

        /**
         * @returns {Boolean} - Is the PCI instance configured to use gap expressions?
         */
        inGapMode: function inGapMode() {
            return this.config.useGapExpression;
        },

        /**
         * Render PCI
         */
        render: function render(config) {
            this.initConfig(config);

            this.createToolbar();
            this.togglePlaceholder(false);

            // QtiCreator rendering of the PCI in Gap Expression mode: display a MathQuill editable field containing the gap expression
            if (this.inGapMode() && this.inQtiCreator()) {
                this.createMathEditable();
                this.setLatex(this.config.gapExpression);
                this.addToolbarListeners();

            // QtiCreator rendering of the PCI: display the input field placeholder instead of an actual MathQuill editable field
            } else if (!this.inGapMode() && this.inQtiCreator()) {
                this.togglePlaceholder(true);

            // Normal rendering of the PCI in Gap Expression mode: render a static MathQuill field with editable gaps
            } else if (this.inGapMode() && !this.inQtiCreator()) {
                this.setMathStaticContent(this.config.gapExpression);
                this.createMathStatic();

                this.monitorActiveGapField();
                this.addToolbarListeners();

            // Normal rendering of the PCI: display an empty MathQuill editable field
            } else {
                this.createMathEditable();
                this.addToolbarListeners();
            }
        },

        /**
         * @param {Object} config
         * @param {Boolean} config.authorizeWhiteSpace - if space key creates a space
         * @param {Boolean} config.useGapExpression - create a math expression with gaps (placeholders)
         * @param {Boolean} config.gapExpression - content of the math expression
         * @param {Boolean} config.tool_toolId - is the given tool enabled?
         * @param {Boolean} config.allowNewLine - experimental... allows the test taker to create a new line on Enter
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
                authorizeWhiteSpace: toBoolean(config.authorizeWhiteSpace, false),
                useGapExpression:    toBoolean(config.useGapExpression, false),
                gapExpression:       config.gapExpression || '',

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

                allowNewLine: toBoolean(config.allowNewLine, false)
            };
        },

        /**
         * @returns {Object} - A MathQuill configuration object. @see http://docs.mathquill.com/en/latest/Config/
         */
        getMqConfig: function getMqConfig() {
            var self = this;
            return {
                spaceBehavesLikeTab: !this.config.authorizeWhiteSpace,
                handlers: {
                    edit: function onChange(mathField) {
                        self.trigger('responseChange', [mathField.latex()]);
                    },
                    enter: function onEnter(mathField) {
                        if (self.config.allowNewLine && !self.inGapMode()) {
                            mathField.write('\\embed{br}');
                        }
                    }
                }
            };
        },

        /**
         * Create a placeholder that will be displayed instead off the MathQuill field in authoring mode
         * todo: what not use the MQ span ? better for backward compatibility
         */
        togglePlaceholder: function togglePlaceholder(displayPlaceholder) {
            if (! this.$inputPlaceholder) {
                // this is not in the PCI markup for backward-compatibility reasons
                this.$inputPlaceholder  = $('<div>', {
                    'class': 'math-entry-placeholder'
                });
                this.$toolbar.after(this.$inputPlaceholder);
            }
            if (displayPlaceholder) {
                this.$input.hide();
                this.$inputPlaceholder.show();

            } else {
                this.$input.css({ display: 'block'}); // not using .show() on purpose, as it results in 'inline-block' instead of 'block'
                this.$inputPlaceholder.hide();
            }
        },


        /**
         * ===========================
         * MathQuill fields management
         * ===========================
         */

        /**
         * Gap mode only: fill the mathfield markup with the math expression before creating the MathQuill instance
         * @param {String} latex - the math expression with gaps
         */
        setMathStaticContent: function setMathStaticContent(latex) {
            latex = latex.replace('\\taoGap/', '\\MathQuillMathField{}');
            this.$input.text(latex);
        },

        /**
         * Gap mode only: render the static math with the editable placeholders
         */
        createMathStatic: function createMathStatic() {
            var self = this,
                gapFields;

            this.mathField = MQ.StaticMath(this.$input.get(0));

            gapFields = this.getGapFields();
            gapFields.forEach(function(field) {
                field.config(self.getMqConfig());
            });
        },

        /**
         * MathQuill does not provide an API to detect which editable field has the focus, so we need to do that manually.
         * This will be helpful to know on which field the buttons will act on.
         */
        monitorActiveGapField: function monitorActiveGapField() {
            var self = this,
                $editableFields = this.$input.find('.mq-editable-field');

            this._activeGapFieldIndex = null;

            if ($editableFields.length) {
                $editableFields.each(function(index) {
                    $(this)
                        .off(ns)
                        .on('click' + ns + ' keyup' + ns, function() {
                            self._activeGapFieldIndex = index;
                        });
                });
            }
        },

        /**
         * Transform a DOM element into a MathQuill Editable Field
         */
        createMathEditable: function createMathEditable() {
            var config = this.getMqConfig();

            if(this.mathField && this.mathField instanceof MathQuill){
                // if the element already exists, update the config
                this.mathField.config(config);
            }else{
                // if not create it
                this.mathField = MQ.MathField(this.$input.get(0), config);
            }
        },

        /**
         * Set the latex of the existing editable mathFields, whether in standard or gap mode.
         * @param {String|String[]} latex - String for standard mode, array of strings for gap mode.
         */
        setLatex: function setLatex(latex) {
            var gapFields;

            if (this.inGapMode() && _.isArray(latex)) {
                gapFields = this.getGapFields();
                latex.forEach(function (latexExpr, i) {
                    if (gapFields[i]) {
                        gapFields[i].latex(latexExpr);
                    }
                });

            } else {
                latex = latex.replace('\\taoGap', '\\embed{gap}');
                this.mathField.latex(latex);
            }
        },

        /**
         * Insert latex in the active math field at cursor position.
         *
         * @param {String} latex - what to insert
         * @param {('cmd'|'write')} fn - how to insert it:
         *
         * 'write': You're supposed to pass fully formed LaTeX to 'write', such as '\log\left\{\right\}'. The idea is, it inserts
         * that LaTeX math to the left of the cursor. The LaTeX passed in will be inserted at the current cursor position
         * or replace the current selection, and the cursor ends up to the right of what was just inserted.
         *
         * 'cmd': You're only supposed to pass a single MathQuill command to 'cmd', such as '\sqrt'. The idea is, it's as if
         * you just typed in that MathQuill command. If there is a current selection, it will end up inside the square root,
         * otherwise it inserts the square root at the current cursor position, but the cursor now instead ends up inside
         * the square root command.
         *
         * @see: https://github.com/mathquill/mathquill/issues/74
         */
        insertLatex: function insertLatex(latex, fn) {
            var activeMathField = this.getActiveMathField();

            if (activeMathField && _.isFunction(activeMathField[fn])) {
                activeMathField[fn](latex);
                activeMathField.focus();
            }
        },

        /**
         * Get the active math field: in standard mode, this is the only existing math field. In gap mode, this is the one having the focus.
         * @returns {MathQuill} - the active math field instance
         */
        getActiveMathField: function getActiveMathField() {
            var activeMathField,
                gapFields;

            if (this.inGapMode() && !this.inQtiCreator()) {
                // default to the first gap field if none has received the focus yet
                if (! _.isFinite(this._activeGapFieldIndex)) {
                    this._activeGapFieldIndex = 0;
                }
                // access the MQ instances
                gapFields = this.getGapFields();
                if (gapFields.length > 0) {
                    activeMathField = gapFields[this._activeGapFieldIndex];
                }
            } else {
                activeMathField =  this.mathField;
            }
            return activeMathField;
        },

        /**
         * @returns {Array} - The gap fields of a static math instance
         */
        getGapFields: function getGapFields() {
            return (this.mathField && _.isArray(this.mathField.innerFields))
                ? this.mathField.innerFields
                : [];
        },

        /**
         * In Qti Creator mode only: insert a gap in a math expression
         */
        addGap: function addGap() {
            if (this.inQtiCreator()) {
                this.insertLatex('\\embed{gap}', 'write');
            }
        },

        /**
         * =======
         * Toolbar
         * =======
         */

        /**
         * Create the toolbar markup
         */
        createToolbar: function createToolbar() {
            var self = this,
                availableTools = {
                    frac:   { label: 'x/y',         latex: '\\frac',    fn: 'cmd',      desc: 'Fraction' },
                    sqrt:   { label: '&radic;',     latex: '\\sqrt',    fn: 'cmd',      desc: 'Square root' },
                    exp:    { label: 'x&#8319;',    latex: '^',         fn: 'cmd',      desc: 'Exponent' },
                    log:    { label: 'log',         latex: '\\log',     fn: 'cmd',      desc: 'Log' },
                    ln:     { label: 'ln',          latex: '\\ln',      fn: 'cmd',      desc: 'Ln' },
                    e:      { label: '&#8494;',     latex: '\\mathrm{e}',fn: 'write',   desc: 'Euler\'s constant' },
                    infinity: { label: '&#8734;',   latex: '\\infty',   fn: 'cmd',      desc: 'Infinity' },
                    lbrack: { label: '[',           latex: '\\lbrack',  fn: 'cmd',      desc: 'Left bracket' },
                    rbrack: { label: ']',           latex: '\\rbrack',  fn: 'cmd',      desc: 'Right bracket' },
                    pi:     { label: '&pi;',        latex: '\\pi',      fn: 'cmd',      desc: 'Pi' },
                    cos:    { label: 'cos',         latex: '\\cos',     fn: 'cmd',      desc: 'Cosinus' },
                    sin:    { label: 'sin',         latex: '\\sin',     fn: 'cmd',      desc: 'Sinus' },
                    lte:    { label: '&le;',        latex: '\\le',      fn: 'cmd',      desc: 'Lower than or equal' },
                    gte:    { label: '&ge;',        latex: '\\ge',      fn: 'cmd',      desc: 'Greater than or equal' },
                    times:  { label: '&times;',     latex: '\\times',   fn: 'cmd',      desc: 'Multiply' },
                    divide: { label: '&divide;',    latex: '\\div',     fn: 'cmd',      desc: 'Divide' },
                    plusminus: { label: '&#177;',   latex: '\\pm',      fn: 'cmd',      desc: 'Plus/minus' }
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
                self.$toolbar.append(self.createToolGroup(toolgroup, availableTools));
            });
        },

        /**
         * Create a group of buttons
         * @param {String} group - description of the toolgroup
         * @param {String} group.id
         * @param {Array} group.tools - ids of tools
         * @param {Object} availableTools - tools descriptions
         * @returns {jQuery|string} the created element or an empty string
         */
        createToolGroup: function createToolGroup(group, availableTools) {
            var self = this,
                $toolGroup = $('<div>', {
                    'class': 'math-entry-toolgroup',
                    'data-identifier': group.id
                }),
                activeTools = 0;

            group.tools.forEach(function(toolId) {
                var toolConfig = availableTools[toolId];

                toolConfig.id = toolId;
                if (self.config.toolsStatus[toolId] === true) {
                    $toolGroup.append(self.createTool(toolConfig));
                    activeTools++;
                }
            });

            return (activeTools > 0) ? $toolGroup : '';
        },

        /**
         * Create a single button
         * @param {Object} config
         * @param {String} config.id    - id of the tool
         * @param {String} config.latex - latex code to be generated
         * @param {String} config.fn    - Mathquill function to be called (ie. cmd or write)
         * @param {String} config.label - label of the rendered button
         * @returns {jQuery} - the created button
         */
        createTool: function createTool(config) {
            return $('<div>', {
                'class': 'math-entry-tool',
                'data-identifier': config.id,
                'data-latex': config.latex,
                'data-fn': config.fn,
                html: config.label
            });
        },

        /**
         * Attach events to toolbar buttons
         */
        addToolbarListeners: function addToolbarListeners() {
            var self = this;

            this.$toolbar
                .off('mousedown' + ns)
                .on('mousedown' + ns, function (e) {
                    var $target = $(e.target),
                        fn = $target.data('fn'),
                        latex = $target.data('latex');

                    e.stopPropagation();
                    e.preventDefault();

                    self.insertLatex(latex, fn);
                });
        },


        /**
         * ====================
         * PCI public interface
         * ====================
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

            this.$container         = $(dom);
            this.$toolbar           = this.$container.find('.toolbar');
            this.$input             = this.$container.find('.math-entry-input');

            this.render(config);

            this.on('configChange', function (newConfig) {
                self.render(newConfig);
            });

            // we need this event for communication with the Qti Creator
            this.on('addGap', function () {
                self.addGap();
            });

            // render rich text content in prompt
            html.render(this.$container.find('.prompt'));

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
        setResponse: function setResponse(response) {
            if (this.inGapMode()) {
                if (response && response.list && _.isArray(response.list.string)) {
                    this.setLatex(response.list.string);
                }

            } else {
                if (response && response.base && response.base.string) {
                    this.setLatex(response.base.string);
                }
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
            var response;

            if (this.inGapMode()) {
                response = {
                    list: {
                        string: this.getGapFields().map(function(gapField) {
                            return gapField.latex();
                        })
                    }
                };
            } else {
                response = {
                    base: {
                        string : this.mathField.latex()
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
        resetResponse: function resetResponse() {
            var gapFields = this.getGapFields();
            if (this.inGapMode()) {
                gapFields.forEach(function(gapField) {
                    gapField.latex('');
                });
            } else {
                this.setLatex('');
            }
        },
        /**
         * Reverse operation performed by render()
         * After this function is executed, only the inital naked markup remains
         * Event listeners are removed and the state and the response are reset
         *
         * @param {Object} interaction
         */
        destroy: function destroy() {
            this.$input.find('.mq-editable-field').off(ns);
            this.$input.off(ns);
            this.$toolbar.off(ns);
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