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
            responseDeclaration = interaction.getResponseDeclaration();
            
    }, function () {
        var widget = this.widget,
            interaction = widget.element,
            responseDeclaration = interaction.getResponseDeclaration();
    });

    return stateCorrect;
});
