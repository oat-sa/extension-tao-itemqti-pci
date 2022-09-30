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
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
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
    formElement
) {
    'use strict';
    hb.registerHelper('increaseIndex', function (value, options) {
        return parseInt(value) + 1;
    });
    var $addAlternativeBtn = $(addAlternativeBtn());
    var MathEntryInteractionStateResponse = stateFactory.create(
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
            this.removeEditDeleteListeners();
            this.removeAddButtonListener();
            this.destroyForm();
        }
    );


    MathEntryInteractionStateResponse.prototype.initGlobalVariables = function initGlobalVariables() {
        var self = this,
            interaction = self.widget.element;
        self.activeEditId = null;
        self.correctResponses = [];

        if (this.inGapMode(self) === true) {
            interaction = self.widget.element;
            self.gapTemplate = interaction.prop('gapExpression');
        }
    }

    MathEntryInteractionStateResponse.prototype.initForm = function initForm() {
        var interaction = this.widget.element;
        var $responseForm = this.widget.$responseForm;

        var response = interaction.getResponseDeclaration();
        var mapEntries = response.getMapEntries();
        var mappingDisabled = _.isEmpty(mapEntries);
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
                helpMessage: __('Minimal  score for this interaction.')
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
    }

    MathEntryInteractionStateResponse.prototype.initResponseForm = function initResponseForm() {
        var interaction = this.widget.element;

        var newCorrectAnswer;

        if (this.inGapMode() === true) {
            this.emptyGapFields();
            var gapExpression = interaction.prop('gapExpression');
            var gapCount = (gapExpression.match(/\\taoGap/g) || []).length;
            if (gapCount > 0) {
                newCorrectAnswer = [];
                for (var i = 0; i < gapCount; i++) {
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

        this.correctResponses.push(newCorrectAnswer);
        this.renderForm(self.correctResponses);
    }

    MathEntryInteractionStateResponse.prototype.createScoreResponse = function createScoreResponse() {
        var $container = this.widget.$container;
        var $input = $container.find('.math-entry-input');

        if ($($input[0]).siblings('.math-entry-response-correct').length > 0) {
            return false
        }

        var $interaction = this.widget.element;
        var response = $interaction.getResponseDeclaration();
        this.$responseCorrectTitle = $('<span>', {
            'class': 'math-entry-response-title math-entry-response-correct'
        }).html('Correct');
        $input[0].parentNode.prepend(this.$responseCorrectTitle[0]);
        this.$correctDiv = $input[0].parentNode.className = 'math-entry-correct-wrap';
        this.$scoreDiv = $('<div>', {
            'class': 'math-entry-score-wrap math-entry-response-correct'
        });
        $input[0].parentNode.parentNode.insertBefore(this.$scoreDiv[0], $input.nextSibling);
        this.$scoreDiv.after($addAlternativeBtn);
        $('.math-entry-correct-wrap, .math-entry-score-wrap').wrapAll('<div class="math-entry-response-wrap"></div>');
        var pairId = $interaction.attr('responseIdentifier');
    
        this.$responseCorrectScore = $('<span>', {
            'class': 'math-entry-score-title math-entry-response-correct'
        }).html('Score');
        this.$scoreDiv.append(scoreTpl({
            serial: response.serial,
            mathIdentifier: pairId,
            placeholder: response.getMappingAttribute('defaultValue')
        }));
        this.$scoreDiv.prepend(this.$responseCorrectScore);

        //add placeholder text to show the default value
        var $scores = $container.find('.math-entry-response-wrap .math-entry-score-input');
        $scores.on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        this.widget.on('mappingAttributeChange', function (data) {
            if (data.key === 'defaultValue') {
                $scores.attr('placeholder', data.value);
            }
        });

        //init form javascript
        formElement.initWidget($container);
        formElement.setChangeCallbacks($container, response,
            _.assign({
                mathEntryScoreInput: function (response, value) {
                    var key = $(this.widget).data('for');
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
        var self = this,
            interaction = self.widget.element;

        var mapEntries = interaction.getResponseDeclaration().getMapEntries();
        return _.keys(mapEntries) || [];
    }

    MathEntryInteractionStateResponse.prototype.initResponseChangeEventListener = function initResponseChangeEventListener() {
        var interaction = this.widget.element;

        interaction.onPci('responseChange', (latex, index) => {
            const editIdIndex = index ? index : this.activeEditId
            if (this.inGapMode(this) === false && editIdIndex !== null) {
                this.correctResponses[editIdIndex] = latex;
            } else if (this.inGapMode(this) === true && editIdIndex !== null) {
                var response = interaction.getResponse();
                if (response !== null) {
                    this.correctResponses[editIdIndex] = response.base.string;
                }
            }
        });
    }

    MathEntryInteractionStateResponse.prototype.removeResponseChangeEventListener = function removeResponseChangeEventListener() {
        var self = this,
            interaction = self.widget.element;

        interaction.offPci('responseChange');
    }

    MathEntryInteractionStateResponse.prototype.initEditingOptions = function initEditingOptions() {
        this.toggleResponseMode(true);
        var interaction = this.widget.element;
        var response = interaction.getResponseDeclaration();
        var selectedEditId = 0;

        if (this.inGapMode() === true) {
            this.activeEditId = selectedEditId;
            var response = this.getGapResponseObject(this.correctResponses[this.activeEditId]);
            interaction.triggerPci('latexGapInput', [response]);
        } else {
            this.activeEditId = selectedEditId;
            interaction.triggerPci('latexInput', [this.correctResponses[this.activeEditId]]);
        }
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
        var self = this,
            interaction = self.widget.element,
            response = interaction.getResponseDeclaration(),
            mapEntries = response.getMapEntries();

        _.keys(mapEntries).forEach(function (mapKey) {
            response.removeMapEntry(mapKey, true);
        });
    }

    MathEntryInteractionStateResponse.prototype.initDeletingOptions = function initDeletingOptions() {
        var self = this,
            interaction = self.widget.element,
            $responseForm = self.widget.$responseForm,
            $entryConfig = $responseForm.find('.entry-config'),
            $deleteButtons = $entryConfig.find('.answer-delete');

        $deleteButtons.click(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = parseInt($(e.target).closest('div').attr('data-index'));

            if (self.inGapMode() === true) {
                self.activeEditId = id;
                self.emptyGapFields();
            } else {
                self.activeEditId = null;
                self.toggleResponseMode(false);
            }

            self.correctResponses.splice(id, 1);
            self.renderForm(self.correctResponses);
        });
    }

    MathEntryInteractionStateResponse.prototype.renderForm = function renderForm(correctAnswerOptions) {

        this.removeEditDeleteListeners();
        this.initDeletingOptions();
        this.initEditingOptions();
        this.initAlternativeInput();
    }

    /**
     *   remove all event listeners to avoid any potential memory leaks
     */
    MathEntryInteractionStateResponse.prototype.removeEditDeleteListeners = function removeEditDeleteListeners() {
        var self = this,
            $entryConfig = self.widget.$responseForm.find('.entry-config');

        $entryConfig.find('.answer-edit').off('click');
        $entryConfig.find('.answer-delete').off('click');
    }

    MathEntryInteractionStateResponse.prototype.removeAddButtonListener = function removeAddButtonListener() {
        $addAlternativeBtn.off('click');
    }

    MathEntryInteractionStateResponse.prototype.destroyForm = function destroyForm() {
        var self = this,
            $responseForm = self.widget.$responseForm;

        $responseForm.find('.mathEntryInteraction').remove();
    }

    MathEntryInteractionStateResponse.prototype.saveAnswers = function saveAnswers() {
        var interaction = this.widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();

        this.clearMapEntries();

        if (this.inGapMode() === true) {
            this.correctResponses = this.correctResponses.filter(function (response) {
                return response.split(',').indexOf('') === -1;
            });
        }
        this.correctResponses.forEach(response => {
            responseDeclaration.setMapEntry(response, responseDeclaration.getMappingAttribute('defaultValue'), false);
            responseDeclaration.setCorrect(this.correctResponses[0]);
        });
    }

    /**
     *   if in gap mode: will empty all the gap fields
     */
    MathEntryInteractionStateResponse.prototype.emptyGapFields = function emptyGapFields() {
        var self = this,
            interaction = self.widget.element;

        if (this.inGapMode() === true) {
            self.activeEditId = null;

            interaction.prop('gapExpression', self.gapTemplate);
            this.toggleResponseMode(false);
        }
    }

    MathEntryInteractionStateResponse.prototype.toggleResponseMode = function toggleResponseMode(value) {
        var self = this,
            interaction = self.widget.element;

        if (interaction.prop('inResponseState') !== value) {
            interaction.prop('inResponseState', value);
            interaction.triggerPci('configChange', [interaction.getProperties()]);
        }
    }

    MathEntryInteractionStateResponse.prototype.inGapMode = function inGapMode() {
        var interaction = this.widget.element;
        var useGapExpression = interaction.prop('useGapExpression');
        return useGapExpression && useGapExpression !== 'false' || false;
    }

    MathEntryInteractionStateResponse.prototype.initAlternativeInput = function initAlternativeInput() {
        var $interaction = this.widget.element;
        var response = $interaction.getResponseDeclaration();
        var pairId = $interaction.attr('responseIdentifier');
        var selectedEditId = 0;

        $addAlternativeBtn.on('click', () => {
            var $responseBtn = $('button.math-entry-response-correct');
            $responseBtn.before(alternativeFormTpl({
                mathIdentifier: pairId,
                index: this.correctResponses.length,
                placeholder: response.getMappingAttribute('defaultValue')
            }));

            //add placeholder text to show the default value
            var $scores = this.widget.$container.find('.math-entry-score-input');
            $scores.on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
            });
            this.widget.on('mappingAttributeChange', function (data) {
                if (data.key === 'defaultValue') {
                    $scores.attr('placeholder', data.value);
                }
            });
            $interaction.triggerPci('addAlternative', [this.correctResponses[selectedEditId]]);
        });
    }

    return MathEntryInteractionStateResponse;
});
