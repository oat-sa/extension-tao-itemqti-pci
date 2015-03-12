/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'textReaderInteraction/creator/widget/states/Question',
    'textReaderInteraction/creator/widget/states/Answer',
    'textReaderInteraction/creator/widget/states/Correct'
], function (factory, states) {
    'use strict';
    return factory.createBundle(states, arguments, ['map']);
});