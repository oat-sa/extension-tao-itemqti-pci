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
        this.correctResponses = new Map();
        this.uidCounter = 0;

        if (this.inGapMode() === true) {
            interaction = this.widget.element;
            this.gapTemplate = interaction.prop('gapExpression');
        }
    };

    MathEntryInteractionStateResponse.prototype.uid = function uid() {
        return `answer-${this.uidCounter++}`;
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
        if (this.correctResponses.size > 0) {
            return false;
        }
        const interaction = this.widget.element;

        let newCorrectAnswer;

        // get first id
        const $input = this.widget.$container.find('.math-entry-input');
        const $score = this.widget.$container.find('.math-entry-response-wrap .math-entry-score-input');
        let id = $input.data('index') || null;
        if (!id) {
            id = this.uid();
            $input[0].dataset.index = id;
        } else {
            this.uidCounter = id.split('-')[1];
            this.uidCounter++;
        }
        $score[0].dataset.for = id;

        let existingReponses = this.getExistingCorrectAnswerOptions();
        if (existingReponses.length) {
            const response = interaction.getResponseDeclaration();
            const mapEntries = response.getMapEntries();
            existingReponses.forEach((entry, index) => {
                let newId =  id;
                if (index > 0) {
                    newId = this.uid();
                }
                this.correctResponses.set(newId, entry);
                if (mapEntries[entry]) {
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
            this.correctResponses.set(id, newCorrectAnswer);
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
                mathEntryScoreInput: function (rsp, value) {
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
                if (this.inGapMode(this) === false && editIdIndex !== null) {
                    this.correctResponses.set(editIdIndex, latex);
                } else if (this.inGapMode(this) === true && editIdIndex !== null) {
                    const response = interaction.getResponse();
                    if (response !== null && response.base.string.length > 0) {
                        this.correctResponses.set(editIdIndex, response.base.string);
                    } else {
                        if (!!editIdIndex) {
                            const newResponse = this.getGapResponseObject(latex);
                            this.correctResponses.set(editIdIndex, newResponse.base.string[0]);
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
        const $container = this.widget.$container;
        const responseDeclaration = interaction.getResponseDeclaration();
        const mapEntries = responseDeclaration.getMapEntries();
        const [correctIndex] = this.correctResponses.keys();
        const inputs = $container.find('.math-entry-input');
        if (this.correctResponses.size > 0) {
            this.correctResponses.forEach((value, index) => {
                this.activeEditId = index;
                if (this.inGapMode() === true) {
                    if (this.correctResponses.size > inputs.length && index !== correctIndex) {
                        this.addAlternativeInput(index);
                    } else {
                        const response = this.getGapResponseObject(value);
                        interaction.triggerPci('latexGapInput', [response, index]);
                    }
                } else {
                    if (this.correctResponses.size > inputs.length && index !== correctIndex) {
                        this.addAlternativeInput(index);
                    } else {
                        interaction.triggerPci('latexInput', [this.correctResponses.get(index), index]);
                        const scoreInput = this.widget.$container.find('.math-entry-score-input.math-entry-response-correct');
                        if (scoreInput.length > 0 && index < 1) {
                            scoreInput[0].value = mapEntries && mapEntries[value] || responseDeclaration.getMappingAttribute('defaultValue') || 0;
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
                if (value.split(',').indexOf('') === -1) {
                    gapResponses.set(index, value);
                }
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
            responseDeclaration.setMapEntry(response, scoreValue, false);
            const [correctIndex] = this.correctResponses.keys();
            responseDeclaration.setCorrect(this.correctResponses.get(correctIndex));
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

        let responseValue = '';
        let gapValues = this.correctResponses.get(responseId) ? this.getGapResponseObject(this.correctResponses.get(responseId)) : null;
        if (this.inGapMode() === true) {
            responseValue = this.gapTemplate;
        } else {
            let value = this.correctResponses.get(responseId);
            if (!value) {
                const [correctIndex] = this.correctResponses.keys();
                value = this.correctResponses.get(correctIndex);
            }
            responseValue = value || null;
        }
        const id = responseId || this.uid();
        $container.find('button.math-entry-response-correct', $container).before(alternativeFormTpl({
            index: id,
            placeholder: response.getMappingAttribute('defaultValue'),
            score: !!responseId && Object.keys(mapEntries).length > 0 && mapEntries[this.correctResponses.get(responseId)] || response.getMappingAttribute('defaultValue')
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
        interaction.triggerPci('addAlternative', [responseValue, gapValues, responseId]);
        this.initDeletingOptions();
    };

    return MathEntryInteractionStateResponse;
});
