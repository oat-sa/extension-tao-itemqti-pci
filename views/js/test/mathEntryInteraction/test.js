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

    function createInteraction(properties) {
        const responseDeclaration = {
            serial: 'response-serial',
            id: _.noop,
            attr: _.noop,
            removeMapEntries: _.noop
        };

        return {
            properties: _.cloneDeep(properties || {}),
            responseIdentifier: 'RESPONSE',
            prop(name, value) {
                if (arguments.length > 1) {
                    this.properties[name] = value;
                    return value;
                }

                return this.properties[name];
            },
            attr(name, value) {
                if (arguments.length > 1) {
                    this[name] = value;
                    return value;
                }

                return this[name];
            },
            getResponseDeclaration() {
                return responseDeclaration;
            },
            getProperties() {
                return this.properties;
            },
            triggerPci: _.noop
        };
    }

    function initQuestionState(QuestionState, properties) {
        const widget = {
            $form: $('<div>'),
            element: createInteraction(properties)
        };
        const state = Object.create(QuestionState.prototype);

        state.widget = widget;
        state.initForm();

        return state;
    }

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
                string: '["\\\\frac{1}{2}","3,4"]'
            }
        };
        const $container = $('#' + fixtureContainerId);

        const newItemData = _.cloneDeep(itemData);
        newItemData.body.elements[elements.interaction].properties.useGapExpression = 'true';
        newItemData.body.elements[elements.interaction].properties.gapExpression =
            '\\frac{1}{2}+\\taoGap=3,4\\taoGap';

        const runner = qtiItemRunner('qti', newItemData)
            .on('render', () => {
                const interactions = runner._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');

                assert.propEqual(
                    runner.getResponses(),
                    {
                        RESPONSE: {
                            base: {
                                string:  '["\\\\frac{1}{2}","3,4"]'
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
                        string: '["\\\\frac{1}{2}","3,4"]'
                    }
                }
            }
        };
        const $container = $('#' + fixtureContainerId);

        const newItemData = _.cloneDeep(itemData);
        newItemData.body.elements[elements.interaction].properties.useGapExpression = 'true';
        newItemData.body.elements[elements.interaction].properties.gapExpression =
            '\\frac{1}{2}+\\taoGap=3,4\\taoGap';

        const runner = qtiItemRunner('qti', newItemData)
            .on('render', () => {
                assert.deepEqual(runner.getState(), state, 'state set/get ok');

                runner.clear();
                ready();
            })
            .init()
            .render($container, { state: _.cloneDeep(state) });
    });

    /* */

    QUnit.test('Question state initializes symbol props from explicit properties only', assert => {
        assert.expect(28);

        const questionStateModuleName = 'mathEntryInteraction/creator/widget/states/Question';
        const templateModuleName = 'tpl!mathEntryInteraction/creator/tpl/propertiesForm';
        const originalSelect2 = $.fn.select2;
        const originalRequire = window.require;
        let capturedModule;
        let finished = false;

        function teardown() {
            $.fn.select2 = originalSelect2;
            requirejs.undef(questionStateModuleName);
            requirejs.undef(templateModuleName);
        }

        function finalize() {
            if (!finished) {
                finished = true;
                done();
            }
        }

        $.fn.select2 = function () {
            return this;
        };

        const done = assert.async();

        requirejs.undef(questionStateModuleName);
        requirejs.undef(templateModuleName);

        define(templateModuleName, [], function () {
            return function (props) {
                capturedModule = props;
                return [
                    '<div class="mathgap-style-box">',
                    '  <select data-mathgap-style></select>',
                    '</div>',
                    '<div class="tools"></div>'
                ].join('');
            };
        });

        try {
            originalRequire([questionStateModuleName], function (QuestionState) {
                try {
                    const cases = [
                        {
                            label: 'tool_frac explicit true',
                            properties: { tool_frac: 'true' },
                            expected: { tool_frac: true }
                        },
                        {
                            label: 'tool_frac explicit false',
                            properties: { tool_frac: 'false' },
                            expected: { tool_frac: false }
                        },
                        {
                            label: 'tool_frac omitted',
                            properties: {},
                            expected: { tool_frac: false }
                        },
                        {
                            label: 'tool_sqrt explicit true',
                            properties: { tool_sqrt: 'true' },
                            expected: { tool_sqrt: true }
                        },
                        {
                            label: 'tool_sqrt explicit false',
                            properties: { tool_sqrt: 'false' },
                            expected: { tool_sqrt: false }
                        },
                        {
                            label: 'tool_sqrt omitted',
                            properties: {},
                            expected: { tool_sqrt: false }
                        },
                        {
                            label: 'tool_pi explicit true',
                            properties: { tool_pi: 'true' },
                            expected: { tool_pi: true }
                        },
                        {
                            label: 'tool_pi explicit false',
                            properties: { tool_pi: 'false' },
                            expected: { tool_pi: false }
                        },
                        {
                            label: 'tool_pi omitted',
                            properties: {},
                            expected: { tool_pi: false }
                        },
                        {
                            label: 'squarebkts explicit true',
                            properties: { tool_lbrack: 'true', tool_rbrack: 'true' },
                            expected: { squarebkts: true }
                        },
                        {
                            label: 'squarebkts explicit false',
                            properties: { tool_lbrack: 'false', tool_rbrack: 'false' },
                            expected: { squarebkts: false }
                        },
                        {
                            label: 'squarebkts omitted',
                            properties: {},
                            expected: { squarebkts: false }
                        },
                        {
                            label: 'squarebkts partial explicit',
                            properties: { tool_lbrack: 'true' },
                            expected: { squarebkts: false }
                        },
                        {
                            label: 'roundbkts explicit true',
                            properties: { tool_lparen: 'true', tool_rparen: 'true' },
                            expected: { roundbkts: true }
                        },
                        {
                            label: 'roundbkts explicit false',
                            properties: { tool_lparen: 'false', tool_rparen: 'false' },
                            expected: { roundbkts: false }
                        },
                        {
                            label: 'roundbkts omitted',
                            properties: {},
                            expected: { roundbkts: false }
                        },
                        {
                            label: 'roundbkts partial explicit',
                            properties: { tool_lparen: 'true' },
                            expected: { roundbkts: false }
                        },
                        {
                            label: 'tool_matrix_2row explicit true',
                            properties: { tool_matrix_2row: 'true' },
                            expected: { tool_matrix_2row: true }
                        },
                        {
                            label: 'tool_matrix_2row explicit false',
                            properties: { tool_matrix_2row: 'false' },
                            expected: { tool_matrix_2row: false }
                        },
                        {
                            label: 'tool_matrix_2row omitted',
                            properties: {},
                            expected: { tool_matrix_2row: false }
                        },
                        {
                            label: 'tool_matrix_2row_2col explicit true',
                            properties: { tool_matrix_2row_2col: 'true' },
                            expected: { tool_matrix_2row_2col: true }
                        },
                        {
                            label: 'tool_matrix_2row_2col explicit false',
                            properties: { tool_matrix_2row_2col: 'false' },
                            expected: { tool_matrix_2row_2col: false }
                        },
                        {
                            label: 'tool_matrix_2row_2col omitted',
                            properties: {},
                            expected: { tool_matrix_2row_2col: false }
                        }
                    ];

                    _.forEach(cases, testCase => {
                        initQuestionState(QuestionState, testCase.properties);
                        assert.propEqual(
                            _.pick(capturedModule, _.keys(testCase.expected)),
                            testCase.expected,
                            testCase.label
                        );
                    });

                    assert.strictEqual(
                        Object.prototype.hasOwnProperty.call(capturedModule, 'tool_lbrack'),
                        false,
                        'captured state props do not expose tool_lbrack directly'
                    );
                    assert.strictEqual(
                        Object.prototype.hasOwnProperty.call(capturedModule, 'tool_rbrack'),
                        false,
                        'captured state props do not expose tool_rbrack directly'
                    );
                    assert.strictEqual(
                        Object.prototype.hasOwnProperty.call(capturedModule, 'tool_lparen'),
                        false,
                        'captured state props do not expose tool_lparen directly'
                    );
                    assert.strictEqual(
                        Object.prototype.hasOwnProperty.call(capturedModule, 'tool_rparen'),
                        false,
                        'captured state props do not expose tool_rparen directly'
                    );

                    assert.strictEqual(
                        capturedModule.allowNewLine,
                        false,
                        'non-target boolean props still use explicit false defaults in question state init'
                    );
                } finally {
                    teardown();
                    finalize();
                }
            }, function (error) {
                try {
                    assert.ok(false, `Failed to load ${questionStateModuleName}: ${error && error.message ? error.message : error}`);
                } finally {
                    teardown();
                    finalize();
                }
            });
        } catch (error) {
            try {
                assert.ok(false, `Unexpected error while requiring ${questionStateModuleName}: ${error && error.message ? error.message : error}`);
            } finally {
                teardown();
                finalize();
            }
        }
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

        assert.equal($container.length, 1, 'the item container exists');

        qtiItemRunner('qti', newItemData)
            .on('render', ready)
            .on('responsechange', response => $('#response-display').html(JSON.stringify(response, null, 2)))
            .on('error', error => $('#error-display').html(error))
            .init()
            .render($container);
    });
});
