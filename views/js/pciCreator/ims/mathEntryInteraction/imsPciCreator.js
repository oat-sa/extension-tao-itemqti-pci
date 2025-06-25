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
 * Copyright (c) 2016-2021 (original work) Open Assessment Technologies SA;
 *
 * @author Christophe Noël <christophe@taotesting.com>
 *
 */

define([
    'lodash',
    'mathEntryInteraction/creator/widget/Widget',
    'tpl!mathEntryInteraction/creator/tpl/markup'
], function (_, Widget, markupTpl) {
    'use strict';

    var _typeIdentifier = 'mathEntryInteraction';

    var mathEntryInteractionCreator = {
        /**
         * (required) Get the typeIdentifier of the custom interaction
         *
         * @returns {String}
         */
        getTypeIdentifier: function getTypeIdentifier() {
            return _typeIdentifier;
        },
        /**
         * (required) Get the widget prototype
         * Used in the renderer
         *
         * @returns {Object} Widget
         */
        getWidget: function getWidget() {
            return Widget;
        },
        /**
         * (optional) Get the default properties values of the pci.
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        getDefaultProperties: function getDefaultProperties() {
            return {
                authorizeWhiteSpace: 'false',
                useGapExpression: 'false',
                inResponseState: 'false',
                gapExpression: '',
                gapStyle: '',
                focusOnDenominator: false,
                gapResponseIsJson: true,

                tool_frac: 'false',
                tool_sqrt: 'false',
                tool_exp: 'false',
                tool_log: 'false',
                tool_ln: 'false',
                tool_limit: 'false',
                tool_sum: 'false',
                tool_nthroot: 'false',
                tool_matrix_2row: 'false',
                tool_matrix_2row_2col: 'false',
                tool_e: 'false',
                tool_infinity: 'false',
                tool_lbrack: 'false',
                tool_rbrack: 'false',
                tool_pi: 'false',
                tool_cos: 'false',
                tool_sin: 'false',
                tool_tan: 'false',
                tool_lte: 'false',
                tool_gte: 'false',
                tool_times: 'false',
                tool_divide: 'false',
                tool_plusminus: 'false',
                tool_angle: 'false',
                tool_minus: 'false',
                tool_plus: 'false',
                tool_equal: 'false',
                tool_lower: 'false',
                tool_greater: 'false',
                tool_subscript: 'false',
                tool_lbrace: 'false',
                tool_rbrace: 'false',
                tool_lparen: 'false',
                tool_rparen: 'false',
                tool_integral: 'false',
                tool_timesdot: 'false',
                tool_triangle: 'false',
                tool_similar: 'false',
                tool_paral: 'false',
                tool_perp: 'false',
                tool_inmem: 'false',
                tool_ninmem: 'false',
                tool_union: 'false',
                tool_intersec: 'false',
                tool_colon: 'false',
                tool_to: 'false',
                tool_congruent: 'false',
                tool_subset: 'false',
                tool_superset: 'false',
                tool_contains: 'false',
                tool_approx: 'false',
                tool_vline: 'false',
                tool_degree: 'false',
                tool_percent: 'false',
                allowNewLine: 'false',
                enableAutoWrap: 'false'
            };
        },
        /**
         * (optional) Callback to execute on the
         * Used on new pci instance creation
         *
         * @returns {Object}
         */
        afterCreate: function afterCreate(pci) {
            //do some stuff
        },
        /**
         * (required) Gives the qti pci xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupTemplate: function getMarkupTemplate() {
            return markupTpl;
        },
        /**
         * (optional) Allows passing additional data to xml template
         *
         * @returns {function} handlebar template
         */
        getMarkupData: function getMarkupData(pci, defaultData) {
            defaultData.prompt = pci.data('prompt');
            return defaultData;
        }
    };

    //since we assume we are in a tao context, there is no use to expose the a global object for lib registration
    //all libs should be declared here
    return mathEntryInteractionCreator;
});
