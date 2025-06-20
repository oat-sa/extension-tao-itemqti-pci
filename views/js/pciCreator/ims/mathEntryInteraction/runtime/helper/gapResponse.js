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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
define([], function () {
    'use strict';

    const gapResponse = {
        /**
         * in "gap" mode, convert array of gap values to the string for `{response: {base: string}}` response
         * @param {string[]} array
         * @returns {string}
         */
        arrayToString(array) {
            return array && array.length && array.some(v => !!v) ? JSON.stringify(array) : '';
        },

        /**
         * in "gap" mode, convert the string of `{response: {base: string}}` response to array of gap values
         * @param {string} response
         * @returns {string[]}
         */
        stringToArray(response) {
            return response ? JSON.parse(response) : [];
        }
    };

    return gapResponse;
});
