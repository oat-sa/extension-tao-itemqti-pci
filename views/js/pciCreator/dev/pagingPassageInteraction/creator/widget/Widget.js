/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'pagingPassageInteraction/creator/widget/states/states',
    'tpl!pagingPassageInteraction/creator/tpl/choices',
    'tpl!pagingPassageInteraction/creator/tpl/pages',
    'pagingPassageInteraction/runtime/js/renderer'
], function (Widget, states, choicesTpl, pagesTpl, renderer) {
    'use strict';
    
    var PagingPassageInteractionWidget = Widget.clone();

    PagingPassageInteractionWidget.initCreator = function () {
        this.registerStates(states);
        Widget.initCreator.call(this);
    };
    
    PagingPassageInteractionWidget.beforeStateInit(function (event, pci, state) {
        if (pci.typeIdentifier && pci.typeIdentifier === "pagingPassageInteraction") {
            if (!pci.widgetRenderer) {
                pci.widgetRenderer = new renderer({
                    templates : {
                        choices : choicesTpl,
                        pages : pagesTpl
                    },
                    serial : pci.serial,
                    $container : state.widget.$container
                });
            }
            pci.widgetRenderer.setState(state.name);
            pci.widgetRenderer.renderAll(pci.properties);
        }
    });
    
    return PagingPassageInteractionWidget;
});