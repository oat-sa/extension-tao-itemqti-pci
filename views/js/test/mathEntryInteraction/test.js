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
 * Copyright (c) 2016-2022 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/mathEntryInteraction/data/qti.json'
], function ($, _, qtiItemRunner, ciRegistry, pciTestProvider, itemData) {
    'use strict';

    const fixtureContainerId = 'item-container';
    const elements = {
        interaction: 'interaction_portablecustominteraction_59b29448bdbf1249551660',
        response: 'responsedeclaration_59b29448bccf2756213375'
    };

    //Manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'mathEntryInteraction',
        'qtiItemPci/pciCreator/ims/mathEntryInteraction/imsPciCreator.json'
    );
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    QUnit.module('Math Entry Interaction');

    /* */

    QUnit.test('renders correctly', assert => {
        const ready = assert.async();

        const $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        const runner = qtiItemRunner('qti', itemData)
            .on('render', function () {
                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal(
                    $container.children('.qti-item').length,
                    1,
                    'the container contains a the root element .qti-item'
                );
                assert.equal(
                    $container.find('.qti-interaction').length,
                    1,
                    'the container contains an interaction .qti-interaction'
                );
                assert.equal(
                    $container.find('.qti-interaction.qti-customInteraction').length,
                    1,
                    'the container contains a custom interaction'
                );
                assert.equal(
                    $container.find('.qti-customInteraction .mathEntryInteraction').length,
                    1,
                    'the container contains a Math Entry interaction'
                );
                assert.equal(
                    $container.find('.qti-customInteraction .prompt').length,
                    1,
                    'the interaction contains a prompt'
                );
                assert.equal(
                    $container.find('.qti-customInteraction .prompt math').length,
                    0,
                    'the math expressions are replaced'
                );
                assert.equal(
                    $container.find('.qti-customInteraction .prompt .mq-math-mode').length,
                    2,
                    'the math expressions are rendered'
                );

                runner.clear();
                ready();
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.test('destroys', assert => {
        const ready = assert.async();
        const $container = $('#' + fixtureContainerId);

        assert.expect(5);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        const runner = qtiItemRunner('qti', itemData)
            .on('render', () => {
                const interaction = runner._item.getInteractions()[0];

                const sqrt = document.querySelector('[data-identifier="sqrt"]');
                sqrt.dispatchEvent(new Event('mousedown', { bubbles: true }));

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string: '\\sqrt{ }'
                            }
                        }
                    },
                    'response is correct after sqrt click'
                );

                //Call destroy manually
                interaction.renderer.destroy(interaction);

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string: ''
                            }
                        }
                    },
                    'destroy resets response'
                );

                // clicking destroyed interaction
                sqrt.dispatchEvent(new Event('mousedown', { bubbles: true }));

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string: ''
                            }
                        }
                    },
                    'destroyed interaction does not modify its answer'
                );

                runner.clear();
                ready();
            })
            .on('error', error => $('#error-display').html(error))
            .init()
            .render($container);
    });

    /* */

    QUnit.test('set and get response', assert => {
        const ready = assert.async();

        assert.expect(4);

        const response = {
            base: {
                string: '\\frac{12}{\\pi}'
            }
        };
        const $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        const runner = qtiItemRunner('qti', itemData)
            .on('render', () => {
                const interactions = runner._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');

                const sqrt = document.querySelector('[data-identifier="sqrt"]');
                sqrt.dispatchEvent(new Event('mousedown', { bubbles: true }));

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string: response.base.string + '\\sqrt{ }'
                            }
                        }
                    },
                    'get back previously set answer with clicked modification'
                );

                runner.clear();
                ready();
            })
            .on('error', error => $('#error-display').html(error))
            .init()
            .render($container, { state: { RESPONSE: { response } } });
    });

    QUnit.test('set and get response with gap expression', assert => {
        const ready = assert.async();

        assert.expect(2);

        const response = {
            base: {
                string: '\\frac{1}{2},\\frac{1}{4}'
            }
        };
        const $container = $('#' + fixtureContainerId);

        const newItemData = _.cloneDeep(itemData);
        newItemData.body.elements[elements.interaction].properties.useGapExpression = 'true';
        newItemData.body.elements[elements.interaction].properties.gapExpression =
            '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses[elements.response].cardinality = 'multiple';

        const runner = qtiItemRunner('qti', newItemData)
            .on('render', () => {
                const interactions = runner._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string: '\\frac{1}{2},\\frac{1}{4}'
                            }
                        }
                    },
                    'get back set response'
                );

                runner.clear();
                ready();
            })
            .on('error', error => $('#error-display').html(error))
            .init()
            .setState({ RESPONSE: response })
            .render($container, { state: { RESPONSE: { response } } });
    });

    /* */

    QUnit.test('set and get state', assert => {
        const ready = assert.async();

        assert.expect(3);

        const state = {
            RESPONSE: {
                response: {
                    base: {
                        string: '\\frac{12}{\\pi}'
                    }
                }
            }
        };
        const $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        const runner = qtiItemRunner('qti', itemData)
            .on('render', () => {
                assert.deepEqual(runner.getState(), state, 'state set/get ok');

                runner.clear();
                ready();
            })
            .init()
            .render($container, { state });
    });

    /* */

    QUnit.test('set and get state with gap expression', assert => {
        const ready = assert.async();

        assert.expect(1);

        const state = {
            RESPONSE: {
                response: {
                    base: {
                        string: '\\frac{1}{2},\\frac{1}{4}'
                    }
                }
            }
        };
        const $container = $('#' + fixtureContainerId);

        const newItemData = _.cloneDeep(itemData);
        newItemData.body.elements[elements.interaction].properties.useGapExpression = 'true';
        newItemData.body.elements[elements.interaction].properties.gapExpression =
            '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses[elements.response].cardinality = 'multiple';

        const runner = qtiItemRunner('qti', newItemData)
            .on('render', () => {
                assert.deepEqual(runner.getState(), state, 'state set/get ok');

                runner.clear();
                ready();
            })
            .init()
            .render($container, { state });
    });

    /* */

    QUnit.module('Visual test');

    QUnit.test('display and play', assert => {
        const ready = assert.async();

        const $container = $('#outside-container');

        const newItemData = _.cloneDeep(itemData);
        newItemData.body.elements[elements.interaction].properties.useGapExpression = 'true';
        newItemData.body.elements[elements.interaction].properties.gapExpression =
            '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses[elements.response].cardinality = 'multiple';

        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', newItemData)
            .on('render', ready)
            .on('responsechange', response => $('#response-display').html(JSON.stringify(response, null, 2)))
            .on('error', error => $('#error-display').html(error))
            .init()
            .render($container);
    });
});
