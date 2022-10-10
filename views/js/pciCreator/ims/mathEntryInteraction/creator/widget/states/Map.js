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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA;
 */
define([
    'handlebars',
    'i18n',
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Map',
    'tpl!mathEntryInteraction/creator/tpl/responseForm',
    'tpl!mathEntryInteraction/creator/tpl/scoreForm',
    'tpl!mathEntryInteraction/creator/tpl/addAlternativeBtn',
    'tpl!mathEntryInteraction/creator/tpl/alternativeForm',
    'taoQtiItem/qtiCreator/widgets/component/minMax/minMax',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'ui/tooltip'
], function (
    hb,
    __,
    _,
    $,
    stateFactory,
    Map,
    responseFormTpl,
    scoreTpl,
    addAlternativeBtn,
    alternativeFormTpl,
    minMaxComponentFactory,
    formElement,
    tooltip
) {
    'use strict';
    hb.registerHelper('increaseIndex', function (value, options) {
        return parseInt(value) + 1;
    });
    const $addAlternativeBtn = $(addAlternativeBtn());
    const MathEntryInteractionStateResponse = stateFactory.create(
        Map,
        function init() {
            this.initGlobalVariables();
            this.initForm();
        },
        function exit() {
            this.emptyGapFields();
            this.toggleResponseMode(false);
            this.saveAnswers();
            this.removeResponseChangeEventListener();
            this.removeDeleteListeners();
            this.removeAddButtonListener();
            this.destroyForm();
        }
    );


    MathEntryInteractionStateResponse.prototype.initGlobalVariables = function initGlobalVariables() {
        let interaction = this.widget.element;
        this.activeEditId = null;
        this.correctResponses = [];

        if (this.inGapMode() === true) {
            interaction = this.widget.element;
            this.gapTemplate = interaction.prop('gapExpression');
        }
    }

    MathEntryInteractionStateResponse.prototype.initForm = function initForm() {
        const interaction = this.widget.element;
        const $responseForm = this.widget.$responseForm;

        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();
        const mappingDisabled = _.isEmpty(mapEntries);
        this.initResponseChangeEventListener();
        this.correctResponses = this.getExistingCorrectAnswerOptions();
        $responseForm.html(responseFormTpl({
            identifier: interaction.attr('responseIdentifier'),
            serial: response.serial,
            min: interaction.prop('min'),
            max: interaction.prop('max'),
            mappingDisabled,
            defaultValue: response.getMappingAttribute('defaultValue')
        }));

        minMaxComponentFactory($responseForm.find('.response-mapping-attributes > .min-max-panel'), {
            min: {
                fieldName: 'lowerBound',
                value: _.parseInt(response.getMappingAttribute('lowerBound')) || 0,
                helpMessage: __('Minimal score for this interaction.')
            },
            max: {
                fieldName: 'upperBound',
                value: _.parseInt(response.getMappingAttribute('upperBound')) || 0,
                helpMessage: __('Maximal score for this interaction.')
            },
            upperThreshold: Number.MAX_SAFE_INTEGER,
            syncValues: true
        });     
        this.initResponseForm();
        this.createScoreResponse();
        this.initEditingOptions();
        this.initAlternativeInput();

        // show tooltip
        tooltip.lookup($responseForm);
    }

    MathEntryInteractionStateResponse.prototype.initResponseForm = function initResponseForm() {
        if (this.correctResponses.length > 0) {
            return false;
        }
        const interaction = this.widget.element;

        let newCorrectAnswer;

        if (this.inGapMode() === true) {
            this.emptyGapFields();
            const gapExpression = interaction.prop('gapExpression');
            const gapCount = (gapExpression.match(/\\taoGap/g) || []).length;
            if (gapCount > 0) {
                newCorrectAnswer = [];
                for (let i = 0; i < gapCount; i++) {
                    newCorrectAnswer.push(' ');
                }

                newCorrectAnswer = newCorrectAnswer.join(',');
            } else {
                newCorrectAnswer = '';
            }
        } else {
            newCorrectAnswer = '';
            this.toggleResponseMode(false);
        }

        this.correctResponses[0] = newCorrectAnswer;
    }

    MathEntryInteractionStateResponse.prototype.createScoreResponse = function createScoreResponse() {
        const $container = this.widget.$container;
        const input = $container.find('.math-entry-input');

        if ($container.find('.math-entry-response-wrap').length > 0) {
            return false
        }

        const interaction = this.widget.element;
        const response = interaction.getResponseDeclaration();
        this.$responseCorrectTitle = $('<span>', {
            'class': 'math-entry-response-title math-entry-response-correct'
        }).html('Correct');
        input[0].parentNode.prepend(this.$responseCorrectTitle[0]);
        input[0].parentNode.className = 'math-entry-correct-wrap';
        input[0].parentNode.dataset.index = 0;
        this.$scoreDiv = $('<div>', {
            'class': 'math-entry-score-wrap math-entry-response-correct'
        });
        input[0].parentNode.parentNode.insertBefore(this.$scoreDiv[0], input.nextSibling);
        this.$scoreDiv.after($addAlternativeBtn);
        $('.math-entry-correct-wrap, .math-entry-score-wrap').wrapAll('<div class="math-entry-response-wrap"></div>');
    
        this.$responseCorrectScore = $('<span>', {
            'class': 'math-entry-score-title math-entry-response-correct'
        }).html('Score');
        this.$scoreDiv.append(scoreTpl({
            serial: response.serial,
            placeholder: response.getMappingAttribute('defaultValue')
        }));
        this.$scoreDiv.prepend(this.$responseCorrectScore);

        //add placeholder text to show the default value
        const $scores = $container.find('.math-entry-response-wrap .math-entry-score-input');
        $scores.on('click', e => {
            e.stopPropagation();
            e.preventDefault();
        });

        this.widget.on('mappingAttributeChange', data => {
            if (data.key === 'defaultValue') {
                $scores.attr('placeholder', data.value);
            }
        });

        //init form javascript
        formElement.initWidget($container);
        formElement.setChangeCallbacks($container, response,
            _.assign({
                mathEntryScoreInput: function (response, value) {
                    const key = $(this.widget).data('for');
                    if (value === '') {
                        response.removeMapEntry(key);
                    } else {
                        response.setMapEntry(key, value, true);
                    }

                }
            })
        );
    }

    MathEntryInteractionStateResponse.prototype.getExistingCorrectAnswerOptions = function getExistingCorrectAnswerOptions() {
        const interaction = this.widget.element;

        const mapEntries = interaction.getResponseDeclaration().getMapEntries();
        return _.keys(mapEntries) || [];
    }

    MathEntryInteractionStateResponse.prototype.initResponseChangeEventListener = function initResponseChangeEventListener() {
        const interaction = this.widget.element;

        interaction.onPci('responseChange', (latex, index, parentIndex) => {
            if (interaction.prop('inResponseState')) {
                let editIdIndex = 0;
                if (typeof index === 'number') {
                    editIdIndex = index 
                } else if (typeof this.activeEditId === 'number') {
                    editIdIndex = this.activeEditId
                } else if (typeof parentIndex === 'number') {
                    editIdIndex = parentIndex
                }
                if (this.inGapMode(this) === false && editIdIndex !== null) {
                    this.correctResponses[editIdIndex] = latex;
                } else if (this.inGapMode(this) === true && editIdIndex !== null) {
                    const response = interaction.getResponse();
                    if (response !== null) {
                        this.correctResponses[editIdIndex] = response.base.string;
                    }
                }
            }
        });
    }

    MathEntryInteractionStateResponse.prototype.removeResponseChangeEventListener = function removeResponseChangeEventListener() {
        const interaction = this.widget.element;

        interaction.offPci('responseChange');
    }

    MathEntryInteractionStateResponse.prototype.initEditingOptions = function initEditingOptions() {
        this.toggleResponseMode(true);
        const interaction = this.widget.element;
        const $container = this.widget.$container;
        const responseDeclaration = interaction.getResponseDeclaration();
        const mapEntries = responseDeclaration.getMapEntries();

        const inputs = $container.find('.math-entry-input');
        if (this.correctResponses.length > 0) {
            this.correctResponses.forEach((value, index) => {
                this.activeEditId = index;
                if (this.inGapMode() === true) {
                    if (this.correctResponses.length > inputs.length && index > 0) {
                        this.addAlternativeInput(this.activeEditId)
                    } else {
                        const response = this.getGapResponseObject(value);
                        interaction.triggerPci('latexGapInput', [response, this.activeEditId]);
                    }
                } else {
                    if (this.correctResponses.length > inputs.length && index > 0) {
                        this.addAlternativeInput(this.activeEditId)
                    } else {
                        interaction.triggerPci('latexInput', [this.correctResponses[this.activeEditId]]);
                        const scoreInput = this.widget.$container.find('.math-entry-score-input.math-entry-response-correct');
                        if (scoreInput.length > 0) {
                            scoreInput[0].value = mapEntries && mapEntries[value] || responseDeclaration.getMappingAttribute('defaultValue') || 0
                        }
                    }
                }            
            })
        }
        this.activeEditId = null;
        
    }

    // forming gap response object to be further processed by the latexGapInput event
    MathEntryInteractionStateResponse.prototype.getGapResponseObject = function getGapResponseObject(response) {
        return {
            base: {
                string: response.split(',')
            }
        }
    }

    // removing all saved map entries
    MathEntryInteractionStateResponse.prototype.clearMapEntries = function clearMapEntries() {
        const interaction = this.widget.element;
        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();

        _.keys(mapEntries).forEach(function (mapKey) {
            response.removeMapEntry(mapKey, true);
        });
    }

    MathEntryInteractionStateResponse.prototype.initDeletingOptions = function initDeletingOptions() {
        const interaction = this.widget.element;
        interaction.onPci('deleteInput', (inputEntry) => { 
            const index = this.correctResponses.indexOf(inputEntry)
            if (index < 0) {
                return false
            }

            if (this.inGapMode() === true) {
                this.activeEditId = index;
                this.emptyGapFields();
            } else {
                this.activeEditId = 0;
            }
            this.correctResponses.splice(index, 1);
        })
    }


    /**
     *   remove all event listeners to avoid any potential memory leaks
     */
    MathEntryInteractionStateResponse.prototype.removeDeleteListeners = function removeDeleteListeners() {
        const $deleteButtons = this.widget.$container.find('.entry-config');
        $deleteButtons.find('.answer-delete').off('click');
    }

    MathEntryInteractionStateResponse.prototype.removeAddButtonListener = function removeAddButtonListener() {
        $addAlternativeBtn.off('click');
    }

    MathEntryInteractionStateResponse.prototype.destroyForm = function destroyForm() {
        const $responseForm = this.widget.$responseForm;
        $responseForm.find('.mathEntryInteraction').remove();
    }

    MathEntryInteractionStateResponse.prototype.saveAnswers = function saveAnswers() {
        const interaction = this.widget.element;
        const responseDeclaration = interaction.getResponseDeclaration();

        this.clearMapEntries();

        if (this.inGapMode() === true) {
            this.correctResponses = this.correctResponses.filter(function (response) {
                return response.split(',').indexOf('') === -1;
            });
        }
        const score = [];
        if (this.correctResponses.length) {
            const scoreInput = this.widget.$container.find('.math-entry-score-input')
            scoreInput.map(input => {
                score.push(scoreInput[input].value);
            })
        }

        this.correctResponses.forEach((response, index) => {
            const scoreValue = score[index] ? score[index] : responseDeclaration.getMappingAttribute('defaultValue')
            responseDeclaration.setMapEntry(response, scoreValue, false);
            responseDeclaration.setCorrect(this.correctResponses[0]);
        });
    }

    /**
     *   if in gap mode: will empty all the gap fields
     */
    MathEntryInteractionStateResponse.prototype.emptyGapFields = function emptyGapFields() {
        const interaction = this.widget.element;

        if (this.inGapMode() === true) {
            this.activeEditId = null;

            interaction.prop('gapExpression', this.gapTemplate);
            this.toggleResponseMode(false);
        }
    }

    MathEntryInteractionStateResponse.prototype.toggleResponseMode = function toggleResponseMode(value) {
        const interaction = this.widget.element;

        if (interaction.prop('inResponseState') !== value) {
            interaction.prop('inResponseState', value);
            interaction.triggerPci('configChange', [interaction.getProperties()]);
        }
    }

    MathEntryInteractionStateResponse.prototype.inGapMode = function inGapMode() {
        const interaction = this.widget.element;
        const useGapExpression = interaction.prop('useGapExpression');
        return useGapExpression && useGapExpression !== 'false' || false;
    }

    MathEntryInteractionStateResponse.prototype.initAlternativeInput = function initAlternativeInput() {
        $addAlternativeBtn.on('click', () => {
            this.addAlternativeInput(0)
        });
    }

    MathEntryInteractionStateResponse.prototype.addAlternativeInput = function addAlternativeInput(responseId = 0) { 
        const interaction = this.widget.element;
        const $container = this.widget.$container;
        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();
        let dataIndex = 0;
        const focusSelected = $container.find('.math-entry-input');
        if (focusSelected.length > 0) {
            dataIndex = focusSelected[focusSelected.length - 1].parentNode.dataset.index;
        }

        let responseValue = '';

        let mapEntryResponse = Object.keys(mapEntries);
        let gapValues = mapEntryResponse[responseId] ? this.getGapResponseObject(mapEntryResponse[responseId]) : null;
        if (this.inGapMode() === true) { 
            responseValue = this.gapTemplate
        } else {
            responseValue = this.correctResponses[responseId]
        }

        $('button.math-entry-response-correct').before(alternativeFormTpl({
            index: Number(dataIndex) + 1,
            placeholder: response.getMappingAttribute('defaultValue'),
            score: mapEntries.length > 0 && mapEntries[this.correctResponses[responseId]] || response.getMappingAttribute('defaultValue')
        }));
        // show tooltip
        tooltip.lookup($('.answer-delete'));

        //add placeholder text to show the default value
        const $scores = $container.find('.math-entry-score-input');
        $scores.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });
        this.widget.on('mappingAttributeChange', function (data) {
            if (data.key === 'defaultValue') {
                $scores.attr('placeholder', data.value);
            }
        });
        interaction.triggerPci('addAlternative', [responseValue, gapValues]);
        this.initDeletingOptions();
    }

    return MathEntryInteractionStateResponse;
});
