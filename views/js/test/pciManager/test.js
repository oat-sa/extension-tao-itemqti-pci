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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
define([
    'jquery',
    'lodash',
    'qtiItemPci/pciManager/pciManager',
    'css!qtiItemPciCss/pci-manager'
], function($, _, pciManager){
    'use strict';

    var pluginApi = [
        { name : 'init', title : 'init' },
        { name : 'render', title : 'render' },
        { name : 'destroy', title : 'destroy' },
        { name : 'on', title : 'on' },
        { name : 'off', title : 'off' },
        { name : 'trigger', title : 'trigger' },
        { name : 'open', title : 'open' }
    ];

    QUnit.module('API');

    QUnit.test('factory', function(assert) {
        QUnit.expect(3);
        assert.equal(typeof pciManager, 'function', "The module exposes a function");
        assert.equal(typeof pciManager(), 'object', 'The factory creates an object');
        assert.notDeepEqual(pciManager(), pciManager(), 'The factory creates new objects');
    });

    QUnit
        .cases(pluginApi)
        .test('component method ', function(data, assert) {
            var pciMgr;
            QUnit.expect(1);
            pciMgr = pciManager();
            assert.equal(typeof pciMgr[data.name], 'function', 'The component exposes a "' + data.name + '" function');
        });

    QUnit.module('Behavior');

    QUnit.asyncTest('listing', function(assert){
        var $fixture = $('#qunit-fixture');
        pciManager({
            renderTo : $fixture,
            loadUrl : '/qtiItemPci/views/js/test/pciManager/data/pciList.json',
            disableUrl : '/qtiItemPci/views/js/test/pciManager/data/pciLiquidDisabled.json',
            enableUrl : '/qtiItemPci/views/js/test/pciManager/data/pciLiquidEnabled.json',
        }).on('loaded', function(){

            assert.equal($fixture.children('.pcimgr').length, 1, 'pcimanager main container found');
            assert.equal($fixture.find('.pcimgr .files').length, 1, 'pcimanager file list found');
            assert.equal($fixture.find('.pcimgr .files .pci-list-element').length, 11, 'pci list elements all there');

            assert.equal($fixture.find('.pcimgr .files .pci-list-element.pci-disabled').length, 7, '7 pcis are initially disabled');
            assert.equal($fixture.find('.pcimgr .files .pci-list-element:not(.pci-disabled)').length, 4, '4 pcis are initially enabled');

            assert.ok($fixture.find('.pcimgr a.upload').is(':visible'), 'add button is visible');
            assert.ok(!$fixture.find('.pcimgr a.listing').is(':visible'), 'add button is hidden');
            assert.ok($fixture.find('.pcimgr .files').is(':visible'), 'listing panel visible');
            assert.ok(!$fixture.find('.pcimgr .file-upload-container').is(':visible'), 'upload panel hidden');

            $fixture.find('.pcimgr a.upload').click();

        }).on('hideListing', function(){

            assert.ok(!$fixture.find('.pcimgr a.upload').is(':visible'), 'add button is hidden');
            assert.ok($fixture.find('.pcimgr a.listing').is(':visible'), 'add button is visible');
            assert.ok(!$fixture.find('.pcimgr .files').is(':visible'), 'listing panel is hidden');
            assert.ok($fixture.find('.pcimgr .file-upload-container').is(':visible'), 'upload panel is visible');

            $fixture.find('.pcimgr a.listing').click();

        }).on('showListing', function(){

            assert.ok($fixture.find('.pcimgr a.upload').is(':visible'), 'add button is visible');
            assert.ok(!$fixture.find('.pcimgr a.listing').is(':visible'), 'add button is hidden');
            assert.ok($fixture.find('.pcimgr .files').is(':visible'), 'listing panel visible');
            assert.ok(!$fixture.find('.pcimgr .file-upload-container').is(':visible'), 'upload panel hidden');

            QUnit.start();

        });
    });

    QUnit.module('visual');

    QUnit.asyncTest('render and play', function(assert){
        var $fixture = $('#qunit-fixture-external');
        pciManager({
            renderTo : $fixture,
            loadUrl : '/qtiItemPci/views/js/test/pciManager/data/pciList.json',
            disableUrl : '/qtiItemPci/views/js/test/pciManager/data/pciLiquidDisabled.json',
            enableUrl : '/qtiItemPci/views/js/test/pciManager/data/pciLiquidEnabled.json',
        }).on('loaded', function(){
            assert.ok(true, 'rendered');
            this.open();
            QUnit.start();
        });
    });
});
