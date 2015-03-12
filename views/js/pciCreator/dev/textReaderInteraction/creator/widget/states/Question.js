/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!textReaderInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function (stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $) {
    'use strict';
    var stateQuestion = stateFactory.extend(Question, function () {
        var that = this,
            $container = that.widget.$container,
            interaction = that.widget.element;

        containerEditor.create($container.find('.prompt'), {
            change : function (text) {
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });

        //create choise labels inline editors
        simpleEditor.create($container, '.js-choice-label', _.noop);

        //Enable page CKEditor on selected tab and disable on the rest tabs.
        $container.on('selectpage.' + interaction.typeIdentifier, function (event, index) {
            var editor,
                pageIndex;
            $container.find('.tr-page').each(function () {
                editor = $(this).find('.container-editor').data('editor');
                pageIndex = $(this).data('page-num');
                if (editor) {
                    editor.setReadOnly(pageIndex != index);
                }
            });
        });

        //Destroy page CKeditors when page rerenders
        $container.on('beforerenderpages.' + interaction.typeIdentifier, function () {
            containerEditor.destroy($container.find('.passage'));
        });

        //Init page CKeditors after render
        $container.on('createpager.' + interaction.typeIdentifier, function () {
            initEditors($container, interaction);
        });

        initEditors($container, interaction);

        /**
         * Function initializes the editors on the each page.
         * @param {jQuery DOM element} $container - interaction container
         * @param {object} interaction 
         * @returns {undefined}
         */
        function initEditors($container, interaction) {
            var $pages = $container.find('.tr-page');
            $pages.each(function () {
                var pageId = $(this).data('page-id'),
                    pageIndex = $(this).data('page-num');

                containerEditor.create($(this).find('.passage'), {
                    change : function (text) {
                        var pageData = _.find(interaction.properties.pages, function (page) {
                            return page.id == pageId;
                        });
                        if (pageData) {
                            pageData.content = text;
                        }
                    },
                    markup : $('[data-serial="' + interaction.serial + '"] .tr-content').html(),
                    markupSelector :  '#tr-tabs-' + pageIndex + ' .passage',
                    related : interaction
                });
            });
        }

    }, function () {
        var $container = this.widget.$container,
            interaction = this.widget.element,
            choices = [];

        $container.off('.' + interaction.typeIdentifier);

        simpleEditor.destroy($container);
        containerEditor.destroy($container.find('.passage, .prompt'));

        //save choice labels
        $container.find('.js-choice-label').each(function () {
            var val = $.trim($(this).text());
            choices.push(val);
        });
        interaction.prop('choices', choices);
    });

    stateQuestion.prototype.initForm = function () {
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        //render the form using the form template
        $form.html(formTpl(
            interaction.properties
        ));

        $('.js-choice-type-select').val(interaction.properties.choiceType);
        $('.js-page-height-select').val(interaction.properties.pageHeight);
        $('.js-tab-position').val(interaction.properties.tabsPosition);

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            choiceType : function (interaction, value) {
                interaction.properties.choiceType = value;
                interaction.widgetRenderer.renderChoices(interaction.properties);
            },
            tabsPosition : function (interaction, value) {
                interaction.properties.tabsPosition = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
            pageHeight : function (interaction, value) {
                interaction.properties.pageHeight = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
            buttonLabelsNext : function (interaction, value) {
                interaction.properties.buttonLabels.next = value;
            },
            buttonLabelsPrev : function (interaction, value) {
                interaction.properties.buttonLabels.prev = value;
            }
        });
    };

    return stateQuestion;
});
