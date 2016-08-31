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

    function createTool(config) {
        var $tool = $('<div>', {
            'class': 'math-entry-tool',
            'data-identifier': config.id,
            'data-latex': config.latex,
            'data-fn': config.fn,
            html: config.label
        });

        $tool.appendTo(config.container);
    }

    /**
     * Main interaction code
     */

    mathEntryInteraction = {
        /**
         * PCI State
         */
        _mathStringLatex: null,


        /**
         * PCI private functions
         */

        createMathField: function() {
            var MQ = MathQuill.getInterface(2);
            this.mathField = MQ.MathField(this.$input.get(0), {
                // more options here
                handlers: {
                    edit: function() {
                        // var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
                        // console.log(enteredMath);
                    }
                }
            });
        },

        createTools: function() {
            var self = this,
                availableTools = {
                    frac:   { label: 'x/y',         latex: '\\frac',    fn: 'cmd',      desc: _('Fraction') },
                    sqrt:   { label: '&radic;',     latex: '\\sqrt',    fn: 'cmd',      desc: _('Square root') },
                    exp:    { label: 'x&#8319;',    latex: '^{}',       fn: 'write',    desc: _('Exponent') },
                    pi:     { label: '&Pi;',        latex: '\\pi',      fn: 'write',    desc: _('Pi') },
                    leq:    { label: '&le;',        latex: '\\le',      fn: 'write',    desc: _('Lower than or equal') },
                    geq:    { label: '&ge;',        latex: '\\ge',      fn: 'write',    desc: _('Greater than or equal') },
                    times:  { label: '&times;',     latex: '\\times',   fn: 'cmd',      desc: _('Multiply') },
                    divide: { label: '&divide;',    latex: '\\div',     fn: 'cmd',      desc: _('Divide') }
                },
                availableToolbars = {
                    base: {
                        container: this.$toolbar,
                        tools: ['sqrt', 'frac', 'exp', 'pi', 'leq', 'geq', 'times', 'divide']
                    }
                },
                toolbar;

            toolbar = availableToolbars.base;

            toolbar.tools.forEach(function(toolId) {
                var toolConfig = availableTools[toolId];

                toolConfig.id = toolId;
                toolConfig.container = toolbar.container;

                createTool(toolConfig);
            });

            this.$toolbar.on('click.qtiCommonRenderer', function(e) {
                var $target = $(e.target),
                    fn = $target.data('fn'),
                    latex = $target.data('latex');

                switch (fn) {
                    case 'cmd':
                        self.mathField.cmd(latex);
                        break;
                    case 'write':
                        self.mathField.write(latex);
                        break;
                }
            });
        },


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
            event.addEventMgr(this);

            this.id = id;
            this.dom = dom;
            this.config = config;

            this.$container = $(dom);
            this.$toolbar = this.$container.find('.toolbar');
            this.$input = this.$container.find('.math-entry-input');

            this.createTools();
            this.createMathField();

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
            return response; //fixme: implement this
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