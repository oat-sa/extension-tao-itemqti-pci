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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA;
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
    MapState,
    responseFormTpl,
    scoreTpl,
    addAlternativeBtn,
    alternativeFormTpl,
    minMaxComponentFactory,
    formElement,
    tooltip
) {
    'use strict';
    hb.registerHelper('increaseIndex', function (value) {
        return parseInt(value) + 1;
    });
    let uidCounter = 0;

    const MathEntryInteractionStateResponse = stateFactory.create(
        MapState,
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

        const pci = this.widget.element.data('pci');
        const responsesManager = pci.getResponsesManager();

        this.correctResponses = responsesManager;

        //reset
        const [inputIndex] = this.correctResponses.keys();
        const inputValue = this.correctResponses.get(inputIndex);

        if (inputIndex.length) {
            uidCounter = inputIndex.split('-')[1];
            uidCounter++;
        }
        this.correctResponses.clear();
        $('.math-entry-alternative-wrap').parent('div').remove();

        this.correctResponses.set(inputIndex, inputValue);

        if (this.inGapMode() === true) {
            interaction = this.widget.element;
            this.gapTemplate = interaction.prop('gapExpression');
        }
    };

    MathEntryInteractionStateResponse.prototype.checkValues = function (index) {
        let inputValue = {};
        if (this.correctResponses.has(index) && Object.keys(this.correctResponses.get(index)).includes('input')) {
            inputValue = { input: this.correctResponses.get(index).input };
        }
        return inputValue;
    };

    MathEntryInteractionStateResponse.prototype.uid = function uid() {
        return `answer-${uidCounter++}`;
    };

    MathEntryInteractionStateResponse.prototype.initForm = function initForm() {
        const interaction = this.widget.element;
        const $responseForm = this.widget.$responseForm;

        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();
        const mappingDisabled = _.isEmpty(mapEntries);
        this.initResponseChangeEventListener();

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
        this.createScoreResponse();
        this.initResponseForm();
        this.initEditingOptions();
        this.initAlternativeInput();

        // show tooltip
        tooltip.lookup($responseForm);
    };

    MathEntryInteractionStateResponse.prototype.initResponseForm = function initResponseForm() {
        const interaction = this.widget.element;

        let newCorrectAnswer;

        // get first id
        const $input = this.widget.$container.find('.math-entry-input');
        const $score = this.widget.$container.find('.math-entry-response-wrap .math-entry-score-input');

        let id = this.correctResponses.getIndex();
        $score[0].dataset.for = id;
        $input[0].dataset.index = id;

        let existingReponses = this.getExistingCorrectAnswerOptions();
        if (existingReponses.length) {
            const response = interaction.getResponseDeclaration();
            const mapEntries = response.getMapEntries();
            existingReponses.forEach((entry, index) => {
                let newId =  id;
                if (index > 0) {
                    newId = this.uid();
                }
                const inputValue = this.checkValues(newId);
                this.correctResponses.set(newId, Object.assign(inputValue, { response: entry }));

                if (mapEntries[entry] && index < 1) {
                    $score[0].value = mapEntries[entry] || response.getMappingAttribute('defaultValue');
                }
            });
        } else {
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
            const inputValue = this.checkValues(id);
            this.correctResponses.set(id, Object.assign(inputValue, { response: newCorrectAnswer }));
        }
        this.activeEditId = id;
    };

    MathEntryInteractionStateResponse.prototype.createScoreResponse = function createScoreResponse() {
        const $addAlternativeBtn = $(addAlternativeBtn());
        const $container = this.widget.$container;
        if ($container.find('.math-entry-response-wrap').length > 0) {
            return false;
        }

        const interaction = this.widget.element;
        const response = interaction.getResponseDeclaration();

        const $input = $container.find('.math-entry-input');
        const parent = $input[0].parentNode;
        $(parent).prepend(scoreTpl({
            placeholder: response.getMappingAttribute('defaultValue')
        }));
        const $correct = $container.find('.math-entry-correct-wrap');
        $input.detach().appendTo($correct);
        $(parent).append($addAlternativeBtn);

        //add placeholder text to show the default value
        const $score = $container.find('.math-entry-response-wrap .math-entry-score-input');
        $score.on('click', e => {
            e.stopPropagation();
            e.preventDefault();
        });

        this.widget.on('mappingAttributeChange', data => {
            if (data.key === 'defaultValue') {
                $score.attr('placeholder', data.value);
            }
        });
        //init form javascript
        formElement.initWidget($container);
        formElement.setChangeCallbacks($container, response,
            {
                mathEntryScoreInput: (rsp, value) => {
                    const key = $(this.widget).data('for');
                    if (value === '') {
                        rsp.removeMapEntry(key);
                    } else {
                        rsp.setMapEntry(key, value, true);
                    }

                }
            }
        );
    };

    MathEntryInteractionStateResponse.prototype.getExistingCorrectAnswerOptions = function getExistingCorrectAnswerOptions() {
        const interaction = this.widget.element;
        const mapEntries = interaction.getResponseDeclaration().getMapEntries();
        return _.keys(mapEntries) || [];
    };

    MathEntryInteractionStateResponse.prototype.initResponseChangeEventListener = function initResponseChangeEventListener() {
        const interaction = this.widget.element;

        interaction.onPci('responseChange', (latex, index) => {
            if (interaction.prop('inResponseState')) {
                let editIdIndex = null;
                if (index && index.length > 0) {
                    editIdIndex = index;
                } else if (!!this.activeEditId) {
                    editIdIndex = this.activeEditId;
                }

                this.correctResponses.currentIndex(editIdIndex);
                if (this.inGapMode(this) === false && editIdIndex !== null) {
                    const inputValue = this.checkValues(editIdIndex);
                    this.correctResponses.set(editIdIndex, Object.assign(inputValue, { response: latex }));
                } else if (this.inGapMode(this) === true && editIdIndex !== null) {
                    const response = interaction.getResponse(editIdIndex);
                    if (response !== null) {
                        if (response.base.string.length > 0 || !!editIdIndex) {
                            const inputValue = this.checkValues(editIdIndex);
                            this.correctResponses.set(editIdIndex, Object.assign(inputValue, { response: response.base.string }));
                        }
                    }
                }
            }
        });
    };

    MathEntryInteractionStateResponse.prototype.removeResponseChangeEventListener = function removeResponseChangeEventListener() {
        const interaction = this.widget.element;

        interaction.offPci('responseChange');
    };

    MathEntryInteractionStateResponse.prototype.initEditingOptions = function initEditingOptions() {
        this.toggleResponseMode(true);
        const interaction = this.widget.element;
        const responseDeclaration = interaction.getResponseDeclaration();
        const mapEntries = responseDeclaration.getMapEntries();
        const [correctIndex] = this.correctResponses.keys();
        if (this.correctResponses.size > 0) {
            this.correctResponses.forEach((value, index) => {
                this.activeEditId = index;
                this.correctResponses.currentIndex(index);
                if (this.inGapMode() === true) {
                    if (!Object.keys(value).includes('input') && index !== correctIndex) {
                        this.addAlternativeInput(index);
                    } else {
                        const response = this.getGapResponseObject(value.response || '');
                        interaction.triggerPci('latexGapInput', [response, index]);
                    }
                } else {
                    if (!Object.keys(value).includes('input') && index !== correctIndex) {
                        this.addAlternativeInput(index);
                    } else {
                        interaction.triggerPci('latexInput', [value.response || '', index]);
                        const scoreInput = this.widget.$container.find('.math-entry-score-input.math-entry-response-correct');
                        if (scoreInput.length > 0 && index < 1) {
                            scoreInput[0].value = mapEntries && mapEntries[value.response || ''] || responseDeclaration.getMappingAttribute('defaultValue') || 0;
                        }
                    }
                }
            });
        }
        this.activeEditId = null;

    };

    // forming gap response object to be further processed by the latexGapInput event
    MathEntryInteractionStateResponse.prototype.getGapResponseObject = function getGapResponseObject(response) {
        return {
            base: {
                string: response.split(',')
            }
        };
    };

    // removing all saved map entries
    MathEntryInteractionStateResponse.prototype.clearMapEntries = function clearMapEntries() {
        const interaction = this.widget.element;
        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();

        _.keys(mapEntries).forEach(function (mapKey) {
            response.removeMapEntry(mapKey, true);
        });
    };

    MathEntryInteractionStateResponse.prototype.initDeletingOptions = function initDeletingOptions() {
        const interaction = this.widget.element;
        interaction.onPci('deleteInput', (inputId) => {
            if (this.correctResponses.has(inputId)) {
                if (this.inGapMode() === true) {
                    this.emptyGapFields();
                }
                this.activeEditId = null;
                this.correctResponses.delete(inputId);
            }
        });
    };


    /**
     *   remove all event listeners to avoid any potential memory leaks
     */
    MathEntryInteractionStateResponse.prototype.removeDeleteListeners = function removeDeleteListeners() {
        const $deleteButtons = this.widget.$container.find('.entry-config');
        $deleteButtons.find('.answer-delete').off('click');
    };

    MathEntryInteractionStateResponse.prototype.removeAddButtonListener = function removeAddButtonListener() {
        this.widget.$container.find('.math-entry-response-correct.btn-info').off('click');
    };

    MathEntryInteractionStateResponse.prototype.destroyForm = function destroyForm() {
        const $responseForm = this.widget.$responseForm;
        $responseForm.find('.mathEntryInteraction').remove();
    };

    MathEntryInteractionStateResponse.prototype.saveAnswers = function saveAnswers() {
        const interaction = this.widget.element;
        const responseDeclaration = interaction.getResponseDeclaration();

        this.clearMapEntries();

        let gapResponses = new Map();
        if (this.inGapMode() === true) {
            this.correctResponses.forEach((value, index) => {
                let response = ' ';
                if (value.response && value.response.split(',').indexOf('') === -1) {
                    response = value.response;
                }
                gapResponses.set(index, response);
            });
        }
        const score = new Map();
        if (this.correctResponses.size) {
            const scoreInput = this.widget.$container.find('.math-entry-score-input');
            $(scoreInput).each(input => {
                score.set(scoreInput[input].dataset.for, scoreInput[input].value);
            });
        }

        this.correctResponses.forEach((response, index) => {
            const scoreValue = score.get(index) || responseDeclaration.getMappingAttribute('defaultValue');
            responseDeclaration.setMapEntry(response.response || ' ', scoreValue, false);
            const [correctIndex] = this.correctResponses.keys();
            responseDeclaration.setCorrect(this.correctResponses.get(correctIndex).response || ' ');
        });
    };

    /**
     *   if in gap mode: will empty all the gap fields
     */
    MathEntryInteractionStateResponse.prototype.emptyGapFields = function emptyGapFields() {
        const interaction = this.widget.element;

        if (this.inGapMode() === true) {
            this.activeEditId = null;

            interaction.prop('gapExpression', this.gapTemplate);
        }
    };

    MathEntryInteractionStateResponse.prototype.toggleResponseMode = function toggleResponseMode(value) {
        const interaction = this.widget.element;

        if (interaction.prop('inResponseState') !== value) {
            interaction.prop('inResponseState', value);
            interaction.triggerPci('configChange', [interaction.getProperties()]);
        }
    };

    MathEntryInteractionStateResponse.prototype.inGapMode = function inGapMode() {
        const interaction = this.widget.element;
        const useGapExpression = interaction.prop('useGapExpression');
        return useGapExpression && useGapExpression !== 'false' || false;
    };

    MathEntryInteractionStateResponse.prototype.initAlternativeInput = function initAlternativeInput() {
        this.widget.$container.find('.math-entry-response-correct.btn-info').on('click', () => {
            this.addAlternativeInput(null);
        });
    };

    MathEntryInteractionStateResponse.prototype.addAlternativeInput = function addAlternativeInput(responseId) {
        const interaction = this.widget.element;
        const $container = this.widget.$container;
        const response = interaction.getResponseDeclaration();
        const mapEntries = response.getMapEntries();
        const [correctIndex] = this.correctResponses.keys();
        let responseValue = '';
        const id = responseId || this.uid();

        let gapValues = '';
        let scoreValue = '';
        if (this.inGapMode() === true) {
            if (this.correctResponses.has(responseId)) {
                gapValues = {
                    base: {
                        string: this.correctResponses.get(responseId).response
                    }
                } ;
            } else {
                const gapExpression = this.gapTemplate;
                const gapCount = (gapExpression.match(/\\taoGap/g) || []).length;
                if (gapCount > 0) {
                    gapValues = [];
                    for (let i = 0; i < gapCount; i++) {
                        gapValues.push(' ');
                    }
                    gapValues = {
                        base: {
                            string: gapValues.join(',')
                        }
                    };
                } else {
                    gapValues = {
                        base: {
                            string: gapValues
                        }
                    };
                }
            }
            responseValue = this.gapTemplate;
            this.correctResponses.set(id, { response: gapValues });
            scoreValue = !!responseId && Object.keys(mapEntries).length > 0 && mapEntries[this.correctResponses.get(responseId).response.base.string] || '';
        } else {
            let value = this.correctResponses.has(responseId) && this.correctResponses.get(responseId).response;
            if (!value) {
                value = this.correctResponses.get(correctIndex).response;
            }
            responseValue = value || '';
            this.correctResponses.set(id, { response: responseValue });
            scoreValue = !!responseId && Object.keys(mapEntries).length > 0 && mapEntries[this.correctResponses.get(responseId).response] || '';
        }
        $container.find('button.math-entry-response-correct', $container).before(alternativeFormTpl({
            index: id,
            placeholder: response.getMappingAttribute('defaultValue'),
            score: scoreValue
        }));
        // show tooltip
        tooltip.lookup($('.answer-delete', $container));

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
        interaction.triggerPci('addAlternative', [responseValue, gapValues, id]);
        this.initDeletingOptions();
    };

    return MathEntryInteractionStateResponse;
});
