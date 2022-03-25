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
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'tpl!mathEntryInteraction/creator/tpl/answerForm',
    'tpl!mathEntryInteraction/creator/tpl/addAnswerOption',
], function (
    hb,
    __,
    _,
    $,
    stateFactory,
    Map,
    formElement,
    answerFormTpl,
    addAnswerOptionBtn
) {
    'use strict';
    var CORRECT_ANSWER_VALUE = 1;
    hb.registerHelper('increaseIndex', function (value, options) {
        return parseInt(value) + 1;
    });

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
        var self = this,
            interaction = self.widget.element,
            $responseForm = self.widget.$responseForm;

        this.initResponseChangeEventListener();
        self.correctResponses = this.getExistingCorrectAnswerOptions();
        $responseForm.html(addAnswerOptionBtn());
        this.initAddAnswerButton();
        this.renderForm(self.correctResponses);
    }

    MathEntryInteractionStateResponse.prototype.initAddAnswerButton = function initAddAnswerButton() {
        var self = this,
            interaction = self.widget.element,
            $responseForm = self.widget.$responseForm,
            $addAnswerBtn = $responseForm.find($('.add-answer-option'));

        $addAnswerBtn.on('click', function () {
            var newCorrectAnswer;

            if (self.inGapMode() === true) {
                self.emptyGapFields();
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
                self.toggleResponseMode(false);
            }

            self.correctResponses.push(newCorrectAnswer);
            self.renderForm(self.correctResponses);
        });
    }

    MathEntryInteractionStateResponse.prototype.getExistingCorrectAnswerOptions = function getExistingCorrectAnswerOptions() {
        var self = this,
            interaction = self.widget.element;

        var mapEntries = interaction.getResponseDeclaration().getMapEntries();
        return _.keys(mapEntries) || [];
    }

    MathEntryInteractionStateResponse.prototype.initResponseChangeEventListener = function initResponseChangeEventListener() {
        var self = this,
            interaction = self.widget.element;

        interaction.onPci('responseChange', function (latex) {
            if (self.inGapMode(self) === false && self.activeEditId !== null) {
                self.correctResponses[self.activeEditId] = latex;
            } else if (self.inGapMode(self) === true && self.activeEditId !== null) {
                var response = interaction.getResponse();
                if (response !== null) {
                    self.correctResponses[self.activeEditId] = response.base.string;
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
        var self = this,
            interaction = self.widget.element,
            $responseForm = self.widget.$responseForm,
            $entryConfig = $responseForm.find('.entry-config'),
            $editButtons = $entryConfig.find('.answer-edit');

        $editButtons.click(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            self.toggleResponseMode(true);
            var selectedEditId = parseInt($(e.target).closest('div').attr('data-index'));

            if (self.activeEditId !== selectedEditId) {

                if (self.inGapMode() === true) {
                    self.activeEditId = selectedEditId;
                    var response = self.getGapResponseObject(self.correctResponses[self.activeEditId]);
                    interaction.triggerPci('latexGapInput', [response]);
                } else {
                    self.activeEditId = selectedEditId;
                    interaction.triggerPci('latexInput', [self.correctResponses[self.activeEditId]]);
                }
            } else {
                self.emptyGapFields();
            }
        });
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
        var self = this,
            $responseForm = self.widget.$responseForm;

        this.removeEditDeleteListeners();
        $responseForm.find('.mathEntryInteraction').remove();
        $responseForm.append(answerFormTpl({correctAnswerEntries: correctAnswerOptions}));
        this.initDeletingOptions();
        this.initEditingOptions();
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
        var self = this,
            $responseForm = self.widget.$responseForm;

        $responseForm.find($('.add-answer-option')).off('click');
    }

    MathEntryInteractionStateResponse.prototype.destroyForm = function destroyForm() {
        var self = this,
            $responseForm = self.widget.$responseForm;

        $responseForm.find('.mathEntryInteraction').remove();
    }

    MathEntryInteractionStateResponse.prototype.saveAnswers = function saveAnswers() {
        var self = this,
            interaction = self.widget.element,
            responseDeclaration = interaction.getResponseDeclaration();

        this.clearMapEntries();

        if (this.inGapMode() === true) {
            self.correctResponses = self.correctResponses.filter(function (response) {
                return response.split(',').indexOf('') === -1;
            });
        }

        self.correctResponses.forEach(function (response) {
            responseDeclaration.setMapEntry(response, CORRECT_ANSWER_VALUE, false);
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
        var self = this,
            interaction = self.widget.element;

        return interaction.prop('useGapExpression');
    }

    return MathEntryInteractionStateResponse;
});
