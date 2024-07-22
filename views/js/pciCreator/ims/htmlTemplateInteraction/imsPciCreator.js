/*
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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'htmlTemplateInteraction/creator/widget/Widget',
    'tpl!htmlTemplateInteraction/creator/tpl/markup'
], function (Widget, markupTpl) {
    'use strict';

    const typeIdentifier = 'htmlTemplateInteraction';

    return {

        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier() {
            return typeIdentifier;
        },

        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget() {
            return Widget;
        },

        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties() {
            return {
                html: '<form><textarea name="text1" data-response></textarea><p data-wordcount-for="text1"></p></form>',
                isReviewMode: false
            };
        },

        /**
         * (optional) Callback to execute on the
         * new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate() {

        },

        /**
         * (required) Gives the qti pci markup template
         *
         * @returns {function} template function
         */
        getMarkupTemplate() {
            return markupTpl;
        },

        /**
         * (optional) Allows passing additional data to xml template (see templateData)
         *
         * @returns {Object} template data
         */
        getMarkupData(pci, defaultData) {
            return Object.assign({
                serial: Date.now(),
                prompt: pci.data('prompt')
            }, defaultData);
        }
    };
});
