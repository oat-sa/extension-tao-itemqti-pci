/**
 * Copyright (c) 2016 (original work) Open Assessment Technologies;
 */
define([
    'jquery',
    'lodash',
    'util/adaptSize',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'taoQtiItem/qtiCommonRenderer/helpers/PortableElement'
], function ($, _, sizeAdapter, containerEditor, PortableElement) {
    'use strict';

    return function spreadsheetsRenderer(options) {

        var renderer,
            animationDuration = 400,
            defaultOptions = {},
            markup,
            $navigationButtons,
            $fakeButtons,
            markupTpl;

        function initEditors() {
            renderer.initEditors();
        }

        renderer = {
            options: {},
            templateData: {
                prompt: 'lorem impsum',
                choiceLayout: 'horizontal',
                template: markup,

            },
            eventNs: 'spreadsheetsInteraction',
            init: function init() {
                var self = this,
                    $markup,
                    $choices;

                _.assign(this.options, defaultOptions, options);
                markupTpl = self.options.markup;
                $markup = $(self.options.interaction.markup);

            }
        };

        return renderer;
    }
});
