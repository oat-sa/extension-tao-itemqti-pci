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
 * Copyright (c) 2016-2025 (original work) Open Assessment Technologies SA;
 */

define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!mathEntryInteraction/creator/tpl/propertiesForm',
    'tpl!mathEntryInteraction/creator/tpl/addGapBtn',
    'mathEntryInteraction/runtime/helper/mathInPrompt'
], function($, _, __, stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, addGapBtnTpl, mathInPrompt){
    'use strict';

    var $addGapBtn = $(addGapBtnTpl());

    // initial list of tools checkboxes with the properties they depend on
    const tools = {
        tool_frac:       { props: [{ name: 'tool_frac', defaultValue: true }]},
        tool_sqrt:       { props: [{ name: 'tool_sqrt', defaultValue: true }]},
        tool_exp:        { props: [{ name: 'tool_exp', defaultValue: true }]},
        tool_log:        { props: [{ name: 'tool_log', defaultValue: true }]},
        tool_ln:         { props: [{ name: 'tool_ln', defaultValue: true }]},
        tool_limit:      { props: [{ name: 'tool_limit', defaultValue: true }]},
        tool_sum:        { props: [{ name: 'tool_sum', defaultValue: true }]},
        tool_nthroot:    { props: [{ name: 'tool_nthroot', defaultValue: true }]},
        tool_e:          { props: [{ name: 'tool_e', defaultValue: true }]},
        tool_infinity:   { props: [{ name: 'tool_infinity', defaultValue: true }]},
        squarebkts:      { props: [{ name: 'tool_rbrack', defaultValue: true }, { name: 'tool_lbrack', defaultValue: true }]},
        tool_pi:         { props: [{ name: 'tool_pi', defaultValue: true }]},
        tool_cos:        { props: [{ name: 'tool_cos', defaultValue: true }]},
        tool_sin:        { props: [{ name: 'tool_sin', defaultValue: true }]},
        tool_tan:        { props: [{ name: 'tool_tan', defaultValue: true }]},
        tool_lte:        { props: [{ name: 'tool_lte', defaultValue: true }]},
        tool_gte:        { props: [{ name: 'tool_gte', defaultValue: true }]},
        tool_times:      { props: [{ name: 'tool_times', defaultValue: true }]},
        tool_divide:     { props: [{ name: 'tool_divide', defaultValue: true }]},
        tool_plusminus:  { props: [{ name: 'tool_plusminus', defaultValue: true }]},
        roundbkts:       { props: [{ name: 'tool_rparen', defaultValue: true }, { name: 'tool_lparen', defaultValue: true }]},
        curlybkts:       { props: [{ name: 'tool_rbrace', defaultValue: true }, { name: 'tool_lbrace', defaultValue: true }]},
        tool_angle:      { props: [{ name: 'tool_angle', defaultValue: true }]},
        tool_minus:      { props: [{ name: 'tool_minus', defaultValue: true }]},
        tool_plus:       { props: [{ name: 'tool_plus', defaultValue: true }]},
        tool_equal:      { props: [{ name: 'tool_equal', defaultValue: true }]},
        tool_lower:      { props: [{ name: 'tool_lower', defaultValue: true }]},
        tool_greater:    { props: [{ name: 'tool_greater', defaultValue: true }]},
        tool_subscript:  { props: [{ name: 'tool_subscript', defaultValue: true }]},
        tool_integral:   { props: [{ name: 'tool_integral', defaultValue: true }]},
        tool_timesdot:   { props: [{ name: 'tool_timesdot', defaultValue: true }]},
        tool_triangle:   { props: [{ name: 'tool_triangle', defaultValue: true }]},
        tool_similar:    { props: [{ name: 'tool_similar', defaultValue: true }]},
        tool_paral:      { props: [{ name: 'tool_paral', defaultValue: true }]},
        tool_perp:       { props: [{ name: 'tool_perp', defaultValue: true }]},
        tool_inmem:      { props: [{ name: 'tool_inmem', defaultValue: true }]},
        tool_ninmem:     { props: [{ name: 'tool_ninmem', defaultValue: true }]},
        tool_union:      { props: [{ name: 'tool_union', defaultValue: true }]},
        tool_intersec:   { props: [{ name: 'tool_intersec', defaultValue: true }]},
        tool_colon:      { props: [{ name: 'tool_colon', defaultValue: true }]},
        tool_to:         { props: [{ name: 'tool_to', defaultValue: true }]},
        tool_congruent:  { props: [{ name: 'tool_congruent', defaultValue: true }]},
        tool_subset:     { props: [{ name: 'tool_subset', defaultValue: true }]},
        tool_superset:   { props: [{ name: 'tool_superset', defaultValue: true }]},
        tool_contains:   { props: [{ name: 'tool_contains', defaultValue: true }]},
        tool_approx:     { props: [{ name: 'tool_approx', defaultValue: true }]},
        tool_vline:      { props: [{ name: 'tool_vline', defaultValue: true }]},
        tool_degree:     { props: [{ name: 'tool_degree', defaultValue: true }]},
        tool_percent:    { props: [{ name: 'tool_percent', defaultValue: true }]},
        tool_matrix_2row:        { props: [{ name: 'tool_matrix_2row', defaultValue: true }]},
        tool_matrix_2row_2col:   { props: [{ name: 'tool_matrix_2row_2col', defaultValue: true }]},
    };

    var MathEntryInteractionStateQuestion = stateFactory.extend(Question, function create(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        containerEditor.create($prompt, {
            change : function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();

                if (!$prompt.is('[data-html-editable-container="true"]')) {
                    mathInPrompt.postRender($prompt);
                }
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction,
            qtiImage: false,
            areaBroker: this.widget.getAreaBroker()
        });

        if (toBoolean(interaction.prop('useGapExpression'), false)) {
            this.createAddGapBtn();
        }

        this.addMathFieldListener();

    }, function exit(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);

        this.removeAddGapBtn();
    });

    function toBoolean(value, defaultValue) {
        if (typeof(value) === "undefined") {
            return defaultValue;
        } else {
            return (value === true || value === "true");
        }
    }
    /**
     * Callback for configuration change
     * @param {Object} interaction - the current interaction
     * @param {String} value - new value of the changed property
     * @param {String} name - changed property
     */
    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    /**
     * Toggle all provided checkboxes
     * @param {Object} interaction - the current interaction
     * @param {Object} $checkboxes - checkboxes to toggle
     * @param {Boolean} value - new value of the checkboxes
     */
    function toggleCheckBoxes(interaction, $checkboxes, value) {
        $checkboxes.prop({ checked: value, indeterminate: false });
    
        $checkboxes.each(function() {
            const propName = $(this).attr('name');
            if (tools[propName]) {
                tools[propName].props.forEach(prop => {
                    interaction.prop(prop.name, value);
                });
            }
        });
    }
    
    /**
     * Callback for toggle_all checkbox change
     * @param {Object} interaction - the current interaction
     * @param {Boolean} value - new value of the checkbox
     */
    function toggleAllChangeCallBack(interaction, value) {
        const $checkboxes = $(this).closest('.tools').find('[type="checkbox"]');
    
        toggleCheckBoxes(interaction, $checkboxes, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    /**
     * Callback for group checkbox change
     * @param {Object} interaction - the current interaction
     * @param {Boolean} value - new value of the checkbox
     */
    function groupChangeCallBack(interaction, value) {
        const $this = $(this);
        const $checkboxes = $this.closest('.group').find('[type="checkbox"]');
        toggleCheckBoxes(interaction, $checkboxes, value);
        // align the state of the toggle_all checkbox
        const $allTools = $this.closest('.tools');
        updateParentCheckboxState($allTools, '[name="toggle_all"]');
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    /**
     * Get initial values for the tools checkboxes
     * @param {Object} interaction - the current interaction
     * @returns {Object} - initial values for the tools checkboxes
     */
    function getToolsInitValues(interaction) {
        return Object.keys(tools).reduce((acc, tool) => {
            acc[tool] = tools[tool].props.every(prop => toBoolean(interaction.prop(prop.name), prop.defaultValue));
            return acc;
        }, {});
    };

    /**
     * Update the state of the parent checkbox depending on the state of the child checkboxes
     * @param {Object} $container - the container of the checkboxes
     * @param {String} parentSelector - selector of the parent checkbox
     */
    function updateParentCheckboxState($container, parentSelector) {
        const $parentCheckbox = $container.find(parentSelector);
        const $childCheckboxes = $container.find('[type="checkbox"]').not(parentSelector);
    
        const checkedCount = $childCheckboxes.filter(':checked').length;
        const allUnchecked = checkedCount === 0;
        const allChecked = checkedCount === $childCheckboxes.length;
    
        if ($parentCheckbox.length) {
            $parentCheckbox[0].checked = allChecked;
            $parentCheckbox[0].indeterminate = !allUnchecked && !allChecked;
        }
    }

    /**
     * Callback for tool checkbox change
     * @param {Object} interaction - the current interaction
     * @param {Boolean} value - new value of the checkbox
     * @param {String} name - name of the checkbox
     */
    function toolChangeCallBack(interaction, value, name) {
        if (tools[name]) {
            tools[name].props.forEach(prop => interaction.prop(prop.name, value));
        }
    
        const $this = $(this);
        const $group = $this.closest('.group');
        const $allTools = $this.closest('.tools');
        // align the state of the group checkbox
        updateParentCheckboxState($group, '[name="group"]');
        // align the state of the toggle_all checkbox
        updateParentCheckboxState($allTools, '[name="toggle_all"]');
    
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }
    
    /**
     * Set the state of the group checkboxes depending on the state of the child checkboxes
     * @param {Object} $form - the form
     */
    function setGroupCheckboxStates($form) {
        $form.find('.group').each(function() {
            updateParentCheckboxState($(this), '[name="group"]');
        });
    }
    
    /**
     * Set the state of the toggle_all checkbox depending on the state of the child checkboxes
     * @param {Object} $form - the form
     */
    function setToggleAllCheckboxState($form) {
        updateParentCheckboxState($form.find('.tools'), '[name="toggle_all"]');
    }

    /**
     * Get the change callbacks for the tools checkboxes
     * @returns {Object} - callbacks for the tools checkboxes
     */
    function getToolsCallBacks() {
        return Object.keys(tools).reduce((acc, tool) => {
            acc[tool] = toolChangeCallBack;
            return acc;
        }, {});
    };

    MathEntryInteractionStateQuestion.prototype.initForm = function initForm(){

        var self = this,
            _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            $gapStyleBox,
            $gapStyleSelector;

        //render the form using the form template
        $form.html(formTpl(_.assign({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),

            authorizeWhiteSpace: toBoolean(interaction.prop('authorizeWhiteSpace'), false),
            useGapExpression: toBoolean(interaction.prop('useGapExpression'), false),
            focusOnDenominator: toBoolean(interaction.prop('focusOnDenominator'), false),

            allowNewLine:   toBoolean(interaction.prop('allowNewLine'), false),
            enableAutoWrap: toBoolean(interaction.prop('enableAutoWrap'), false)
        }, getToolsInitValues(interaction))));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, _.assign({
            identifier: function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            useGapExpression: function gapChangeCallback(i, value) {
                if (toBoolean(value, false)) {
                    self.createAddGapBtn();
                    $gapStyleBox.show();
                    response.removeMapEntries();
                } else {
                    i.prop('gapExpression', '');
                    self.removeAddGapBtn();
                    $gapStyleBox.hide();
                    response.removeMapEntries();
                }

                response.attr('cardinality', 'single');
                configChangeCallBack(i, value, 'useGapExpression');
            },
            gapStyle: function gapStyleChangeCallback(i, newStyle) {

                i.prop('gapStyle', newStyle);

                configChangeCallBack(i, newStyle, 'gapStyle');
            },
            authorizeWhiteSpace: configChangeCallBack,
            focusOnDenominator: configChangeCallBack,

            toggle_all:     toggleAllChangeCallBack,
            group:          groupChangeCallBack,

            allowNewLine:   configChangeCallBack,
            enableAutoWrap: configChangeCallBack
        }, getToolsCallBacks()));


        $gapStyleBox = $form.find('.mathgap-style-box');
        $gapStyleSelector = $gapStyleBox.find('[data-mathgap-style]');

        $gapStyleSelector.select2({
            width: '100%',
            minimumResultsForSearch: Infinity
        })
        .val(interaction.prop('gapStyle'))
        .trigger('change');
        // set initial state of the toggle_all and group checkboxes
        setGroupCheckboxStates($form);
        setToggleAllCheckboxState($form);
    };

    /**
     * Change callback for editable math field
     */

    MathEntryInteractionStateQuestion.prototype.addMathFieldListener = function addMathFieldListener() {
        var _widget = this.widget,
            interaction = _widget.element;

        interaction.onPci('responseChange', function (latex) {
            if (toBoolean(interaction.prop('useGapExpression'), false)) {
                interaction.prop('gapExpression', latex);
            } else {
                interaction.prop('gapExpression', '');
            }
        });
    };

    /**
     * Display the "Add Gap" button
     */
    MathEntryInteractionStateQuestion.prototype.createAddGapBtn = function createAddGapBtn() {
        var _widget = this.widget,
            $container = _widget.$container,
            $toolbar = $container.find('.toolbar'),
            interaction =_widget.element;

        if ($toolbar.length) {
            $toolbar.after($addGapBtn);
            $addGapBtn.on('click', function() {
                interaction.getResponseDeclaration().removeMapEntries();
                interaction.triggerPci('addGap');
            });
        }
    };

    /**
     * Remove the "Add Gap" button from the DOM
     */
    MathEntryInteractionStateQuestion.prototype.removeAddGapBtn = function removeAddGapBtn() {
        $addGapBtn.off('click');
        $addGapBtn.remove();
    };

    return MathEntryInteractionStateQuestion;
});
