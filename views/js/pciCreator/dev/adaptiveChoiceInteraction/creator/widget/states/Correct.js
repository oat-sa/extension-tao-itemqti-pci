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
 * Copyright (c) 2015 (original work) Open Assessment Technologies;
 *               
 */
define([
    'lodash',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct'
], function (_, $, stateFactory, Correct) {
    'use strict';
    var stateCorrect = stateFactory.create(Correct, function () {
        var widget = this.widget,
            interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration(),
            correct = _.values(responseDeclaration.getCorrect());

        if (correct && correct.length) {
            _.forEach(correct, function(val) {
                widget.$container.find('.js-answer-input[value="' + val + '"]').prop('checked', true);
            });
        }

        widget.$container.on('change.' + interaction.typeIdentifier, '.js-answer-input', function () {
            correct = [];
            widget.$container.find('.js-answer-input:checked').each(function () {
                correct.push(parseInt($(this).val(), 10));
            });
            responseDeclaration.resetCorrect().setCorrect(correct);

            _.forEach(interaction.properties.choices, function (choice, n) {
                if (_.indexOf(correct, n) >= 0) {
                    choice.correct = true;
                } else {
                    delete choice.correct;
                }
            });
        });
    }, function () {
        var widget = this.widget,
            interaction = widget.element;

        interaction.resetResponse();
        interaction.offPci('.question');
    });

    return stateCorrect;
});
