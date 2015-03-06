/*global define*/
define(
    [
        'IMSGlobal/jquery_2_1_1',
        'OAT/util/html',
        'pagingPassageInteraction/runtime/js/libs/sly.min',
        'pagingPassageInteraction/runtime/js/libs/handlebars',
    ],
    function ($, html, sly, Handlebars) {
        'use strict';

        Handlebars.registerHelper("inc", function (value) {
            return parseInt(value, 10) + 1;
        });

        var templates = {
            'choices' : Handlebars.compile(
                '<ol class="plain block-listing solid choice-area">\
                    {{#each choices}}\
                    <li class="qti-choice qti-simpleChoice">\
                        <div class="pseudo-label-box js-label-box">\
                            <label class="real-label">\
                                <input type="checkbox" name="" value="{{inc @index}}" disabled="disabled">\
                                <span class="icon-checkbox"></span>\
                            </label>\
                            <div class="label-box">\
                                <div class="label-content clear js-choice-label" data-choice-index="{{@index}}">\
                                    <div>{{this}}</div>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="mini-tlb" data-edit="question" data-for="" style="display: none;">\
                            <div class="rgt tlb-button js-remove-choice" data-choice-index="{{@index}}" title="Delete">\
                                <span class="icon-bin"></span>\
                            </div>\
                        </div>\
                    </li>\
                    {{/each}}\
                    <li class="add-option js-add-choice">\
                        <span class="icon-add"></span>\
                        Add choice\
                    </li>\
                </ol>'
            )
        };

        return {
            renderChoices : function (data) {
                this.$container.find('.js-choice-container').html(templates.choices(data));
            },
            setContainer: function ($container) {
                this.$container = $container;
            }
        };
    }
);