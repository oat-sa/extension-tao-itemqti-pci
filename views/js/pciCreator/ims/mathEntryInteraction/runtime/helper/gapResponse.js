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

    /** Helper for "gap" mode,
     * to convert array of gap values to the string for `{response: {base: string}}` response,
     * and vice versa
     */
    const gapResponse = {
        /**
         * @param {string[]} array
         * @param {boolean?} gapResponseIsJson - json since v3.0.0, comma-separated string if older version
         * @returns {string}
         */
        arrayToString(array, gapResponseIsJson = true) {
            if (!array || !array.length || !array.some(v => !!v) ) {
                return '';
            } else if (gapResponseIsJson) {
                return JSON.stringify(array);
            } else {
                return array.join(',');
            }
        },
        /**
         *
         * @param {string} response
         * @returns {string[]}
         */
        stringToArray(response) {
            if (!response) {
                return [];
            }
            try {
                return JSON.parse(response);
            } catch (err) {
                return response.split(',');
            }
        }
    };
    return gapResponse;
});
