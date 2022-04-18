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
/*
 *   This is a dialog component to throw a modal to give feedback to the user
 */
define([
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'audioRecordingInteraction/runtime/js/modal'
], function (_, $) {
    'use strict';
    /**
     * The scope of events names
     * @type {string}
     */
    const _scope = '.modal';

    /**
     * The defaults fields values
     * @type {Object}
     */
    const _defaults = {
        message: '',
        width: 500,
        animate: false,
        autoRender: false,
        autoDestroy: false,
        renderTo: 'body'
    };

    /**
     * Define a dialog box
     * @type {Object}
     */
    const dialog = {
        /**
         * Initialise the dialog box.
         * @param {Object} options - A list of options.
         * @param {String} options.message - The message to display.
         * @param {String} options.class - Space-separated string of classes to add to the root HTML element
         * @param {String|jQuery|HTMLElement} options.renderTo - A container in which renders the dialog (default: 'body').
         * @param {Boolean} options.autoRender - Allow the dialog to be immediately rendered after initialise.
         * @param {Boolean} options.autoDestroy - Allow the dialog to be immediately destroyed when closing.
         * @param {Boolean} [options.disableClosing = false] - to disable the default closers
         * @param {Boolean} [options.disableEscape = false] - to disable the ability to escape close the dialog
         * @param {Number} options.width - The dialog box width in pixels (default: 500).
         * @param {Number|Boolean} options.animate - The dialog box animate duration (default: false).
         * @returns {dialog}
         */
        init(options) {
            // split options to events
            const events = {};
            const initOptions = _.omit(options || {}, (value, key) => {
                if (key.length > 2 && 'on' === key.substr(0, 2)) {
                    events[key.substr(2)] = value;
                    return true;
                }
                return false;
            });

            // assign default values and options
            _.defaults(this, initOptions, _defaults);

            // pre-render the dialog box
            this.dialogId = _.uniqueId('dlg-');
            this.$html = $(
                '<div ' +
                    'class="modal ' + this.class + '" '+
                    'role="dialog" '+
                    'aria-modal="true" '+
                    'data-control="navigable-modal-body" '+
                    'aria-describedby="core/ui-dialog-message-' + this.dialogId +'">' +
                    '<div class="modal-body clearfix">'+
                        '<p id="core/ui-dialog-message-' + this.dialogId + '" class="message">' + this.message +'</p>'+
                    '</div>'+
                '</div>'
            );

            this.rendered = false;
            this.destroyed = false;

            // install the events extracted from the options
            _.forEach(events, (callback, eventName) => {
                if (eventName.indexOf('.') < 0) {
                    eventName += _scope;
                }
                this.on(eventName.toLowerCase(), callback);
            });

            if (this.autoRender) {
                this.render();
            }

            return this;
        },

        /**
         * Destroys the dialog box
         * @returns {dialog}
         * @fires dialog#destroy.modal
         */
        destroy() {
            if (!this.destroyed) {
                this._destroy();

                // reset the context
                this.rendered = false;
                this.destroyed = true;

                this.trigger('destroy' + _scope);

                // disable events and remove DOM
                this.$html.off(_scope).remove();
                this.$html = null;
            }

            return this;
        },

        /**
         * Renders and shows the dialog box
         * @param {String|HTMLElement|jQuery} [to]
         * @returns {dialog}
         * @fires modal#create.modal
         */
        render(to) {
            if (!this.destroyed) {
                $(to || this.renderTo).append(this.$html);
                this._install();
                this.rendered = true;
            }
            return this;
        },

        /**
         * Shows the dialog box. Also renders if needed.
         * @returns {dialog}
         * @fires modal#opened.modal
         */
        show() {
            if (!this.destroyed) {
                if (!this.rendered) {
                    this.render();
                } else {
                    this._open();
                }
            }
            return this;
        },

        /**
         * Hides the dialog box. Does nothing if the dialog box has not been rendered.
         * @returns {dialog}
         * @fires modal#closed.modal
         */
        hide() {
            if (!this.destroyed && this.rendered) {
                this._close();

                if (this.autoDestroy) {
                    this.destroy();
                }
            }
            return this;
        },

        /**
         * Install an event handler on the underlying DOM element
         * @returns {dialog}
         */
        on() {
            if (this.$html) {
                this.$html.on.apply(this.$html, arguments);
            }

            return this;
        },

        /**
         * Uninstall an event handler from the underlying DOM element
         * @returns {dialog}
         */
        off() {
            if (this.$html) {
                this.$html.off.apply(this.$html, arguments);
            }

            return this;
        },

        /**
         * Triggers an event on the underlying DOM element
         * @param {String} eventName
         * @param {Array|Object} extraParameters
         * @returns {dialog}
         */
        trigger(eventName, extraParameters) {
            if (this.$html) {
                if (typeof extraParameters === 'undefined') {
                    extraParameters = [];
                }
                if (!_.isArray(extraParameters)) {
                    extraParameters = [extraParameters];
                }

                extraParameters = Array.prototype.slice.call(extraParameters);
                extraParameters.push(this);

                this.$html.trigger(eventName, extraParameters);
            }

            return this;
        },

        /**
         * Gets the underlying DOM element
         * @returns {jQuery}
         */
        getDom() {
            return this.$html;
        },

        /**
         * Installs the dialog box
         * @private
         * #fires dialog#create.dialog
         */
        _install() {
            if (!this.destroyed) {
                this.$html
                    .modal({
                        width: this.width,
                        animate: this.animate,
                        disableClosing: this.disableClosing,
                        disableEscape: this.disableEscape
                    })
                    .on('closed' + _scope, () => {
                        if (this.autoDestroy) {
                            this.destroy();
                        }
                    });
                const $items = this.getDom().add($(_scope).find('input'));
                const closeButton = $(_scope).find('#modal-close-btn')[0];

                if (closeButton) {
                    $items.push(closeButton);
                }

                this.trigger('create.dialog');
            }
        },

        /**
         * Opens the dialog box
         * @private
         */
        _open() {
            this.$html.modal('open');
        },

        /**
         * Closes the dialog box
         * @private
         */
        _close() {
            this.$html.modal('close');
        },

        /**
         * Destroys the dialog box
         * @private
         */
        _destroy() {
            this.$html.modal('destroy');
            if (this.navigator) {
                this.navigator.destroy();
            }
            if (this.globalShortcut) {
                this.globalShortcut.clear();
            }
        }
    };

    /**
     * Builds a dialog box instance
     * @param {Object} options
     * @returns {Dialog}
     */
    return function dialogFactory(options) {
        const instance = Object.assign({}, dialog);
        instance.init(options);
        return instance;
    };
});
