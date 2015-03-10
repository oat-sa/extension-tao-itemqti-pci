/*global define*/
define(
    [
        'IMSGlobal/jquery_2_1_1',
        'OAT/util/html'
    ],
    function ($, html) {
        'use strict';

        return function (options) {
            var that = this,
                defaultOptions = {
                    state : 'sleep',
                    templates : {},
                    serial : ''
                },
                currentPage = 0;

            this.eventNs = 'pagingPassageInteraction';
            this.options = {};

            this.init = function () {
                _.assign(that.options, defaultOptions, options);
                if (!that.options.templates.choices || !that.options.templates.pages) {
                    throw new Error("pagingPassageInteraction: Templates were not specified."); 
                }
            };

            /**
             * Function sets interaction container
             * @param {jQuery dom element} interaction container
             * @return {object} this
             */
            this.setContainer = function ($container) {
                this.options.$container = $container;
                return this;
            };

            /**
             * Function sets interaction state
             * @param {string} state name (e.g. 'question' | 'answer')
             * @return {object} this
             */
            this.setState = function (state) {
                this.options.state = state;
                return this;
            };
            
            /**
             * Function renders interaction choices
             * @param {object} interaction parameters
             * @return {object} this
             */
            this.renderChoices = function (data) {
                var templateData = _.extend({}, data, that.getTemplateData(data));

                this.options.$container.find('.js-choice-container').html(
                    that.options.templates.choices(templateData, that.getTemplateOptions())
                );
                this.options.$container.trigger('renderchoices.' + that.eventNs);
                return this;
            };
            
            /**
             * Function renders interaction pages
             * @param {object} interaction parameters
             * @return {object} this
             */
            this.renderPages = function (data) {
                var templateData = {},
                    $tabs;
                _.assign(templateData, data, that.getTemplateData(data));
                
                this.options.$container.trigger('beforerenderpages.' + that.eventNs);
                //render pages template
                this.options.$container.find('.js-page-container').html(
                    that.options.templates.pages(templateData, that.getTemplateOptions())
                );
        
                //init tabs
                $tabs = this.options.$container.find(".js-page-tabs").tabs({
                    select : function (event, ui) {
                        that.options.$container.trigger('selectpage.' + that.eventNs, {ui : ui});
                        currentPage = ui.index;
                        that.updateNav();
                    },
                    create : function (event, ui) {
                        currentPage = 0;
                        that.options.$container.trigger('createpager.' + that.eventNs, {ui : ui});
                        that.updateNav();
                    }
                });
                
                //set tabs position
                if (data.tabsPosition == 'right') {
                    $tabs.addClass('ui-tabs-vertical ui-helper-clearfix');
                    $tabs.find('.ui-tabs-nav li').removeClass( 'ui-corner-top' ).addClass( 'ui-corner-left' );
                }
                
                this.options.$container.trigger('afterrenderpages.' + that.eventNs);
                return this;
            };
            
            /**
             * Function updates page navigation controls (current page number and pager buttons)
             * @return {object} this
             */
            this.updateNav = function () {
                var tabsNum = this.options.$container.find(".js-page-tabs").tabs("length"),
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
            };
            
            /**
             * Function renders whole interaction (pages and choices)
             * @param {object} interaction parameters
             * @return {object} this
             */
            this.renderAll = function (data) {
                this.renderChoices(data);
                this.renderPages(data);
                return this;
            };
            
            /**
             * Function returns tempate data (current page number, interaction serial, current state etc.)  
             * @param {object} interaction parameters
             * @return {object} template data
             */
            this.getTemplateData = function (data) {
                return {
                    state : that.options.state,
                    serial : that.options.serial,
                    currentPage : currentPage + 1,
                    pagesNum : data.pages.length
                };
            };
            
            this.getTemplateOptions = function () {
                return {
                    helpers : {
                        inc : function (value) {
                            return parseInt(value, 10) + 1;
                        },
                        ifCond : function (v1, operator, v2, options) {
                            switch (operator) {
                                case '!=':
                                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                                case '==':
                                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                                case '===':
                                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                                case '<':
                                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                                case '<=':
                                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                                case '>':
                                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                                case '>=':
                                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                                case '&&':
                                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                                case '||':
                                    return (v1 || v2) ? options.fn(this) : options.inverse(this);
                                default:
                                    return options.inverse(this);
                            }
                        }
                    }
                };
            };

            this.init();
        };
    }
);