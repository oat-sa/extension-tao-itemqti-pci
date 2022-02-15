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

    var InteractionStateMap = stateFactory.create(
        Map,
        function init() {
            this.activeEditId = null;
            this.correctResponses = [];
            initForm(this);
        },
        function exit() {
            saveAnswers(this);
            removeResponseChangeEventListener(this);
            clearMathFieldLatex(this);
            removeEditDeleteListeners(this);
            removeAddButtonListener(this);
            emptyGapFields(this);
            destroyForm(this);
        }
    );

    function initForm(self) {
        var interaction = self.widget.element,
            responseDeclaration = interaction.getResponseDeclaration(),
            $responseForm = self.widget.$responseForm;

        interaction.prop('inResponseState', true);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
        initResponseChangeEventListener(self);
        self.correctResponses = getExistingCorrectAnswerOptions(self);
        $responseForm.html(addAnswerOptionBtn());
        initAddAnswerButton(self);
        renderForm(self, self.correctResponses);
    }

    function initAddAnswerButton(self) {
        var interaction = self.widget.element,
            $responseForm = self.widget.$responseForm,
            $addAnswerBtn = $responseForm.find($('.add-answer-option'));

        $addAnswerBtn.on('click', function () {
            var newCorrectAnswer;

            if (inGapMode(self)) {
                var gapExpression = self.widget.element.prop('gapExpression');
                var gapCount = (gapExpression.match(/\\taoGap/g) || []).length;
                if (gapCount > 0) {
                    newCorrectAnswer = [];
                    for (var i = 0; i < gapCount; i++) {
                        newCorrectAnswer.push('');
                    }
                } else {
                    newCorrectAnswer = '';
                }
            } else {
                newCorrectAnswer = '';
            }

            self.correctResponses.push(newCorrectAnswer);
            renderForm(self, self.correctResponses);
        });
    }

    function getExistingCorrectAnswerOptions(self) {
        var mapEntries = self.widget.element.getResponseDeclaration().getMapEntries();
        return _.keys(mapEntries) || [];
    }

    function initResponseChangeEventListener(self) {
        var interaction = self.widget.element;
        self.widget.element.onPci('responseChange', function (latex) {
            if (!inGapMode(self) && self.activeEditId != null) {
                self.correctResponses[self.activeEditId] = latex;
            } else if (inGapMode(self) && self.activeEditId != null) {
                var response = interaction.getResponse();
                self.correctResponses[self.activeEditId] = response.base.string;
            }
        });
    }

    function removeResponseChangeEventListener(self) {
        self.widget.element.offPci('responseChange');
    }

    function clearMathFieldLatex(self) {
        var interaction = self.widget.element;
        if (!inGapMode(self)) {
            interaction.triggerPci('latexInput', ['']);
        }
    }

    function initEditingOptions(self) {
        var interaction = self.widget.element,
            $responseForm = self.widget.$responseForm,
            $entryConfig = $responseForm.find('.entry-config'),
            $editButtons = $entryConfig.find('.answer-edit');
        
        if (inGapMode(self)) {
            $editButtons.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self.activeEditId = parseInt(e.currentTarget.id.split('_')[1]);
                var response = getGapResponseObject(self.correctResponses[self.activeEditId]);
                interaction.triggerPci('latexGapInput', [response]);
            });
        } else {
            $editButtons.click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                self.activeEditId = parseInt(e.currentTarget.id.split('_')[1]);
                interaction.triggerPci('latexInput', [self.correctResponses[self.activeEditId]]);
            });
        }
    }

    // forming gap response object to be further processed by the latexGapInput event
    function getGapResponseObject(response) {
        return {
            list: {
                string: response.split(',')
            }
        }
    }

    // removing all saved map entries
    function clearMapEntries(self) {
        var interaction = self.widget.element;
        var response = interaction.getResponseDeclaration();
        var mapEntries = response.getMapEntries();
        _.keys(mapEntries).forEach(function (mapKey) {
            response.removeMapEntry(mapKey, true);
        });
    }

    function initDeletingOptions(self) {
        var interaction = self.widget.element;
        var $responseForm = self.widget.$responseForm;
        var $entryConfig = $responseForm.find('.entry-config');
        var $deleteButtons = $entryConfig.find('.answer-delete');

        $deleteButtons.click(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var id = parseInt(e.currentTarget.id.split('_')[1]);

            if (inGapMode(self)) {
                var gapExpression = interaction.prop('gapExpression');
                var gapResponses = self.correctResponses[id].split(',');
                gapResponses.forEach(function (response) {
                    gapExpression = gapExpression.replace(response, '\\taoGap');
                });

                interaction.prop('gapExpression', gapExpression);
                interaction.triggerPci('configChange', [interaction.getProperties()]);

            }
            // setting active editing id to null in order to
            // prevent the editing of the next answer option that could take its place
            self.activeEditId = null;

            self.correctResponses.splice(id, 1);
            renderForm(self, self.correctResponses);
        });
    }

    function renderForm(self, correctAnswerOptions) {
        removeEditDeleteListeners(self);
        var $responseForm = self.widget.$responseForm;
        $responseForm.find('.mathEntryInteraction').remove();
        $responseForm.append(answerFormTpl({correctAnswerEntries: correctAnswerOptions}));
        initDeletingOptions(self);
        initEditingOptions(self);
    }

    /**
     *   remove all event listeners to avoid any potential memory leaks
     */
    function removeEditDeleteListeners(self) {
        var $entryConfig = self.widget.$responseForm.find('.entry-config');
        $entryConfig.find('.answer-edit').off('click');
        $entryConfig.find('.answer-delete').off('click');
    }

    function removeAddButtonListener(self) {
        var $responseForm = self.widget.$responseForm;
        $responseForm.find($('.add-answer-option')).off('click');
    }

    function destroyForm(self) {
        self.widget.$responseForm.find('.mathEntryInteraction').remove();
    }

    function saveAnswers(self) {
        var interaction = self.widget.element;
        var responseDeclaration = interaction.getResponseDeclaration();
        clearMapEntries(self);
        self.correctResponses.forEach(function (response) {
            responseDeclaration.setMapEntry(response, CORRECT_ANSWER_VALUE, false);
        });
    }

    // empty all gap fields and change state property
    function emptyGapFields(self) {
        var interaction = self.widget.element;
        if (inGapMode(self)){
            var gapTemplateString = interaction.prop('gapExpression');

            if (self.activeEditId != null) {
                var responses = self.correctResponses[self.activeEditId].split(',');
                responses.forEach(function (responseGap) {
                    gapTemplateString = gapTemplateString.replace(responseGap.toString(), '\\taoGap');
                });
                interaction.prop('gapExpression', gapTemplateString);
            }

            interaction.prop('inResponseState', false);
            interaction.triggerPci('configChange', [interaction.getProperties()]);
        }
    }

    function inGapMode(self) {
        return !!(self.widget.element.prop('useGapExpression'));
    }

    return InteractionStateMap;
});
