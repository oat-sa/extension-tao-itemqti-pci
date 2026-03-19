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
 * Foundation, Inc., 31 Milk Street, # 960789, Boston, MA 02196, USA.
 *
 * Copyright (c) 2026 (original work) Open Assessment Technologies SA;
 */
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Answer',
    'taoQtiItem/qtiCreator/widgets/interactions/helpers/answerState'
], function (stateFactory, Answer, answerStateHelper) {
    'use strict';

    var AudioRecordingInteractionStateAnswer = stateFactory.extend(Answer, function initAnswerState() {}, function exitAnswerState() {});

    AudioRecordingInteractionStateAnswer.prototype.initResponseForm = function initResponseForm() {
        answerStateHelper.initResponseForm(this.widget, { rpTemplates: ['CUSTOM', 'NONE'] });
    };

    return AudioRecordingInteractionStateAnswer;
});
