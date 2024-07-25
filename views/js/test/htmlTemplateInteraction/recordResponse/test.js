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
    'qtiItemPci/pciCreator/ims/htmlTemplateInteraction/runtime/recordResponse',
], function(record) {
    'use strict';

    QUnit.module('createRecord');

    QUnit.test('returns record', function(assert) {
        const entries = [
            { name: 'test1', base: { string: 'here' } },
            { name: 'test2', base: { boolean: false } },
            { name: 'test3', base: null }
        ];
        const result = record.createRecord(entries);
        const expected = {
            record: entries
        };
        assert.deepEqual(result, expected, 'ok');
    });

    QUnit.module('createRecordEntry');

    QUnit.cases.init([
        {
            title: 'single string non-empty',
            baseType: 'string',
            value: 'here',
            expected: { name: 'test', base: { string: 'here' } }
        },
        {
            title: 'single string empty',
            baseType: 'string',
            value: '',
            expected: { name: 'test', base: { string: '' } }
        },
        {
            title: 'single string null',
            baseType: 'string',
            expected: { name: 'test', base: null }
        },
        {
            title: 'single identifier',
            baseType: 'identifier',
            value: 'id1',
            expected: { name: 'test', base: { identifier: 'id1' } }
        },
        {
            title: 'single identifier null',
            baseType: 'identifier',
            expected: { name: 'test', base: null }
        },
        {
            title: 'single boolean true',
            baseType: 'boolean',
            value: true,
            expected: { name: 'test', base: { boolean: true } }
        },
        {
            title: 'single boolean false',
            baseType: 'boolean',
            value: false,
            expected: { name: 'test', base: { boolean: false } }
        },
        {
            title: 'single boolean null',
            baseType: 'boolean',
            expected: { name: 'test', base: null }
        }
    ])
    .test('returns entry ', function(data, assert) {
        const result = record.createRecordEntry('test', data.baseType, data.value);
        assert.deepEqual(result, data.expected, 'ok');
    });

    QUnit.module('getRecordEntryValue');

    QUnit.cases.init([
        {
            title: 'single string non-empty',
            name: 'test1',
            expected: 'here'
        },
        {
            title: 'single string empty',
            name: 'test2',
            expected: ''
        },
        {
            title: 'single boolean true',
            name: 'test3',
            expected: true
        },
        {
            title: 'single boolean false',
            name: 'test4',
            expected: false
        },
        {
            title: 'single identifier id1',
            name: 'test5',
            expected: 'id1'
        },
        {
            title: 'any null',
            name: 'test6',
            expected: null
        }
    ])
    .test('returns value ', function(data, assert) {
        const entries = [
            { name: 'test1', base: { string: 'here' } },
            { name: 'test2', base: { string: '' } },
            { name: 'test3', base: { boolean: true } },
            { name: 'test4', base: { boolean: false } },
            { name: 'test5', base: { identifier: 'id1' } },
            { name: 'test6', base: null }
        ];
        const result = record.getRecordEntryValue(entries, data.name);
        assert.equal(result, data.expected, 'ok');
    });
});
