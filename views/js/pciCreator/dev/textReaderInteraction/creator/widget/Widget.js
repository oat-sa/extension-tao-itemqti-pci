/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'textReaderInteraction/creator/widget/states/states',
    'css!textReaderInteraction/runtime/css/textReaderInteraction'
], function (Widget, states) {
    'use strict';

    var TextReaderInteractionWidget = Widget.clone();

    TextReaderInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);
    };

    return TextReaderInteractionWidget;
});