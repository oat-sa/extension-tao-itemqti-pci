define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/states',
    'likertScaleInteraction/widget/states/Question',
    'likertScaleInteraction/widget/states/Sleep'
], function(factory, states){
    return factory.createBundle(states, arguments, ['answer', 'correct', 'map']);
});