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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
require([
    'lodash',
    'qtiItemPci/pciCreator/dev/adaptiveChoiceInteraction/pciCreator'
], function (_, pciCreator) {
    'use strict';
    QUnit.test("pciCreator.getTypeIdentifier()", function () {
        QUnit.equal(pciCreator.getTypeIdentifier(), 'adaptiveChoiceInteraction');
    });

    QUnit.test("pciCreator.getWidget()", function () {
        QUnit.equal(typeof pciCreator.getWidget(), 'object');
    });

    QUnit.test("pciCreator.getDefaultProperties()", function () {
        QUnit.ok(_.isArray(pciCreator.getDefaultProperties().choices));
        QUnit.equal(typeof pciCreator.getDefaultProperties().choiceType, 'string');
    });

    QUnit.test("pciCreator.getMarkupTemplate()", function () {
        QUnit.equal(typeof pciCreator.getMarkupTemplate(), 'function');
    });
});