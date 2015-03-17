/*global define*/
define(
    [
        'IMSGlobal/jquery_2_1_1',
        'OAT/handlebars',
        'textReaderInteraction/runtime/js/tabs'
    ],
    function ($, Handlebars, Tabs) {
        'use strict';

        return function (options) {
            var that = this,
                defaultOptions = {
                    state : 'sleep',
                    templates : {},
                    serial : ''
                },
                currentPage = 0;

            this.eventNs = 'textReaderInteraction';
            this.options = {};

            this.init = function () {
                var pagesTpl,
                    navTpl;
                _.assign(that.options, defaultOptions, options);
            
                if (!that.options.templates.pages) {
                    pagesTpl = $('.text-reader-pages-tpl').html().replace("<![CDATA[", "").replace("]]>", ""),
                    that.options.templates.pages = Handlebars.compile(pagesTpl);
                }
                if (!that.options.templates.navigation) {
                    navTpl = $('.text-reader-nav-tpl').html().replace("<![CDATA[", "").replace("]]>", "");
                    that.options.templates.navigation = Handlebars.compile(navTpl);
                }
            };

            /**
             * Function sets interaction state.
             * @param {string} state name (e.g. 'question' | 'answer')
             * @return {object} this
             */
            this.setState = function (state) {
                this.options.state = state;
                return this;
            };

            /**
             * Function renders interaction.
             * @param {object} data - interaction parameters
             * @return {object} this
             */
            this.renderPages = function (data) {
                var templateData = {};

                this.options.$container.trigger('beforerenderpages.' + that.eventNs);

                //render pages template
                if (that.options.templates.pages) {
                    _.assign(templateData, data, that.getTemplateData(data));
                    
                    this.options.$container.find('.js-page-container').html(
                        that.options.templates.pages(templateData, that.getTemplateOptions())
                    );
                }

                //init tabs
                that.tabsManager = new Tabs(this.options.$container.find('.js-page-tabs'), {
                    afterSelect : function (index) {
                        currentPage = index;
                        that.updateNav();
                        that.options.$container.trigger('selectpage.' + that.eventNs, index);
                    },
                    beforeCreate : function () {
                        that.tabsManager = this;
                        currentPage = 0;
                        that.options.$container.trigger('createpager.' + that.eventNs);
                    }
                });
                
                $.each(data.pages, function (key, val) {
                    $('[data-page-id="' + val.id + '"] .js-page-columns-select').val(val.content.length);
                });
                
                this.options.$container.trigger('afterrenderpages.' + that.eventNs);
                
                return this;
            };
            
            /**
             * Function renders interaction.
             * @param {object} data - interaction parameters
             * @return {object} this
             */
            this.renderNavigation = function (data) {
                var templateData = {};

                //render pages template
                if (that.options.templates.navigation) {
                    _.assign(templateData, data, that.getTemplateData(data));
                    
                    this.options.$container.find('.js-nav-container').html(
                        that.options.templates.navigation(templateData, that.getTemplateOptions())
                    );
                }
                
                this.updateNav();
                
                return this;
            };
            
            /**
             * Function renders whole interaction (pages and navigation)
             * @param {object} data - interaction parameters
             * @return {object} - this
             */
            this.renderAll = function (data) {
                this.renderPages(data);
                this.renderNavigation(data);
                return this;
            };
            
            /**
             * Function updates page navigation controls (current page number and pager buttons)
             * @return {object} - this
             */
            this.updateNav = function () {
                var tabsNum = this.tabsManager.countTabs(),
                    $prevBtn =  this.options.$container.find('.js-prev-page button'),
                    $nextBtn =  this.options.$container.find('.js-next-page button');

                this.options.$container.find('.js-current-page').text((currentPage + 1));
                if (tabsNum <= currentPage + 1) {
                    $nextBtn.attr('disabled', 'disabled');
                    $prevBtn.removeAttr('disabled');
                } else if (currentPage == 0) {
                    $prevBtn.attr('disabled', 'disabled');
                    $nextBtn.removeAttr('disabled');
                } else {
                    $prevBtn.removeAttr('disabled');
                    $nextBtn.removeAttr('disabled');
                }
                return this;
            };

            /**
             * Function returns template data (current page number, interaction serial, current state etc.)
             * to pass it in handlebars template together with interaction parameters.
             * @param {object} data - interaction parameters
             * @return {object} - template data
             */
            this.getTemplateData = function (data) {
                var pageWrapperHeight;
                if (that.options.state === 'question') {
                    pageWrapperHeight = parseInt(data.pageHeight, 10) + 125;
                } else {
                    pageWrapperHeight = parseInt(data.pageHeight, 10) + 25;
                }

                return {
                    state : that.options.state,
                    serial : that.options.serial,
                    currentPage : currentPage + 1,
                    pagesNum : data.pages.length,
                    showTabs : (data.pages.length > 1 || data.onePageNavigation) && data.navigation != 'buttons',
                    showNavigation : (data.pages.length > 1 || data.onePageNavigation) && data.navigation != 'tabs',
                    authoring : that.options.state === 'question',
                    pageWrapperHeight : pageWrapperHeight
                };
            };
            
            /**
             * Function returns Handlebars template options (helpers) that will be used when rendering.
             * @returns {object} - Handlebars template options
             */
            this.getTemplateOptions = function () {
                return {
                    helpers : {
                        inc : function (value) {
                            return parseInt(value, 10) + 1;
                        }
                    }
                };
            };

            this.init();
        };
    }
);