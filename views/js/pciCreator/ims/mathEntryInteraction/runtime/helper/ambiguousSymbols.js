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
 * Copyright (c) 2023 (original work) Open Assessment Technologies SA ;
 */
define([], function () {
    'use strict';
    /**
     * Default mapping from ambiguous characters to ASCII.
     * @type {object}
     */
    const defaultMapping = {
        '０': '0',
        '１': '1',
        '２': '2',
        '３': '3',
        '４': '4',
        '５': '5',
        '６': '6',
        '７': '7',
        '８': '8',
        '９': '9',
        '−': '-',
        '‐': '-',
        '―': '-',
        '-': '-'
    };

    /**
     * Converts ambiguous unicode symbols into plain ASCII equivalent.
     * @param {string} text - The text to convert.
     * @returns {string} - Returns the converted text.
     */
    function convert(text) {
        let result = '';
        for (const char of text) {
            result += defaultMapping[char] || char;
        }

        return result;
    }

    return convert;
});