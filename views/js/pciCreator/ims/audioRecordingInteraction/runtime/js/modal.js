/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA ;
 */
define(['taoQtiItem/portableLib/jquery_2_1_1'], function ($) {
    /**
     * jQuery modal is an easy to use plugin
     * which allows you to create modal windows
     * @example $('#modal-window').modal();
     *
     * @require jquery >= 1.7.0 [http://jquery.com/]
     */

    var pluginName = 'modal';
    var dataNs = 'ui.' + pluginName;

    var defaults = {
        modalCloseClass: 'modal-close',
        modalOverlayClass: 'modal-bg',
        startClosed: false,
        disableClosing: false,
        width: 'responsive',
        minWidth: 0,
        minHeight: 0,
        vCenter: true,
        $context: null,
        animate: 400
    };

    // the duration difference between modal and overlay animates (overlay is animated faster than modal)
    var animateDiff = 100;

    var modal = {
        /**
         * Initialize the modal dialog
         * @param {jQueryElement} $modal
         * @param {Object} [options] - plugin options
         * @param {String} [options.modalCloseClass = 'modal-close'] - the css class for the modal closer
         * @param {String} [options.modalOverlay = 'modal-bg'] - the css class for the modal overlay element
         * @param {Boolean} [options.disableClosing = false] - to disable the default closers
         * @param {Boolean} [options.disableEscape = false] - to disable the ability to escape close the dialog
         * @param {String|Number|Boolean}  [options.width = 'responsive'] - the width behavior, responsive or a fixed value, or default if false
         * @param {Number}  [options.minWidth = 0] - the minimum width of the modal
         * @param {Number}  [options.minHeight = 0] - the minimum height of the modal
         * @param {Number}  [options.top = 0] - the top position of modal, else calculates itself
         * @param {Boolean}  [options.vCenter = true] - if the modal should be centered vertically
         * @param {jQueryElement}  [options.$context = null] - give the context the modal overlay should be append to, if none give, it would be on the window
         * @param {Number|Boolean}  [options.animate = 400] - display the modal using animation
         * @fires modal#create.modal
         */
        init: function ($modal, options) {
            var $overlay;
            options.modalOverlay = '__modal-bg-' + ($modal.attr('id') || new Date().getTime());

            //add data to the element
            $modal.data(dataNs, options);

            //Initialize the overlay for the modal dialog
            if ($('#' + options.modalOverlay).length === 0) {
                $overlay = $('<div/>').attr({ id: options.modalOverlay, class: options.modalOverlayClass });
                if (options.$context instanceof $ && options.$context.length) {
                    //when a $context is given, position the modal overlay relative to that context
                    $overlay.css('position', 'absolute');
                    options.$context.append($overlay);
                } else {
                    //the modal overlay is absolute to the window
                    $modal.after($overlay);
                }
            }

            //Initialize the close button for the modal dialog
            if ($('.' + options.modalCloseClass, $modal).length === 0 && !options.disableClosing) {
                $(
                    '<button ' +
                    'id="modal-close-btn" ' +
                    'class="' + options.modalCloseClass + '" ' +
                    'aria-label="Close dialog" ' +
                    'data-control="close"' +
                    '>' +
                        '<svg width="12" height="12" viewbox="0 0 12 12"><path d="M1 0l5 5 5-5 1 1-5 5 5 5-1 1-5-5-5 5-1-1 5-5-5-5 1-1z"></path></svg>' +
                    '</button>'
                ).appendTo($modal);
            }

            if (!options.startClosed) {
                modal._open($modal);
            }
        },

        /**
         * Destroys the modal
         * @param {jQuery object} $element
         * @fires modal#destroyed.modal
         * @returns {JQuery object} modal
         */
        _destroy: function ($element) {
            return $element.each(function () {
                var $modal = $(this);
                var options = $modal.data(dataNs);

                $modal.removeData(dataNs);
                $('#' + options.modalOverlay).remove();
                $modal.hide();
            });
        },

        /**
         * Bind events
         * @param {jQuery object} $element
         * @returns {undefined}
         */
        _bindEvents: function ($element) {
            var options = $element.data(dataNs);

            if (options) {
                if (options.width === 'responsive') {
                    $(window).on('resize.' + pluginName, function (e) {
                        e.preventDefault();
                        modal._resize($element);
                    });
                }

                if (!options.disableClosing) {
                    $('.' + options.modalCloseClass, $element).on('click.' + pluginName, function (e) {
                        e.preventDefault();
                        closeModal($element);
                    });

                    $('#' + options.modalOverlay).on('click.' + pluginName, function (e) {
                        e.preventDefault();
                        closeModal($element);
                    });

                    if (!options.disableEscape) {
                        $(document).on('keydown.' + pluginName, function (e) {
                            if (e.keyCode === 27) {
                                e.preventDefault();
                                closeModal($element);
                            }
                        });
                    }
                }
            }
        },

        /**
         * Unbind events
         * @param {jQuery object} $element
         * @returns {undefined}
         */
        _unBindEvents: function ($element) {
            var options = $element.data(dataNs);

            if (options && options.width === 'responsive') {
                $(window).off('resize.' + pluginName);
            }

            $element.off('click.' + pluginName);

            if (options && !options.disableClosing) {
                $('.' + options.modalCloseClass, $element).off('click.' + pluginName);
                $('#' + options.modalOverlay).off('click.' + pluginName);
                $(document).off('keydown.' + pluginName);
            }
        },

        /**
         * Open the modal dialog
         * @param {jQuery object} $element
         * @fires modal#opened.modal
         */
        _open: function ($element) {
            var modalHeight = $element.outerHeight(),
                windowHeight = $(window).height(),
                options = $element.data(dataNs),
                topOffset,
                onOpen,
                $overlay,
                to;

            if (typeof options !== 'undefined') {
                // Called when the modal is fully opened
                onOpen = function () {
                    $element.addClass('opened');
                    modal._bindEvents($element);
                };

                //Calculate the top offset
                if (!options.top) {
                    topOffset = options.vCenter || modalHeight > windowHeight ? 40 : (windowHeight - modalHeight) / 2;
                } else {
                    topOffset = options.top;
                }
                // check scroll if element in the scrolled container
                // added later: now offset will be increased only if container element doesn't has class no-scroll-offset
                // as, sometimes, on screens with lesser height part of modal runs under the bottom browser edge
                if (!options.top && !$element.parent().hasClass('no-scroll-offset')) {
                    $element.parents().map(function () {
                        if (this.tagName !== 'BODY' && this.tagName !== 'HTML') {
                            topOffset += parseInt($(this).scrollTop(), 10);
                        }
                    });
                }
                to = {
                    opacity: '1',
                    top: topOffset + 'px'
                };

                modal._resize($element);

                $overlay = $('#' + options.modalOverlay);

                $element.show();

                if (options.animate && $element.is(':visible')) {
                    $element.css({
                        top: '-' + modalHeight + 'px',
                        display: 'block'
                    });

                    $overlay.fadeIn(options.animate - animateDiff);
                    $element.animate(to, options.animate, onOpen);
                } else {
                    $overlay.show();
                    $element.css(to);
                    onOpen();
                }
            }
        },

        /**
         * Close the modal dialog
         * @param {jQuery object} $element
         * @fires modal#closed.modal
         */
        _close: function ($element) {
            closeModal($element);
        },

        /**
         * Resize the modal window
         * @param {jQuery object} $element
         * @returns {undefined}
         */
        _resize: function ($element) {
            var options = $element.data(dataNs);
            var windowWidth = parseInt($(window).width(), 10);
            var css = {};

            //calculate the final width and height
            var modalWidth = options.width === 'responsive' ? windowWidth * 0.7 : parseInt(options.width, 10);
            css.width = Math.max(modalWidth, options.minWidth);
            if (options.minHeight) {
                css.minHeight = parseInt(options.minHeight) + 'px';
            }

            //apply style
            $element.css(css);
        }
    };

    /**
     * Close the modal dialog
     * @param {jQuery} $element
     * @fires modal#closed.modal
     */
    function closeModal($element) {
        var options = $element.data(dataNs);
        var $overlay = $('#' + options.modalOverlay);
        var onClose = function () {
            $element.removeClass('opened');
            $element.css('display', 'none');
        };

        modal._unBindEvents($element);

        if (options.animate && $element.is(':visible')) {
            $overlay.fadeOut(options.animate - animateDiff);
            $element.animate({ opacity: '0', top: '-1000px' }, options.animate, onClose);
        } else {
            $overlay.hide();
            $element.hide();
            onClose();
        }
    }

    /**
     * Register a plugin
     * @param {Object} options
     * @returns {jQueryElement} for chaining
     */
    $.fn.modal = function (options) {
        //extend the options using defaults
        options = $.extend(true, {}, defaults, options);

        // default animation duration
        if (options.animate) {
            if ('number' !== typeof options.animate) {
                options.animate = defaults.animate;
            } else {
                options.animate = Math.max(animateDiff, options.animate);
            }
        }

        return this.each(function () {
            modal.init($(this), options);
        });
    };
});
