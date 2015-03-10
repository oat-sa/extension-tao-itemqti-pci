/*global define,console*/
define(
    [
        'qtiCustomInteractionContext',
        'OAT/util/event'
    ],
    function (qtiCustomInteractionContext, event) {
        'use strict';
        qtiCustomInteractionContext.register({
            id : -1,
            getTypeIdentifier : function () {
                return 'pagingPassageInteraction';
            },
            /**
             * Render the PCI : 
             * @param {String} id
             * @param {Node} dom
             * @param {Object} config - json
             */
            initialize : function (id, dom, config) {
                var that = this,
                    renderer = this._taoCustomInteraction.widgetRenderer,
                    properties = that._taoCustomInteraction.properties,
                    pageIds = _.pluck(properties.pages, 'id'),
                    maxPageId = Math.max.apply(null, pageIds);
            
                this.id = id;
                this.dom = dom;
                this.config = config || {};
                this.$container = $(dom);
                
                //add method on(), off() and trigger() to the current object
                event.addEventMgr(this);
                //tell the rendering engine that I am ready
                qtiCustomInteractionContext.notifyReady(this);
                
                this.$container.on('click', '.js-add-choice', function () {
                    var num = properties.choices.length + 1;
                    properties.choices.push('choice_' + num);
                    renderer.renderChoices(that._taoCustomInteraction.properties);
                });
                
                this.$container.on('click', '.js-remove-choice', function () {
                    var num = $(this).data('choice-index');
                    properties.choices.splice(num, 1);                    
                    renderer.renderChoices(that._taoCustomInteraction.properties);
                });
                
                //add page event
                this.$container.on('click', '[class*="js-add-page"]', function () {
                    var num = properties.pages.length + 1,
                        $button = $(this),
                        pageData = {
                            label : 'Page ' + num, 
                            content : 'page ' + num + ' content', 
                            id : ++maxPageId
                        };
                        
                    if ($button.hasClass('js-add-page-before')) {
                        properties.pages.unshift(pageData);
                    } else if ($button.hasClass('js-add-page-after')) {
                        properties.pages.push(pageData);
                    }
                    renderer.renderPages(properties);
                    that.trigger('pageschange');
                });
                
                //remove page event
                this.$container.on('click', '.js-remove-page', function () {
                    var $button = $(this),
                        tabNum = $button.data('page-num');
                    properties.pages.splice((tabNum), 1);  
                    renderer.renderPages(properties);
                    that.trigger('pageschange');
                });
                
                //page navigation events
                this.$container.on('click', '.js-prev-page, .js-next-page', function () {
                    var $button = $(this),
                        direction = +$button.hasClass('js-next-page') * 2 - 1,
                        $tabs = that.$container.find(".js-page-tabs"),
                        currentPage = $tabs.tabs('option', 'selected'),
                        index = currentPage + direction;
                        
                    if (index >= 0 && properties.pages.length > index) {
                        $tabs.tabs('select', index);
                    }
                });
            },
            /**
             * Programmatically set the response following the json schema described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             * 
             * @param {Object} interaction
             * @param {Object} response
             */
            setResponse : function (response) {
                var value = response && response.base ? parseInt(response.base.integer) : -1;

                this.$container.find('input[value="' + value + '"]').prop('checked', true);
            },
            /**
             * Get the response in the json format described in
             * http://www.imsglobal.org/assessment/pciv1p0cf/imsPCIv1p0cf.html#_Toc353965343
             * 
             * @param {Object} interaction
             * @returns {Object}
             */
            getResponse : function () {
                var value = parseInt(this.$container.find('input:checked').val()) || 0;

                return {base : {integer : value}};
            },
            /**
             * Remove the current response set in the interaction
             * The state may not be restored at this point.
             * 
             * @param {Object} interaction
             */
            resetResponse : function () {
                this.$container.find('input').prop('checked', false);
            },
            /**
             * Reverse operation performed by render()
             * After this function is executed, only the inital naked markup remains 
             * Event listeners are removed and the state and the response are reset
             * 
             * @param {Object} interaction
             */
            destroy : function () {
                this.$container.off().empty();
            },
            /**
             * Restore the state of the interaction from the serializedState.
             * 
             * @param {Object} interaction
             * @param {Object} serializedState - json format
             */
            setSerializedState : function (state) {
                
            },
            /**
             * Get the current state of the interaction as a string.
             * It enables saving the state for later usage.
             * 
             * @param {Object} interaction
             * @returns {Object} json format
             */
            getSerializedState : function () {

                return {};
            }
        });
    }
);