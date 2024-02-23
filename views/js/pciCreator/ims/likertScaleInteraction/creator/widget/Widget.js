define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'likertScaleInteraction/creator/widget/states/states',
], function (Widget, states) {
    'use strict';

    const interactionWidget = Widget.clone();

    interactionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);
    };

    return interactionWidget;
});
