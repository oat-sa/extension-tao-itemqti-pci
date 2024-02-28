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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/likertScoreInteraction/data/likert_triple/qti.json'
], function(
    $,
    assetManagerFactory,
    assetStrategies,
    portableAssetStrategy,
    qtiItemRunner,
    ciRegistry,
    pciTestProvider,
    likertTripleData
) {
    'use strict';

    let runner;
    const fixtureContainerId = 'item-container';

    function getAssetManager(baseUrl) {
        return assetManagerFactory([
            assetStrategies.external,
            assetStrategies.baseUrl,
            portableAssetStrategy
        ], { baseUrl: baseUrl || '' });
    }

    //Manually register the pci from its manifest
    pciTestProvider.addManifestPath('likertScoreInteraction', 'qtiItemPci/pciCreator/ims/likertScoreInteraction/imsPciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    QUnit.test('renders correctly', function(assert) {
        const ready = assert.async();

        const assetManager = getAssetManager('/qtiItemPci/views/js/test/likertScoreInteraction/data/likert_triple/');
        const $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', likertTripleData, {assetManager: assetManager})
            .on('render', function() {
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 3, 'the container contains 3 interactions .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 3, 'the container contains 3 custom interactions');
                assert.equal($container.find('.qti-customInteraction .likertScoreInteraction').length, 3, 'the container contains 3 likert interactions');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 3, 'the interaction contains 3 prompts');

                ready();
                runner.clear();
            })
            .on('error', function(error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    QUnit.test('state standard', function(assert) {
        const ready = assert.async();

        const assetManager = getAssetManager('/qtiItemPci/views/js/test/likertScoreInteraction/data/likert_triple/');
        const $container = $('#' + fixtureContainerId);
        const state1 = {response: {base: {integer: 2}}};
        const state2 = {response: {base: {integer: 5}}};

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', likertTripleData, {assetManager: assetManager})
            .on('render', function() {
                assert.equal($('input:radio[name=likert1]:checked').val(), '2', 'likert 1 state set');
                assert.equal($('input:radio[name=likert2]:checked').val(), '5', 'likert 2 state set');
                assert.equal($('input:radio[name=likert3]:checked').val(), undefined, 'likert 3 state untouched');

                assert.deepEqual(this.getState(), {
                    likert1: state1,
                    likert2: state2,
                    likert3: {response: {base: {integer: 0}}}
                }, 'state ok');

                ready();
            })
            .on('error', function(error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container, {
                state: {
                    likert1: state1,
                    likert2: state2
                }
            });
    });
});
