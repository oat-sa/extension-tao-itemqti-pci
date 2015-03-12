/*global define, $ */
define([], function () {
    'use strict';
    return function ($container, options) {
        var that = this,
            currentTabIndex,
            $tabs,
            $pages,
            defaultOptions = {
                buttonClass : 'btn-button',
                activeButtonClass : 'btn-info',
                tabsSelector : '.js-tab-buttons li',
                pagesSelector : '.js-tab-content',
                tabButtonSelectior : 'button',
                afterSelect : _.noop(),
                beforeSelect : _.noop(),
                afterCreate : _.noop(),
                beforeCreate : _.noop(),
                initialPageIndex : 0 //active tab index after initialize
            };

        /**
         * Function initializes tabs. 
         * <b>options.beforeCreate</b> and <b>options.afterCreate</b> callbacks will be invoked.
         * After creating will be selected the tab specified in <b>options.initialPageIndex</b> 
         * (<b>options.beforeCreate</b> and <b>options.afterCreate</b> callbacks also will be invoked)
         * @returns {undefined}
         */
        this.init = function () {
            if (_.isFunction(options.beforeCreate)) {
                options.beforeCreate.call(that);
            }

            options = _.extend(defaultOptions, _.clone(options));

            $tabs = $container.find(options.tabsSelector);
            $pages = $container.find(options.pagesSelector);
            currentTabIndex = options.initialPageIndex;

            this.index(currentTabIndex);

            $tabs.on('click', options.tabButtonSelectior, function () {
                var index = $tabs.index($(this).closest(options.tabsSelector));
                that.index(index);
            });

            if (_.isFunction(options.afterCreate)) {
                options.afterCreate.call(that);
            }
        };

        /**
         * Function returns current tab index if <b>index</b> parameter was not passed. 
         * Otherwise will be selected appropriate tab.
         * @param {integer} [index] - tab index to select.
         * @returns {integer} - Active tab index.
         */
        this.index = function (index) {
            if (index === undefined) {
                return currentTabIndex;
            }
            if (_.isFunction(options.beforeSelect)) {
                options.beforeSelect.call(that, index);
            }
            currentTabIndex = index;

            $tabs.find(options.tabButtonSelectior).removeClass(options.activeButtonClass).addClass(options.buttonClass);
            $tabs.eq(index).find(options.tabButtonSelectior).addClass(options.activeButtonClass);

            $pages.hide();
            $pages.eq(index).show();

            if (_.isFunction(options.afterSelect)) {
                options.afterSelect.call(that, index);
            }
            return currentTabIndex;
        };

        /**
         * Function returns number of tabs.
         * @returns {integer}
         */
        this.countTabs = function () {
            return $tabs.length;
        };

        this.init();
    };
});