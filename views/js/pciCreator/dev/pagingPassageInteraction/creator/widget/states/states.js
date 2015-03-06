/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'pagingPassageInteraction/creator/widget/states/Question',
    'pagingPassageInteraction/creator/widget/states/Answer',
    'pagingPassageInteraction/creator/widget/states/Correct'
], function (factory, states) {
    'use strict';
    return factory.createBundle(states, arguments, ['map']);
});