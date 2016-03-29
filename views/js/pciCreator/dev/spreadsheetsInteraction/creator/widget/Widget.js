define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'spreadsheetsInteraction/creator/widget/states/states'
], function (Widget, states) {
    "use strict";

    var SpreadsheetsInteractionWidget = Widget.clone();

    SpreadsheetsInteractionWidget.initCreator = function initCreator() {

        this.registerStates(states);

        Widget.initCreator.call(this);

    };

    return SpreadsheetsInteractionWidget;
});
