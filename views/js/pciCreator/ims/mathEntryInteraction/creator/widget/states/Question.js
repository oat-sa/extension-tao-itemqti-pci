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
 */

define([
    'jquery',
    'i18n',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!mathEntryInteraction/creator/tpl/propertiesForm',
    'tpl!mathEntryInteraction/creator/tpl/addGapBtn',
    'mathEntryInteraction/runtime/helper/mathInPrompt'
], function($, __, stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, addGapBtnTpl, mathInPrompt){
    'use strict';

    var $addGapBtn = $(addGapBtnTpl());

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

    MathEntryInteractionStateQuestion.prototype.initForm = function initForm(){

        var self = this,
            _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            $gapStyleBox,
            $gapStyleSelector;

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),

            authorizeWhiteSpace: toBoolean(interaction.prop('authorizeWhiteSpace'), false),
            useGapExpression: toBoolean(interaction.prop('useGapExpression'), false),
            focusOnDenominator: toBoolean(interaction.prop('focusOnDenominator'), false),

            tool_frac:      toBoolean(interaction.prop('tool_frac'),    true),
            tool_sqrt:      toBoolean(interaction.prop('tool_sqrt'),    true),
            tool_exp:       toBoolean(interaction.prop('tool_exp'),     true),
            tool_log:       toBoolean(interaction.prop('tool_log'),     true),
            tool_ln:        toBoolean(interaction.prop('tool_ln'),      true),
            tool_limit:     toBoolean(interaction.prop('tool_limit'),   true),
            tool_sum:       toBoolean(interaction.prop('tool_sum'),     true),
            tool_nthroot:   toBoolean(interaction.prop('tool_nthroot'), true),
            tool_e:         toBoolean(interaction.prop('tool_e'),       true),
            tool_infinity:  toBoolean(interaction.prop('tool_infinity'),true),
            squarebkts:     toBoolean(interaction.prop('tool_rbrack'),  true) && toBoolean(interaction.prop('tool_lbrack'), true),
            tool_pi:        toBoolean(interaction.prop('tool_pi'),      true),
            tool_cos:       toBoolean(interaction.prop('tool_cos'),     true),
            tool_sin:       toBoolean(interaction.prop('tool_sin'),     true),
            tool_tan:       toBoolean(interaction.prop('tan'),          true),
            tool_lte:       toBoolean(interaction.prop('tool_lte'),     true),
            tool_gte:       toBoolean(interaction.prop('tool_gte'),     true),
            tool_times:     toBoolean(interaction.prop('tool_times'),   true),
            tool_divide:    toBoolean(interaction.prop('tool_divide'),  true),
            tool_plusminus: toBoolean(interaction.prop('tool_plusminus'),true),
            roundbkts:      toBoolean(interaction.prop('tool_rparen'),  true) && toBoolean(interaction.prop('tool_lparen'), true),
            curlybkts:      toBoolean(interaction.prop('tool_rbrace'),  true) && toBoolean(interaction.prop('tool_lbrace'), true),
            tool_angle:     toBoolean(interaction.prop('tool_angle'),   true),
            tool_minus:     toBoolean(interaction.prop('tool_minus'),   true),
            tool_plus:      toBoolean(interaction.prop('tool_plus'),    true),
            tool_equal:     toBoolean(interaction.prop('tool_equal'),   true),
            tool_lower:     toBoolean(interaction.prop('tool_lower'),   true),
            tool_greater:   toBoolean(interaction.prop('tool_greater'), true),
            tool_subscript: toBoolean(interaction.prop('tool_subscript'),true),
            tool_integral:  toBoolean(interaction.prop('tool_integral'),true),
            tool_timesdot:  toBoolean(interaction.prop('tool_timesdot'),true),
            tool_triangle:  toBoolean(interaction.prop('tool_triangle'),true),
            tool_similar:   toBoolean(interaction.prop('tool_similar'), true),
            tool_paral:     toBoolean(interaction.prop('tool_paral'),   true),
            tool_perp:      toBoolean(interaction.prop('tool_perp'),    true),
            tool_inmem:     toBoolean(interaction.prop('tool_inmem'),   true),
            tool_ninmem:    toBoolean(interaction.prop('tool_ninmem'),  true),
            tool_union:     toBoolean(interaction.prop('tool_union'),   true),
            tool_intersec:  toBoolean(interaction.prop('tool_intersec'),true),
            tool_colon:     toBoolean(interaction.prop('tool_colon'),   true),
            tool_to:        toBoolean(interaction.prop('tool_to'),      true),
            tool_congruent: toBoolean(interaction.prop('tool_congruent'),   true),
            tool_subset: toBoolean(interaction.prop('tool_subset'),     true),
            tool_superset: toBoolean(interaction.prop('tool_superset'), true),
            tool_contains: toBoolean(interaction.prop('tool_contains'), true),
            tool_approx:    toBoolean(interaction.prop('tool_approx'),  true),
            tool_vline:     toBoolean(interaction.prop('tool_vline'),   true),
            tool_degree:    toBoolean(interaction.prop('tool_degree'),  true),
            tool_percent:    toBoolean(interaction.prop('tool_percent'),  true),
            tool_matrix_2row:   toBoolean(interaction.prop('tool_matrix_2row'),        true),
            tool_matrix_2row_2col:   toBoolean(interaction.prop('tool_matrix_2row_2col'),        true),
            allowNewLine:   toBoolean(interaction.prop('allowNewLine'), false),
            enableAutoWrap: toBoolean(interaction.prop('enableAutoWrap'), false)
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
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

            tool_frac:      configChangeCallBack,
            tool_sqrt:      configChangeCallBack,
            tool_exp:       configChangeCallBack,
            tool_log:       configChangeCallBack,
            tool_ln:        configChangeCallBack,
            tool_limit:     configChangeCallBack,
            tool_sum:       configChangeCallBack,
            tool_nthroot:   configChangeCallBack,
            tool_e:         configChangeCallBack,
            tool_infinity:  configChangeCallBack,
            tool_pi:        configChangeCallBack,
            tool_cos:       configChangeCallBack,
            tool_sin:       configChangeCallBack,
            tool_tan:       configChangeCallBack,
            tool_lte:       configChangeCallBack,
            tool_gte:       configChangeCallBack,
            tool_times:     configChangeCallBack,
            tool_divide:    configChangeCallBack,
            tool_plusminus: configChangeCallBack,
            tool_angle:     configChangeCallBack,
            tool_minus:     configChangeCallBack,
            tool_plus:      configChangeCallBack,
            tool_equal:     configChangeCallBack,
            tool_lower:     configChangeCallBack,
            tool_greater:   configChangeCallBack,
            tool_subscript: configChangeCallBack,
            tool_integral:  configChangeCallBack,
            tool_timesdot:  configChangeCallBack,
            tool_triangle:  configChangeCallBack,
            tool_similar:   configChangeCallBack,
            tool_paral:     configChangeCallBack,
            tool_perp:      configChangeCallBack,
            tool_inmem:     configChangeCallBack,
            tool_ninmem:    configChangeCallBack,
            tool_union:     configChangeCallBack,
            tool_intersec:  configChangeCallBack,
            tool_colon:     configChangeCallBack,
            tool_to:     configChangeCallBack,
            tool_congruent: configChangeCallBack,
            tool_subset:    configChangeCallBack,
            tool_superset:    configChangeCallBack,
            tool_contains:    configChangeCallBack,
            tool_approx:    configChangeCallBack,
            tool_vline:     configChangeCallBack,
            tool_degree:    configChangeCallBack,
            tool_percent:    configChangeCallBack,
            tool_matrix_2row:    configChangeCallBack,
            tool_matrix_2row_2col:    configChangeCallBack,

            squarebkts: function squarebktsChangeCallBack(i, value) {
                i.prop('tool_lbrack', value);
                i.prop('tool_rbrack', value);
                i.triggerPci('configChange', [i.getProperties()]);
            },
            roundbkts: function roundbktsChangeCallBack(i, value) {
                i.prop('tool_lparen', value);
                i.prop('tool_rparen', value);
                i.triggerPci('configChange', [i.getProperties()]);
            },
            curlybkts: function curlybktsChangeCallBack(i, value) {
                i.prop('tool_lbrace', value);
                i.prop('tool_rbrace', value);
                i.triggerPci('configChange', [i.getProperties()]);
            },

            allowNewLine: configChangeCallBack,
            enableAutoWrap: configChangeCallBack
        });


        $gapStyleBox = $form.find('.mathgap-style-box');
        $gapStyleSelector = $gapStyleBox.find('[data-mathgap-style]');

        $gapStyleSelector.select2({
            width: '100%',
            minimumResultsForSearch: Infinity
        })
        .val(interaction.prop('gapStyle'))
        .trigger('change');
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
