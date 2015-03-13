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
            interaction = that.widget.element,
            properties = interaction.properties,
            pageIds = _.pluck(properties.pages, 'id'),
            maxPageId = Math.max.apply(null, pageIds);;
            
        //add page event
        $container.on('click.' + interaction.typeIdentifier, '[class*="js-add-page"]', function () {
            var num = properties.pages.length + 1,
                $button = $(this),
                pageData = {
                    label : 'Page ' + num,
                    content : ['page ' + num + ' content'],
                    id : ++maxPageId
                };

            if ($button.hasClass('js-add-page-before')) {
                properties.pages.unshift(pageData);
            } else if ($button.hasClass('js-add-page-after')) {
                properties.pages.push(pageData);
            }
            interaction.widgetRenderer.renderPages(properties);
        });

        //remove page event
        $container.on('click.' + interaction.typeIdentifier, '.js-remove-page', function () {
            var $tab = $(this).closest('li'),
                tabNum = $tab.data('page-num');
            properties.pages.splice(tabNum, 1);
            interaction.widgetRenderer.renderPages(properties);
        });    
        
        //change page layout
        $container.on('change.' + interaction.typeIdentifier, '.js-page-columns-select', function () {
            var numberOfColumns = parseInt($(this).val(), 10),
                currentPageIndex = interaction.widgetRenderer.tabsManager.index(),
                currentCols = interaction.properties.pages[currentPageIndex].content,
                newCols = [];

            for (var colNum = 0; colNum < numberOfColumns; colNum++) {
                if (currentCols[colNum]) {
                    newCols.push(currentCols[colNum]);
                } else {
                    newCols.push('');
                }
            }
            for (var colNum = currentCols.length; colNum > numberOfColumns; colNum--) {
                newCols[numberOfColumns - 1] = newCols[numberOfColumns - 1] + currentCols[colNum - 1];
            }
            
            interaction.properties.pages[currentPageIndex].content = newCols;
            interaction.widgetRenderer.renderPages(interaction.properties);
        });    
            
        //Enable page CKEditor on selected tab and disable on the rest tabs.
        $container.on('selectpage.' + interaction.typeIdentifier, function (event, currentPageIndex) {
            var editor,
                pageIndex;
                
            $container.find('.js-page-column').each(function () {
                pageIndex = $(this).closest('.tr-page').data('page-num');
                editor = $(this).find('.container-editor').data('editor');
                if (editor) {
                    editor.setReadOnly(currentPageIndex != pageIndex);
                }
            });
            
        });

        //Destroy page CKeditors when page rerenders
        $container.on('beforerenderpages.' + interaction.typeIdentifier, function () {
            containerEditor.destroy($container.find('.tr-passage'));
        });

        //Init page CKeditors after render
        $container.on('createpager.' + interaction.typeIdentifier, function () {
            initEditors($container, interaction);
        });

        initEditors($container, interaction);

    }, function () {
        var $container = this.widget.$container,
            interaction = this.widget.element;

        $container.off('.' + interaction.typeIdentifier);

        simpleEditor.destroy($container);
        containerEditor.destroy($container.find('.js-page-column'));
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

        $('.js-page-height-select').val(interaction.properties.pageHeight);
        $('.js-tab-position').val(interaction.properties.tabsPosition);
        $('.js-navigation-select').val(interaction.properties.navigation);

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            tabsPosition : function (interaction, value) {
                interaction.properties.tabsPosition = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
            pageHeight : function (interaction, value) {
                interaction.properties.pageHeight = value;
                interaction.widgetRenderer.renderPages(interaction.properties);
            },
            navigation : function (interaction, value) {
                interaction.properties.navigation = value;
                interaction.widgetRenderer.renderAll(interaction.properties);
            },
            buttonLabelsNext : function (interaction, value) {
                interaction.properties.buttonLabels.next = value;
                interaction.widgetRenderer.renderNavigation(interaction.properties);
            },
            buttonLabelsPrev : function (interaction, value) {
                interaction.properties.buttonLabels.prev = value;
                interaction.widgetRenderer.renderNavigation(interaction.properties);
            }
        });
    };

    /**
     * Function initializes the editors on the each page.
     * @param {jQuery DOM element} $container - interaction container
     * @param {object} interaction 
     * @returns {undefined}
     */
    function initEditors($container, interaction) {
        var $pages = $container.find('.js-tab-content'),
            markup = $('[data-serial="' + interaction.serial + '"] .tr-content').html();
    
        $pages.each(function () {
            var pageId = $(this).data('page-id'),
                pageIndex = $(this).data('page-num'),
                colIndex;
            
            $(this).find('.js-page-column').each(function () {
                var colIndex = $(this).data('page-col-index'),
                    markupSelector = '.tr-tabs-' + pageIndex + ' [data-page-col-index="' + colIndex + '"]';
                    
                containerEditor.create($(this), {
                    change : function (text) {
                        var pageData = _.find(interaction.properties.pages, function (page) {
                            return page.id == pageId;
                        });
                        if (pageData && pageData.content[this.colIndex]) {
                            pageData.content[this.colIndex] = text;
                        }
                    },
                    markup : markup,
                    markupSelector : markupSelector,
                    related : interaction,
                    colIndex : colIndex
                });
            }); 
        });
    }

    return stateQuestion;
});
