/*global define*/
define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!pagingPassageInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function (stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $) {
    'use strict';
    var stateQuestion = stateFactory.extend(Question, function () {
        var that = this,
            $container = this.widget.$container,
            interaction = this.widget.element;
        
        containerEditor.create($container.find('.prompt'), {
            change : function (text) {
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });
        
        simpleEditor.create($container, '.js-choice-label', function () {
        });
        
        $container.on('selectpage.' + interaction.typeIdentifier, function (event, data) {
            var editor = $(data.ui.panel).find('.container-editor').data('editor');
            if (editor) {
                editor.setReadOnly(false);
            }
        });
        
        $container.on('beforerenderpages.' + interaction.typeIdentifier, function () {
            containerEditor.destroy($container.find('.passage'));
        });
        
        $container.on('createpager.' + interaction.typeIdentifier, function () {
            initEditors($container, interaction);
        });
        
        initEditors($container, interaction);
        
        /**
         * Function initialize editors on page
         * @param {jQuery DOM element} $container
         * @param {object} interaction 
         * @returns {undefined}
         */
        function initEditors ($container, interaction) {
            var $pages = $container.find('.ui-tabs-panel');
            if ($pages.length) {
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
                        markup : $('[data-serial="' + interaction.serial + '"] .pp-content').html(),
                        markupSelector :  '#pp-tabs-' + (pageIndex) + ' .passage',
                        related : interaction
                    });
                });
            }
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
        $form.html(formTpl({
            
        }));
        
        $('.js-choice-type-select').val(interaction.properties.choiceType);
        
        //init form javascript
        formElement.initWidget($form);
        
        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            choiceType : function (interaction, value) {
                //update the pci property value:
                interaction.properties.choiceType = value;
                interaction.widgetRenderer.renderChoices(interaction.properties);
            },
            tabsPosition : function (interaction, value) {
                //update the pci property value:
                interaction.properties.tabsPosition = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
            pageHeight : function (interaction, value) {
                //update the pci property value:
                interaction.properties.pageHeight = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
        });
    };

    return stateQuestion;
});
