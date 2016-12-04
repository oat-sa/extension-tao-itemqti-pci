define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/states/states',
    'spreadsheetsInteraction/creator/widget/states/Question'
    // 'spreadsheetsInteraction/creator/widget/states/Answer',
    // 'spreadsheetsInteraction/creator/widget/states/Correct'
], function (factory, states) {
    "use strict";

    return factory.createBundle(states, arguments, ['map']);
});
