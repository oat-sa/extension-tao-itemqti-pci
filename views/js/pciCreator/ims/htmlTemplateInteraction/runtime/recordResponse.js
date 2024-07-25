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
 * Copyright (c) 2024 (original work) Open Assessment Technologies SA ;
 */
/**
 * Helper module for "cardinality": "record" response type (with limited support)
 * @example of supported fields
{
  "record": [
    {
      "name": "textarea1",
      "base": {
        "string": "this is my response"
      }
    },
    {
      "name": "select1",
      "base": {
        "identifier": "option_name1"
      }
    },
    {
      "name": "checkbox1",
      "base": {
        "boolean": true
      }
    },
    {
      "name": "radio1",
      "base": {
        "identifier": "radio_value1"
      }
    }
  ]
}
 */
define(function() {
    'use strict';

    /**
     * @typedef {object} RecordEntry
     * @property {string} name
     * @property {object} base - list is not supported
     * @property {string} [base.string]
     * @property {string} [base.identifier]
     * @property {Boolean} [base.boolean]
     */

    /**
     * Check and structure record entries into the format needed within a QTI response
     * @param {RecordEntry[]} entries
     * @returns {object}
     */
    function createRecord(entries = []) {
        const names = entries.map(entry => entry.name);
        if (names.length > new Set(names).size) {
            throw new Error('Cannot createRecord with duplicate names');
        }
        return {
            record: [...entries]
        };
    }

    /**
     * Format a named and typed value as a record entry
     * @param {string} name
     * @param {string} baseType - string, identifier, boolean supported
     * @param {*} value
     * @returns {RecordEntry}
     */
    function createRecordEntry(name, baseType, value = null) {
        if (!name) {
            throw new Error(`Cannot createRecordEntry with name: ${name}`);
        }
        if (value === null) {
            return {
                name,
                base: null
            };
        }
        return {
            name,
            base: {
                [baseType]: value
            }
        };
    }

    /**
     * Extract a named value from record entries
     * @param {RecordEntry[]} entries
     * @param {string} name
     * @returns {*} value
     */
    function getRecordEntryValue(entries = [], name = '') {
        const match = entries.find(entry => entry.name === name);
        if (!match) {
            return null;
        }
        return match.base && Object.values(match.base)[0];
    }

    return {
        createRecord,
        createRecordEntry,
        getRecordEntryValue
    };
});
