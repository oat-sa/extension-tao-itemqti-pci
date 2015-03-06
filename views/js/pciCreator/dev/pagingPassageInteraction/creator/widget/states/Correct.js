/*global define, $*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/states/Correct',
    'lodash'
], function (stateFactory, Correct, _) {
    'use strict';
    var stateCorrect = stateFactory.create(Correct, function () {
        var widget = this.widget,
            interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration(),
            correct = _.values(responseDeclaration.getCorrect());

        $('.js-label-box input[type="checkbox"], .js-label-box input[type="radio"]').prop('checked', false);

        $.each(correct, function (key, val) {
            $('.js-label-box input[value="' + val + '"]').prop('checked', true);
        });

        $('.js-label-box input[type="checkbox"], .js-label-box input[type="radio"]').removeAttr('disabled');
    }, function () {
        var widget = this.widget,
            interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration(),
            $controls = $('.js-label-box input[type="checkbox"], .js-label-box input[type="radio"]'),
            correct = [];


        $controls.each(function () {
            if ($(this).is(':checked')) {
                correct.push($(this).val());
            }
        });
        responseDeclaration.setCorrect(correct);
        $controls.attr('disabled', 'disabled');
    });

    return stateCorrect;
});
