/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'pagingPassageInteraction/creator/widget/states/states'
], function (Widget, states) {
    'use strict';
    var PagingPassageInteractionWidget = Widget.clone();

    PagingPassageInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);
    };

    return PagingPassageInteractionWidget;
});