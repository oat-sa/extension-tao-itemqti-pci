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

                tool_frac: 'true',
                tool_sqrt: 'true',
                tool_exp: 'true',
                tool_log: 'true',
                tool_ln: 'true',
                tool_limit: 'true',
                tool_sum: 'true',
                tool_nthroot: 'true',
                tool_matrix_2row: 'true',
                tool_matrix_2row_2col: 'true',
                tool_e: 'true',
                tool_infinity: 'true',
                tool_lbrack: 'true',
                tool_rbrack: 'true',
                tool_pi: 'true',
                tool_cos: 'true',
                tool_sin: 'true',
                tool_tan: 'true',
                tool_lte: 'true',
                tool_gte: 'true',
                tool_times: 'true',
                tool_divide: 'true',
                tool_plusminus: 'true',
                tool_angle: 'true',
                tool_minus: 'true',
                tool_plus: 'true',
                tool_equal: 'true',
                tool_lower: 'true',
                tool_greater: 'true',
                tool_subscript: 'true',
                tool_lbrace: 'true',
                tool_rbrace: 'true',
                tool_lparen: 'true',
                tool_rparen: 'true',
                tool_integral: 'true',
                tool_timesdot: 'true',
                tool_triangle: 'true',
                tool_similar: 'true',
                tool_paral: 'true',
                tool_perp: 'true',
                tool_inmem: 'true',
                tool_ninmem: 'true',
                tool_union: 'true',
                tool_intersec: 'true',
                tool_colon: 'true',
                tool_to: 'true',
                tool_congruent: 'true',
                tool_subset: 'true',
                tool_superset: 'true',
                tool_contains: 'true',
                tool_approx: 'true',
                tool_vline: 'true',
                tool_degree: 'true',
                tool_percent: 'true',
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
