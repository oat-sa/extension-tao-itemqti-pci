define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/states',
    'taoQtiItem/qtiLikertScaleCreator/widget/states/Question',
    'taoQtiItem/qtiLikertScaleCreator/widget/states/Sleep'
], function(factory, states){
    return factory.createBundle(states, arguments, ['answer', 'correct', 'map']);
});