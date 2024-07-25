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
    'jquery',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/htmlTemplateInteraction/data/qti.json'
], function(
    $,
    assetManagerFactory,
    assetStrategies,
    portableAssetStrategy,
    qtiItemRunner,
    ciRegistry,
    pciTestProvider,
    sampleItemData
) {
    'use strict';

    let runner;

    function getAssetManager(baseUrl) {
        return assetManagerFactory([
            assetStrategies.external,
            assetStrategies.baseUrl,
            portableAssetStrategy
        ], { baseUrl: baseUrl || '' });
    }

    //Manually register the pci from its manifest
    pciTestProvider.addManifestPath('htmlTemplateInteraction', 'qtiItemPci/pciCreator/ims/htmlTemplateInteraction/imsPciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    QUnit.module('htmlTemplateInteraction');

    QUnit.test('renders correctly', function(assert) {
        const ready = assert.async();

        const assetManager = getAssetManager('/qtiItemPci/views/js/test/htmlTemplateInteraction/data/');
        const $container = $('#item-container');
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', sampleItemData, {assetManager: assetManager})
            .on('render', function() {
                assert.equal($container.children().length, 1, 'the container contains 1 element');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 3, 'the container contains 3 interactions .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 3, 'the container contains 3 custom interactions');
                assert.equal($container.find('.qti-customInteraction .htmlTemplateInteraction').length, 3, 'the 3 interactions contains 3 root markup elements');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 3, 'the 3 interactions contain 3 prompts');
                assert.equal($container.find('.qti-customInteraction iframe').length, 3, 'the 3 interactions contain 3 iframes');

                ready();
                runner.clear();
            })
            .on('error', function(error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    QUnit.test('restores state', function(assert) {
        const ready = assert.async();

        const assetManager = getAssetManager('/qtiItemPci/views/js/test/htmlTemplateInteraction/data/');
        const $container = $('#item-container');

        const state1 = { response: { record: [
            { name: 'text1', base: { string: 'foo' } }
        ] } };
        const state2 = { response: { record: [
            { name: 'inp1', base: { string: 'hey' } },
            { name: 'inp2', base: { string: 'my' } },
            { name: 'inp3', base: { string: 'guy' } }
        ] } };
        const state3 = { response: { record: [
            { name: 'radgroup', base: { identifier: 'spot2' } }
        ] } };

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', sampleItemData, { assetManager: assetManager })
            .on('render', function() {
                const iframe1 = $('iframe', $container).get(0);
                const iframe2 = $('iframe', $container).get(1);
                const iframe3 = $('iframe', $container).get(2);

                // instead of 3 iframe onloads
                setTimeout(() => {
                    assert.equal($('[name=text1]', iframe1.contentDocument).val(), 'foo', 'interaction 1 DOM state restored from item');
                    assert.equal($('[name=inp1]', iframe2.contentDocument).val(), 'hey', 'interaction 2 DOM state restored from item');
                    assert.equal($('[name=inp2]', iframe2.contentDocument).val(), 'my', 'interaction 2 DOM state restored from item');
                    assert.equal($('[name=inp3]', iframe2.contentDocument).val(), 'guy', 'interaction 2 DOM state restored from item');
                    assert.equal($('[name=radgroup]:checked', iframe3.contentDocument).length, 1, 'interaction 3 DOM state restored from item');
                    assert.equal($('[name=radgroup]:checked', iframe3.contentDocument).val(), 'spot2', 'interaction 3 DOM state restored from item');

                    assert.deepEqual(this.getState(), {
                        htpl1: state1,
                        htpl2: state2,
                        htpl3: state3,
                    }, 'item state restored ok');

                    ready();
                    runner.clear();
                }, 250);
            })
            .on('error', function(error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container, {
                state: {
                    htpl1: state1,
                    htpl2: state2,
                    htpl3: state3
                }
            });
    });

    QUnit.test('word counter', function(assert) {
        const ready = assert.async();

        const assetManager = getAssetManager('/qtiItemPci/views/js/test/htmlTemplateInteraction/data/');
        const $container = $('#item-container');
        const value1 = 'A count of 8 words, is expected here!';
        const state1 = { response: { record: [
            { name: 'text1', base: { string: value1 } }
        ] } };


        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', sampleItemData, { assetManager: assetManager })
            .on('render', function() {
                const iframe1 = $('iframe', $container).get(0);
                iframe1.onload = () => {
                    assert.equal($('[name=text1]', iframe1.contentDocument).val(), value1, 'interaction 1 DOM state restored from item');
                    assert.equal($('[name=text1] + p', iframe1.contentDocument).text(), '8 word(s)', 'interaction 1 word count displayed');
                    ready();
                    runner.clear();
                }
            })
            .on('error', function(error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container, {
                state: {
                    htpl1: state1
                }
            });
    });

    QUnit.module('Visual test');

    QUnit.test('display and play', assert => {
        const ready = assert.async();

        const $container = $('#outside-container');

        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', sampleItemData)
            .on('render', ready)
            .on('responsechange', response => $('#response-display').html(JSON.stringify(response, null, 2)))
            .on('error', error => $('#error-display').html(error))
            .init()
            .render($container);
    });
});
