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
 * Copyright (c) 2016-2022 (original work) Open Assessment Technologies SA;
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'qtiCustomInteractionContext',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event',
    'mathEntryInteraction/runtime/mathquill/mathquill',
    'mathEntryInteraction/runtime/helper/mathInPrompt',
    'mathEntryInteraction/runtime/helper/ambiguousSymbols',
    'mathEntryInteraction/runtime/polyfill/es6-collections',
    'css!mathEntryInteraction/runtime/mathquill/mathquill',
    'css!mathEntryInteraction/runtime/css/mathEntryInteraction'
], function (
    qtiCustomInteractionContext,
    $,
    _,
    event,
    MathQuill,
    mathInPrompt,
    convertAmbiguousSymbols
) {
    'use strict';

    var ns = '.mathEntryInteraction';
    var cssClass = {
        root: 'mq-root-block',
        cursor: 'mq-cursor',
        newLine: 'mq-tao-br',
        autoWrap: 'mq-tao-wrap'
    };
    var cssSelectors = _.mapValues(cssClass, function (cls) {
        return `.${cls}`;
    });
    var reSpace = /^(\s|&nbsp;)+$/;
    var MQ = MathQuill.getInterface(2);

    // module wide
    let uidCounter = 0;
    const uid = () => `answer-${uidCounter++}`;

    /**
     * Builds a simple HTML markup.
     * @param {String} cls
     * @param {String} [tag='div']
     * @returns {String}
     */
    function htmlMarkup(cls, tag) {
        tag = tag || 'div';
        return `<${tag} class="${cls}"></${tag}>`;
    }

    /**
     * Computes the full width of an element, plus its margin.
     * This approach is more reliable than jQuery, as the decimals part is taken into account.
     * @param {any} element
     * @returns {Number}
     */
    function getWidth(element) {
        var style = element.currentStyle || window.getComputedStyle(element);
        var rect = element.getBoundingClientRect();
        var borderBox = style.boxSizing === 'border-box';
        return rect.width + parseFloat(style.marginLeft) + parseFloat(style.marginRight) +
            (borderBox ? 0 : parseFloat(style.paddingLeft) + parseFloat(style.paddingRight)) +
            (borderBox ? 0 : parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth));
    }

    // Warning: this is an experimental MathQuill API that might change or be removed upon MathQuill update.
    // Still, it is the most satisfying way to implement some required functionality without ugly hacks.
    MQ.registerEmbed('gap', function registerGap() {
        return {
            htmlString: htmlMarkup('mq-tao-gap', 'span'),
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
            htmlString: htmlMarkup(cssClass.newLine), // <div> is displayed as block: that's enough to create a new line. "<br />" breaks Mathquill.
            text: function text() {
                return 'tao_br';
            },
            latex: function latex() {
                return '\\taoBr';
            }
        };
    });

    const labels = {
        'ja': {
            'x/y': '<span>x</span><br><span>y</span>',
            '&le;': '&#8806;',
            '&ge;': '&#8807;',
            '\\le': '\\leq',
            '\\ge': '\\geq'
        }
    };

    /**
     * Function to have a common Map object to store the responses/inputs list and keep updated
     * @returns {Map}
     */
    function responsesManagerFactory() {
        const list = new Map();
        let currentIndex = null;
        Object.assign(list, {
            getFirstItem(index) {
                return list.get(this.getIndex(index));
            },
            getIndex(index) {
                if (typeof index === 'undefined') {
                    const [inputIndex] = list.keys();
                    return inputIndex;
                }
                return index;
            },
            currentIndex(index) {
                if (typeof index !== 'undefined') {
                    currentIndex = index;
                    return;
                }
                return currentIndex;
            }
        });
        return list;
    }

    const mathEntryInteractionFactory = function () {
        return {

            /**
             * @returns {Boolean} - Are we in a TAO QTI Creator context?
             */
            inQtiCreator: function isInCreator() {
                if (_.isUndefined(this._inQtiCreator) && this.$container) {
                    this._inQtiCreator = this.$container.hasClass('tao-qti-creator-context') ||
                        this.$container.find('.tao-qti-creator-context').length > 0;
                }
                return this._inQtiCreator;
            },

            /**
             * @param {any} label
             * @returns {string} - Localazed label
             */
            getLabel: function getLabel(label) {
                var localizedLabels = labels[this.config.locale];
                if (localizedLabels) {
                    return localizedLabels[label] || label;
                }
                return label;
            },

            /**
             * @returns {Boolean} - Is the PCI instance configured to use gap expressions?
             */
            inGapMode: function inGapMode() {
                return this.config.useGapExpression;
            },

            /**
             * @returns {Boolean} - Is the PCI instance using japanese locale?
             */
            inJapanese: function inJapanese() {
                return this.userLanguage === 'ja';
            },

            /**
             * @returns {Boolean} - Is the PCI instance in response state?
             */
            inResponseState: function inResponseState() {
                return this.config.inResponseState;
            },

            /**
             * Render PCI
             * @param {object} config
             */
            render: function render(config) {
                this.initConfig(config);

                this.createToolbar();
                this.togglePlaceholder(false);
                this.toggleResponseCorrectRow(false);

                // QtiCreator rendering of the PCI in Gap Expression mode and in response state: display a non-editable MathQuill field with editable gap fields
                if (this.inGapMode() && this.inQtiCreator() && this.inResponseState()) {
                    this.setMathStaticContent(this.config.gapExpression);
                    this.createMathStatic();
                    this.monitorActiveGapField();
                    this.removeSelectedInput();
                    this.addToolbarListeners();
                    this.addGapStyle();
                    this.autoWrapContent();
                    this.toggleResponseCorrectRow(true);

                    // QtiCreator rendering of the PCI in Gap Expression mode and in question state: display an editable MathQuill field with non-editable gap fields
                } else if (this.inGapMode() && this.inQtiCreator() && !this.inResponseState()) {
                    this.createMathEditable(true);
                    this.setLatex(this.config.gapExpression);
                    this.addToolbarListeners();
                    this.addGapStyle();
                    this.autoWrapContent();

                    // QtiCreator rendering of the PCI in Normal mode and in question state: display static a static MathQUillField covered by a placeholder
                } else if (!this.inGapMode() && this.inQtiCreator() && !this.inResponseState()) {
                    this.createMathStatic();
                    this.togglePlaceholder(true);
                    this.autoWrapContent();

                } else if (!this.inGapMode() && this.inQtiCreator() && this.inResponseState()) {
                    this.createMathEditable(true);
                    this.togglePlaceholder(false);
                    this.removeSelectedInput();
                    this.toggleResponseCorrectRow(true);
                    this.addToolbarListeners();

                    // Rendering PCI for a test-taker in Gap Expression mode: static MathQuill field with editable gap fields
                } else if (this.inGapMode() && !this.inResponseState()) {
                    this.setMathStaticContent(this.config.gapExpression);
                    this.createMathStatic();
                    this.monitorActiveGapField();
                    this.addToolbarListeners();
                    this.addGapStyle();
                    this.autoWrapContent();

                    // Normal rendering of the PCI: display an editable MathQuill field without gaps
                } else {
                    this.createMathEditable(false);
                    this.addToolbarListeners();
                    this.removeSelectedInput();
                    this.toggleResponseCorrectRow(true);
                }
            },

            /**
             * Post-Render PCI
             */
            postRender: function postRender() {
                const $prompt = this.$container.find('.prompt');
                mathInPrompt.postRender($prompt);
            },

            /**
             * @param {Object} config
             * @param {Boolean} config.authorizeWhiteSpace - if space key creates a space
             * @param {Boolean} config.useGapExpression - create a math expression with gaps (placeholders)
             * @param {Boolean} config.inResponseState - if QTI is in response state
             * @param {Boolean} config.gapExpression - content of the math expression
             * @param {('math-gap-small'|'math-gap-medium'|'math-gap-large')} config.gapStyle - size of the gaps
             * @param {Boolean} config.tool_toolId - is the given tool enabled?
             * @param {Boolean} config.allowNewLine - experimental... allows the test taker to create a new line on Enter
             * @param {Boolean} config.enableAutoWrap - experimental... allows the editor to auto wrap the content
             */
            initConfig: function initConfig(config) {
                function toBoolean(value, defaultValue) {
                    if (typeof (value) === "undefined") {
                        return defaultValue;
                    } else {
                        return (value === true || value === "true");
                    }
                }

                this.config = {
                    authorizeWhiteSpace: toBoolean(config.authorizeWhiteSpace, false),
                    focusOnDenominator: toBoolean(this.inJapanese(), false),
                    useGapExpression: toBoolean(config.useGapExpression, false),
                    inResponseState: toBoolean(config.inResponseState, false),
                    gapExpression: config.gapExpression || '',
                    gapStyle: config.gapStyle,
                    locale: this.userLanguage || 'en',

                    toolsStatus: {
                        frac: toBoolean(config.tool_frac, true),
                        sqrt: toBoolean(config.tool_sqrt, true),
                        exp: toBoolean(config.tool_exp, true),
                        log: toBoolean(config.tool_log, true),
                        ln: toBoolean(config.tool_ln, true),
                        limit: toBoolean(config.tool_limit, true),
                        sum: toBoolean(config.tool_sum, true),
                        nthroot: toBoolean(config.tool_nthroot, true),
                        e: toBoolean(config.tool_e, true),
                        infinity: toBoolean(config.tool_infinity, true),
                        lbrack: toBoolean(config.tool_lbrack, true),
                        rbrack: toBoolean(config.tool_rbrack, true),
                        pi: toBoolean(config.tool_pi, true),
                        cos: toBoolean(config.tool_cos, true),
                        sin: toBoolean(config.tool_sin, true),
                        tan: toBoolean(config.tool_tan, true),
                        lte: toBoolean(config.tool_lte, true),
                        gte: toBoolean(config.tool_gte, true),
                        times: toBoolean(config.tool_times, true),
                        divide: toBoolean(config.tool_divide, true),
                        plusminus: toBoolean(config.tool_plusminus, true),
                        angle: toBoolean(config.tool_angle, true),
                        minus: toBoolean(config.tool_minus, true),
                        plus: toBoolean(config.tool_plus, true),
                        equal: toBoolean(config.tool_equal, true),
                        lower: toBoolean(config.tool_lower, true),
                        greater: toBoolean(config.tool_greater, true),
                        subscript: toBoolean(config.tool_subscript, true),
                        lbrace: toBoolean(config.tool_lbrace, true),
                        rbrace: toBoolean(config.tool_rbrace, true),
                        lparen: toBoolean(config.tool_lparen, true),
                        rparen: toBoolean(config.tool_rparen, true),
                        integral: toBoolean(config.tool_integral, true),
                        timesdot: toBoolean(config.tool_timesdot, true),
                        triangle: toBoolean(config.tool_triangle, true),
                        similar: toBoolean(config.tool_similar, true),
                        paral: toBoolean(config.tool_paral, true),
                        perp: toBoolean(config.tool_perp, true),
                        inmem: toBoolean(config.tool_inmem, true),
                        ninmem: toBoolean(config.tool_ninmem, true),
                        union: toBoolean(config.tool_union, true),
                        intersec: toBoolean(config.tool_intersec, true),
                        colon: toBoolean(config.tool_colon, true),
                        to: toBoolean(config.tool_to, true),
                        congruent: toBoolean(config.tool_congruent, true),
                        subset: toBoolean(config.tool_subset, true),
                        superset: toBoolean(config.tool_superset, true),
                        contains: toBoolean(config.tool_contains, true),
                        approx: toBoolean(config.tool_approx, true),
                        vline: toBoolean(config.tool_vline, true),
                        degree: toBoolean(config.tool_degree, true),
                        percent: toBoolean(config.tool_percent, true),
                        matrix_2row: toBoolean(config.tool_matrix_2row, true),
                        matrix_2row_2col: toBoolean(config.tool_matrix_2row_2col, true),
                    },

                    allowNewLine: toBoolean(config.allowNewLine, false),
                    enableAutoWrap: toBoolean(config.enableAutoWrap, false)
                };
            },

            /**
             * @returns {Object} - A MathQuill configuration object. @see http://docs.mathquill.com/en/latest/Config/
             */
            getMqConfig: function getMqConfig() {
                var self = this;
                return {
                    spaceBehavesLikeTab: !this.config.authorizeWhiteSpace,
                    focusOnDenominator: this.config.focusOnDenominator,
                    handlers: {
                        edit: function onChange(mathField) {
                            self.autoWrapContent();
                            if (self.pciInstance) {
                                let index = null;
                                const $mathFieldInput = $(mathField.__controller.container[0]);
                                index = $mathFieldInput.data('index')  || $mathFieldInput.parents('.math-entry-input').data('index');
                                self.pciInstance.trigger('responseChange', [mathField.latex(), index]);
                            }
                        },
                        enter: function onEnter(mathField) {
                            // The "allow new line" option works under the following conditions:
                            // - in runtime, only in normal mode
                            // - in authoring, only in gapMode
                            function isBrAllowed() {
                                return self.config.allowNewLine
                                    && (
                                        (!self.inGapMode() && !self.inQtiCreator()) // normal && runtime
                                        || (self.inGapMode() && self.inQtiCreator()) // gap mode && authoring
                                    );
                            }

                            if (isBrAllowed()) {
                                mathField.write('\\embed{br}');
                            }
                        }
                    }
                };
            },

            /**
             * Create a placeholder that will be displayed instead off the MathQuill field in authoring mode
             * @param {boolean} displayPlaceholder
             */
            togglePlaceholder: function togglePlaceholder(displayPlaceholder) {
                if (!this.$inputPlaceholder) {
                    // this is not in the PCI markup for backward-compatibility reasons
                    this.$inputPlaceholder = $('<div>', {
                        'class': 'math-entry-placeholder'
                    });
                    this.$toolbar.after(this.$inputPlaceholder);
                }
                const [index] = this.inputs.keys();
                if (displayPlaceholder) {
                    $(this.inputs.get(index).input).hide();
                    this.$inputPlaceholder.show();

                } else {
                    $(this.inputs.get(index).input).css({display: 'block'}); // not using .show() on purpose, as it results in 'inline-block' instead of 'block'
                    this.$inputPlaceholder.hide();
                }
                this.focusSelectedInput();
            },

            /**
             * Create a title for response that will be displayed in Response mode
             * @param {boolean} displayResponseCorrect
             */
            toggleResponseCorrectRow: function toggleResponseCorrectRow(displayResponseCorrect) {
                const $responseBtn = this.$container.find('.math-entry-response-correct');
                const $responseWrap = this.$container.find('.math-entry-response-wrap');
                if (displayResponseCorrect) {
                    $responseBtn.show();
                    $responseWrap.show();
                } else {
                    $responseBtn.hide();
                    $responseWrap.hide();
                }
            },

            /**
             * ===========================
             * MathQuill fields management
             * ===========================
             */

            /**
             * Will wrap the content, to avoid overflow, if autoWrap is enabled
             */
            autoWrapContent: function autoWrapContent() {
                var $container, $cursor, current, lastSpace, lineBreak;
                var maxWidth, lineWidth, cache, nodes, node, index, length, block;

                if (this.config.enableAutoWrap) {
                    const [inputIndex] = this.inputs.keys();
                    $container = $(this.inputs.get(inputIndex).input).find(cssSelectors.root);
                    $cursor = $container.find(cssSelectors.cursor);
                    current = $cursor.closest(`${cssSelectors.root  }>span`).get(0);

                    maxWidth = $container.width();
                    if (!this.wrapCache) {
                        this.wrapCache = new window.WeakMap();
                    }
                    cache = this.wrapCache;
                    lineWidth = 0;

                    // iterate over each block and insert a line break each time a block is overflowing its container
                    nodes = _.toArray($container.get(0).childNodes);
                    for (length = nodes.length, index = 0; index < length; index++) {
                        node = nodes[index];
                        block = cache.get(node);

                        if (!block) {
                            block = {
                                classList: node.classList,
                                isSpace: reSpace.test(node.innerHTML)
                            };
                            cache.set(node, block);
                        }

                        if (block.classList.contains(cssClass.autoWrap)) {
                            // remove previously added auto line break
                            $(node).remove();
                        } else if (block.classList.contains(cssClass.newLine)) {
                            // ignore manual line break, but reset the line width
                            lineWidth = 0;
                        } else if (!block.classList.contains(cssClass.cursor)) {
                            // get the block width
                            if (current === node || 'undefined' === typeof block.width) {
                                block.width = getWidth(node);
                            }

                            if (block.isSpace) {
                                lastSpace = {
                                    node: node,
                                    index: index
                                };
                            }

                            // check if a line break is needed
                            if (lineWidth + block.width >= maxWidth) {
                                lineBreak = htmlMarkup(cssClass.autoWrap);
                                if (lastSpace) {
                                    $(lastSpace.node).after(lineBreak);
                                    index = lastSpace.index;
                                    lineWidth = -block.width;
                                } else {
                                    $(node).before(lineBreak);
                                    lineWidth = 0;
                                }
                                lastSpace = null;
                            }
                            lineWidth += block.width;
                        }
                    }
                }
            },

            /**
             * Gap mode only: fill the mathfield markup with the math expression before creating the MathQuill instance
             * @param {String} latex - the math expression with gaps
             * @param {String} index
             */
            setMathStaticContent: function setMathStaticContent(latex, index) {
                const item = this.inputs.getFirstItem(index);
                latex = latex
                    .replace(/\\taoGap/g, '\\MathQuillMathField{}')
                    .replace(/\\taoBr/g, '\\embed{br}');
                $(item.input).text(latex);
            },

            /**
             * Gap mode only: render the static math with the editable placeholders
             * @param {number} index
             */
            createMathStatic: function createMathStatic(index) {
                const item = this.inputs.getFirstItem(index);
                this.mathField = MQ.StaticMath(item.input);

                const gapFields = this.getGapFields();
                gapFields.forEach(field => {
                    field.config(this.getMqConfig());
                });
            },

            /**
             * MathQuill does not provide an API to detect which editable field has the focus, so we need to do that manually.
             * This will be helpful to know on which field the buttons will act on.
             * @param inputIndex
             */
            monitorActiveGapField: function monitorActiveGapField(inputIndex) {
                if (!inputIndex) {
                    const [index] = this.inputs.keys();
                    inputIndex = index;
                }
                const $editableFields = $(this.inputs.get(inputIndex).input).find('.mq-editable-field');

                this._activeGapFieldIndex = null;

                if ($editableFields.length) {
                    $.each($editableFields, (fieldIndex, input) => {
                        $(input)
                            .off(ns)
                            .on(`click${  ns  } keyup${  ns}`, () => {
                                this._activeGapFieldIndex = fieldIndex;
                            });
                    });
                }
            },

            focusSelectedInput: function focusSelectedInput() {
                const focusInputSelected = this.$container.find('.math-entry-input');
                if (focusInputSelected.length > 1) {
                    const config = this.getMqConfig();
                    $.each(focusInputSelected, (index, input) => {
                        $(input).on('click', e => {
                            if (this.inResponseState() && !this.inGapMode()) {
                                const inputIndex = input.dataset.index;
                                this.mathField = MQ.MathField(this.inputs.get(inputIndex).input, config);
                            }
                        });
                        $(input).find('.mq-editable-field').on('click', e => {
                            if (this.inResponseState() && this.inGapMode()) {
                                const inputIndex = $(e.target).parents('.math-entry-input').data('index');
                                this.mathField = MQ.StaticMath(this.inputs.get(inputIndex).input, config);
                            }
                        });
                    });
                }
            },

            removeSelectedInput: function removeSelectedInput() {
                $('.answer-delete', this.$container).on('click', e => {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    const dataIndex = $(e.target).closest('div').find('.math-entry-input').data('index');

                    const responseNumber = $(e.target).parents('.math-entry-response-title').find('span').data('response-number');

                    $(e.target).parents('.math-entry-response-wrap').remove();

                    const alternativeInputs = this.$container.find('.math-entry-alternative-input');
                    if (alternativeInputs.length >= responseNumber) {
                        $.each(alternativeInputs, (index, input) => {
                            if (index+1 >= responseNumber) {
                                const nextInput = $(input).siblings('.math-entry-response-title').find('span');
                                $(nextInput[0]).data('response-number', index+1);
                                $(nextInput[0]).text(index+1);
                            }
                        });
                    }

                    if (dataIndex && this.inputs.delete(dataIndex)) {
                        this.inputs.currentIndex(null);
                        this.pciInstance.trigger('deleteInput', [dataIndex]);
                    }
                });
            },

            /**
             * Transform a DOM element into a MathQuill Editable Field
             * @param {boolean} replaceStatic
             * @param {string} index
             */
            createMathEditable: function createMathEditable(replaceStatic, index) {
                const config = this.getMqConfig();

                const item = this.inputs.getFirstItem(index);

                // if the element already exists, update the config
                if (this.mathField && this.mathField instanceof MathQuill && replaceStatic === false) {
                    this.mathField.config(config);
                }
                // if not create it
                else if (this.mathField && this.mathField instanceof MathQuill && !replaceStatic) {
                    $(item.input).empty();
                    this.mathField = MQ.MathField(item.input, config);
                } else {
                    this.mathField = MQ.MathField(item.input, config);
                }
            },

            /**
             * Set the latex of the existing editable mathFields, whether in standard or gap mode.
             * @param {String|String[]} latex - String for standard mode, array of strings for gap mode.
             * @param {string} indexInput
             */
            setLatex: function setLatex(latex, indexInput) {
                if (this.inGapMode() && _.isArray(latex)) {
                    const gapFields = this.getGapFields();
                    latex.forEach(function (latexExpr, i) {
                        if (gapFields[i]) {
                            gapFields[i].latex(latexExpr);
                        }
                    });

                } else {
                    latex = latex
                        .replace(/\\taoGap/g, '\\embed{gap}')
                        .replace(/\\taoBr/g, '\\embed{br}')
                        .replace(/\\text\{\}/g, '\\text{ }');  // quick fix for edge case that introduce empty text block
                    if (!this.mathField) {
                        const item = this.inputs.getFirstItem(indexInput);
                        const config = this.getMqConfig();
                        this.mathField = MQ.MathField(item.input, config);
                    }
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
                const activeMathField = this.getActiveMathField();

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
                let activeMathField = null;

                if ((this.inGapMode() && this.inResponseState()) || (this.inGapMode() && !this.inQtiCreator())) {
                    // default to the first gap field if none has received the focus yet
                    if (!_.isFinite(this._activeGapFieldIndex)) {
                        this._activeGapFieldIndex = 0;
                    }
                    // access the MQ instances
                    const gapFields = this.getGapFields();
                    if (gapFields.length > 0) {
                        activeMathField = gapFields[this._activeGapFieldIndex];
                    }
                } else {
                    activeMathField = this.mathField;
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
             * In Qti Creator mode only: insert an alternative response in a math expression
             * @param {string} latex
             * @param {object} gapValues
             * @param {object} responseId
             */
            addAlternative: function addAlternative(latex = '\\embed{gap}', gapValues = null, responseId = null) {
                if (this.inQtiCreator()) {
                    const alternativeInput = this.$container.find('.math-entry-input');
                    if (alternativeInput.length > 0) {
                        const $newInput = $(`[data-index='${responseId}']`);
                        let responseValue = {};
                        if (this.inputs.has(responseId) && Object.keys(this.inputs.get(responseId)).includes('response')) {
                            responseValue = { response: this.inputs.get(responseId).response };
                        }
                        this.inputs.set(responseId, Object.assign(responseValue, { input: $newInput[0] }));
                        if (this.inGapMode()) {
                            this.setMathStaticContent(latex, responseId);
                            this.createMathStatic(responseId);
                            const gapFields = this.getGapFields();
                            const gaps = gapValues.base.string.split(',');
                            gapFields.forEach(function (gap, index) {
                                gap.latex(gaps[index] || '');
                            });
                        } else {
                            this.createMathEditable(true, responseId);
                            this.insertLatex(latex, 'write');
                        }
                        this.focusSelectedInput();
                        this.monitorActiveGapField(responseId);
                        this.removeSelectedInput();
                    }
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
                        frac: {label: self.getLabel('x/y'), latex: '\\frac', fn: 'cmd', desc: 'Fraction'},
                        sqrt: {
                            label: '<svg xmlns="http://www.w3.org/2000/svg" height="0.8em" width="0.8em" viewBox="0 0 400 400" version="1.0">\n' +
                                '<path fill="currentColor" d="m193.39062 4.859375-50.8125 317.375-79.093743-160.71876-58.781256 29.46875l6.6250007 12.5 38.687495-17.75 96.875003 199.40625 58.6875-366.28124h144.71876v-14h-142.46876-10.21874-4.21876z"></path>\n' +
                                '<text fill="currentColor" class="">√</text>\n' +
                                '</svg>',
                            latex: '\\sqrt',
                            fn: 'cmd',
                            desc: 'Square root'
                        },
                        exp: {label: 'x&#8319;', latex: '^', fn: 'cmd', desc: 'Exponent'},
                        log: {label: 'log', latex: '\\log', fn: 'cmd', desc: 'Log'},
                        ln: {label: 'ln', latex: '\\ln', fn: 'cmd', desc: 'Ln'},
                        limit: {label: 'lim', latex: '\\lim', fn: 'cmd', desc: 'Limit'},
                        sum: {label: 'sum', latex: '\\sum', fn: 'cmd', desc: 'Sum'},
                        nthroot: {label: 'n-root', latex: '\\nthroot', fn: 'cmd', desc: 'N-root'},
                        e: {label: 'e', latex: '\\mathrm{e}', fn: 'write', desc: 'Euler\'s constant'},
                        infinity: {label: '&#8734;', latex: '\\infty', fn: 'cmd', desc: 'Infinity'},
                        lbrack: {label: '[', latex: '\\lbrack', fn: 'cmd', desc: 'Left bracket'},
                        rbrack: {label: ']', latex: '\\rbrack', fn: 'cmd', desc: 'Right bracket'},
                        pi: {label: '&pi;', latex: '\\pi', fn: 'cmd', desc: 'Pi'},
                        cos: {label: 'cos', latex: '\\cos', fn: 'cmd', desc: 'Cosinus'},
                        sin: {label: 'sin', latex: '\\sin', fn: 'cmd', desc: 'Sinus'},
                        tan: {label: 'tan', latex: '\\tan', fn: 'cmd', desc: 'Tangent'},
                        lte: {
                            label: self.getLabel('&le;'),
                            latex: self.getLabel('\\le'),
                            fn: 'cmd',
                            desc: 'Lower than or equal'
                        },
                        gte: {
                            label: self.getLabel('&ge;'),
                            latex: self.getLabel('\\ge'),
                            fn: 'cmd',
                            desc: 'Greater than or equal'
                        },
                        times: {label: '&times;', latex: '\\times', fn: 'cmd', desc: 'Multiply'},
                        divide: {label: '&divide;', latex: '\\div', fn: 'cmd', desc: 'Divide'},
                        plusminus: {label: '&#177;', latex: '\\pm', fn: 'cmd', desc: 'Plus/minus'},
                        angle: {label: '&ang;', latex: '\\angle', fn: 'cmd', desc: 'Angle'},
                        minus: {label: '–', latex: '-', fn: 'write', desc: 'Minus'},
                        plus: {label: '+', latex: '+', fn: 'write', desc: 'Plus'},
                        equal: {label: '=', latex: '=', fn: 'write', desc: 'Equal'},
                        lower: {label: '<', latex: '<', fn: 'write', desc: 'Lower than'},
                        greater: {label: '>', latex: '>', fn: 'write', desc: 'Greater than'},
                        subscript: {label: 'x&#8336;', latex: '_', fn: 'cmd', desc: 'Subscript'},
                        lbrace: {label: '{', latex: '{', fn: 'cmd', desc: 'Left brace/curly bracket'},
                        rbrace: {label: '}', latex: '}', fn: 'cmd', desc: 'Right brace/curly bracket'},
                        lparen: {label: '(', latex: '(', fn: 'write', desc: 'Left parenthesis/round bracket'},
                        rparen: {label: ')', latex: ')', fn: 'write', desc: 'Right parenthesis/round bracket'},
                        integral: {label: '&#x222b;', latex: '\\int', fn: 'cmd', desc: 'Indefinite integral'},
                        timesdot: {label: '·', latex: '\\cdot', fn: 'cmd', desc: 'Times dot'},
                        triangle: {label: '&#9651;', latex: '\\triangle', fn: 'cmd', desc: 'Triangle'},
                        similar: {label: '&sim;', latex: '\\sim', fn: 'cmd', desc: 'Similar'},
                        paral: {label: '&#8741;', latex: '\\parallel', fn: 'cmd', desc: 'Is parallel with'},
                        perp: {label: '&#8869;', latex: '\\perp', fn: 'cmd', desc: 'Is perpendicular to'},
                        inmem: {label: '&isin;', latex: '\\in', fn: 'cmd', desc: 'Is a member of'},
                        ninmem: {label: '&notin;', latex: '\\notin', fn: 'cmd', desc: 'Is not a member of'},
                        union: {label: '&cup;', latex: '\\cup', fn: 'cmd', desc: 'Set union'},
                        intersec: {label: '&cap;', latex: '\\cap', fn: 'cmd', desc: 'Set intersection'},
                        colon: {label: ':', latex: ':', fn: 'write', desc: 'Colon'},
                        to: {label: '&#x2192;', latex: '\\to', fn: 'write', desc: 'Right arrow'},
                        congruent: {label: '&#x2245;', latex: '\\cong', fn: 'cmd', desc: 'Congruent'},
                        subset: {label: '&#x2282;', latex: '\\subset', fn: 'cmd', desc: 'Subset'},
                        superset: {label: '&#x2283;', latex: '\\supset', fn: 'cmd', desc: 'Superset'},
                        contains: {label: '&#x220B;', latex: '\\ni', fn: 'cmd', desc: 'Contains as member'},
                        approx: {label: '≈', latex: '\\approx', fn: 'cmd', desc: 'Approximately'},
                        vline: {label:'|', latex: '\\mid', fn: 'cmd', desc: 'Vertical line, divide'},
                        degree: {label: '°', latex: '°', fn: 'write', desc: 'Degree symbol'},
                        percent: {label: '%', latex: '\%', fn: 'write', desc: 'Percent'},
                        matrix_2row: {
                            label: '<svg height="0.8em" width="0.8em" viewBox="0 0 50 111" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">' +
                                '<rect id="svg_1" height="50" width="50" y="0" x="0" stroke="#fff" fill="#7f7f7f"/>' +
                                '<rect id="svg_2" height="50" width="50" y="61" x="0" stroke="#fff" fill="#7f7f7f"/>' +
                            '</svg>',
                            latex: '\\begin{matrix}\\\\\\end{matrix}',
                            fn: 'write',
                            desc: 'Matrix with 2 rows'
                        },
                        matrix_2row_2col: {
                            label: '<svg height="0.8em" width="0.8em" viewBox="0 0 108 111" xmlns="http://www.w3.org/2000/svg" style="pointer-events: none;">' +
                                '<rect id="svg_1" height="50" width="50" y="0" x="0" stroke="#fff" fill="#7f7f7f"/>' +
                                '<rect id="svg_2" height="50" width="50" y="61" x="0" stroke="#fff" fill="#7f7f7f"/>' +
                                '<rect id="svg_3" height="50" width="50" y="0" x="57" stroke="#fff" fill="#7f7f7f"/>' +
                                '<rect id="svg_4" height="50" width="50" y="61" x="57" stroke="#fff" fill="#7f7f7f"/>' +
                            '</svg>',
                            latex: '\\begin{matrix}&\\\\&\\end{matrix}',
                            fn: 'write',
                            desc: 'Matrix with 2 rows and 2 colmns'
                        },
                    },
                    availableToolGroups = [ // we use an array to maintain order
                        {id: 'functions', tools: ['sqrt', 'frac', 'exp', 'subscript', 'log', 'ln', 'limit', 'sum', 'nthroot']},
                        {
                            id: 'symbols',
                            tools: ['e', 'infinity', 'lparen', 'rparen', 'lbrace', 'rbrace', 'lbrack', 'rbrack', 'integral', 'colon', 'to', 'degree', 'percent']
                        },
                        {id: 'geometry', tools: ['angle', 'triangle', 'similar', 'paral', 'perp', 'vline']},
                        {id: 'trigo', tools: ['pi', 'sin', 'cos','tan']},
                        {id: 'comparison', tools: ['lower', 'greater', 'lte', 'gte', 'approx']},
                        {
                            id: 'operands',
                            tools: ['equal', 'plus', 'minus', 'times', 'timesdot', 'divide', 'plusminus', 'inmem', 'ninmem', 'union', 'intersec', 'congruent', 'subset', 'superset', 'contains']
                        },
                        {id: 'matrix', tools: ['matrix_2row','matrix_2row_2col']}
                    ];

                // create buttons
                this.$toolbar.empty();

                availableToolGroups.forEach(function (toolgroup) {
                    self.$toolbar.append(self.createToolGroup(toolgroup, availableTools));
                });

                // slightly changing fraction tool styles for a vertical fraction style in japanese locale
                if (this.inJapanese()) {
                    const dataId = 'frac';
                    const fracTool = this.$toolbar.find(`[data-identifier='${dataId}']`);
                    fracTool.addClass('vertical-fraction-tool');
                }
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

                group.tools.forEach(function (toolId) {
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
                    .off(`mousedown${  ns}`)
                    .on(`mousedown${  ns}`, function (e) {

                        var $target,
                            fn = '',
                            latex = '';

                        if ($(e.target).data('fn')) {
                            $target = $(e.target);
                            fn = $target.data('fn');
                            latex = $target.data('latex');
                        } else {
                            $target = $(e.target.parentElement);
                            fn = $target.data('fn');
                            latex = $target.data('latex');
                        }


                        e.stopPropagation();
                        e.preventDefault();

                        self.insertLatex(latex, fn);
                    });
            },

            /**
             * Add the style that sets the width of the gaps, discard previous style
             */
            addGapStyle: function addGapStyle() {
                if (this.config.gapStyle) {
                    this.$container.removeClass(function (index, className) {
                        return (className.match(/\bmath-gap-[\w]+\b/g) || []).join(' ');
                    });
                    this.$container.addClass(this.config.gapStyle);
                }

                // in case alternative responses, force the wrap to show
                const inputWrap = this.$container.find('.math-entry-response-wrap');
                if (inputWrap.length > 0) {
                    $(inputWrap[0]).show();
                }
            },

            /**
             * Initialize the PCI :
             * @param {Node} dom
             * @param {Object} config - json
             * @param {Map} responsesManager
             */
            initialize: function initialize(dom, config, responsesManager) {
                this.dom = dom;
                this.userLanguage = config.userLanguage ? config.userLanguage.replace(/[-_][A-Z].*$/i, '').toLowerCase() : '';

                this.$container = $(dom);
                this.$toolbar = this.$container.find('.toolbar');
                const $input = this.$container.find('.math-entry-input');
                const id = uid();
                this.inputs = responsesManager;
                let responseValue = {};
                if (this.inputs.has(id) && Object.keys(this.inputs.get(id)).includes('response')) {
                    responseValue = { response: this.inputs.get(id).response };
                }
                this.inputs.set(id, Object.assign(responseValue,{input: $input[0]}));
                this.render(config);
            },
            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             *
             * @param {Object} response
             */
            setResponse: function setResponse(response) {
                if (this.inGapMode()) {
                    if (response && response.base && response.base.string) {
                        const gapFields = this.getGapFields();
                        const gaps = response.base.string.split(',');
                        gapFields.forEach(function (gap, index) {
                            gap.latex(gaps[index]);
                        });
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
             * @param {string} inputId
             * @returns {Object}
             */
            getResponse: function getResponse(inputId ) {
                let response;
                const config = this.getMqConfig();
                if (this.inGapMode()) {
                    if (typeof inputId !== 'undefined') {
                        this.mathField = MQ.StaticMath(this.inputs.get(inputId).input, config);
                    } else if (typeof this.inputs.currentIndex() === 'string') {
                        inputId = this.inputs.currentIndex();
                        this.mathField = MQ.StaticMath(this.inputs.get(inputId).input, config);
                    }
                    response = {
                        base: {
                            string: this.getGapFields()
                                .map(function (gapField) {
                                    return convertAmbiguousSymbols(gapField.latex());
                                }).toString()
                        }
                    };
                } else {
                    response = {
                        base: {
                            string: convertAmbiguousSymbols(this.mathField.latex())
                        }
                    };
                }

                return response.base.string.replace(/,/g, '') !== '' ? response : {base: {string: ''}};
            },
            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             *
             */
            resetResponse: function resetResponse() {
                const gapFields = this.getGapFields();
                if (this.inGapMode()) {
                    gapFields.forEach(function (gapField) {
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
             */
            destroy: function destroy() {
                for (let value of this.inputs.values()) {
                    $(value.input).find('.mq-editable-field').off(ns);
                    $(value.input).off(ns);
                }
                this.$toolbar.off(ns);
                this.resetResponse();
                if (this.mathField instanceof MathQuill) {
                    this.mathField.revert();
                }
            },
            /**
             * Restore the state of the interaction from the serializedState.
             *
             * @param {Object} state - json format
             */
            setSerializedState: function setSerializedState(state) {
                if (state && state.response) {
                    this.setResponse(state.response);
                }
            },

            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             *
             * @returns {Object} json format
             */
            getSerializedState: function getSerializedState() {
                return {response: this.getResponse()};
            }
        };
    };

    qtiCustomInteractionContext.register({
        typeIdentifier: 'mathEntryInteraction',
        getInstance: function getInstance(dom, config, state) {
            const responsesManager = responsesManagerFactory();
            const mathEntryInteraction = mathEntryInteractionFactory(responsesManager);

            // create a IMS PCI instance object that will be provided in onready
            const pciInstance = {
                getResponse: function getResponse() {
                    return mathEntryInteraction.getResponse();
                },

                getState: function getState() {
                    return mathEntryInteraction.getSerializedState();
                },

                // destroy function
                oncompleted: function oncompleted() {
                    // remove listeners
                    pciInstance.off('configChange');
                    pciInstance.off('addGap');
                    pciInstance.off('latexInput');
                    pciInstance.off('latexGapInput');

                    mathEntryInteraction.destroy();
                },

                getResponsesManager() {
                    return responsesManager;
                }
            };

            // event manager is necessary only for creator part
            event.addEventMgr(pciInstance);

            // initialize and set previous response/state
            mathEntryInteraction.initialize(dom, config.properties, responsesManager);

            const boundTo = config.boundTo;
            const responseIdentifier = Object.keys(boundTo)[0];
            let response = boundTo[responseIdentifier];
            mathEntryInteraction.setResponse(response);
            mathEntryInteraction.setSerializedState(state);

            pciInstance.on('configChange', function (properties) {
                mathEntryInteraction.render(properties);
                mathEntryInteraction.postRender();
            });

            pciInstance.on('latexInput', function (latex, indexInput) {
                if (!mathEntryInteraction.inputs.has(indexInput)) {
                    return false;
                }
                mathEntryInteraction.mathField = MQ.MathField(mathEntryInteraction.inputs.get(indexInput).input, config);
                mathEntryInteraction.setLatex(latex, indexInput);
                mathEntryInteraction.mathField.focus();
            });

            pciInstance.on('latexGapInput', function (gapLatex, indexInput) {
                if (gapLatex.base && _.isArray(gapLatex.base.string)) {
                    if (!mathEntryInteraction.inputs.has(indexInput)) {
                        return false;
                    }
                    mathEntryInteraction.mathField = MQ.StaticMath(mathEntryInteraction.inputs.get(indexInput).input, config);
                    const gaps = mathEntryInteraction.getGapFields();
                    gaps.forEach(function (gap, index) {
                        if (typeof gapLatex.base.string[index] !== 'undefined') {
                            gap.latex(gapLatex.base.string[index]);
                        }
                    });
                } else {
                    mathEntryInteraction.config.gapExpression = gapLatex;
                }
            });

            pciInstance.on('addGap', function () {
                mathEntryInteraction.addGap();
            });

            pciInstance.on('addAlternative', function (latex, gapValues, responseId) {
                mathEntryInteraction.addAlternative(latex, gapValues, responseId);
            });
            mathEntryInteraction.postRender();

            // PCI instance is ready to run
            config.onready(pciInstance);

            mathEntryInteraction.pciInstance = pciInstance;
        }
    });
});
