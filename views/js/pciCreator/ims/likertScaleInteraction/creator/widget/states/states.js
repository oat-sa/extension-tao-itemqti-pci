define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'likertScaleInteraction/creator/widget/states/Question'
], function (factory, states, QuestionState) {
    'use strict';
    return factory.createBundle(states, [QuestionState], ['answer', 'correct', 'map']);
});
