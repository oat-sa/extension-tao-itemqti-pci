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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'util/url',
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'text!qtiItemPci/test/likertInteraction/data/likert_triple/qti.xml'
], function ($, _, url, assetManagerFactory, assetStrategies, portableAssetStrategy, qtiItemRunner, ciRegistry, pciTestProvider, likertTripleXml) {

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    function getAssetManager(baseUrl) {
        return assetManagerFactory([
            assetStrategies.external,
            assetStrategies.baseUrl,
            portableAssetStrategy
        ], {baseUrl: baseUrl || ''});
    }

    function parseXml(xml) {
        return new Promise(function (resolve, reject) {
            $.ajax({
                    url: url.route('getJson', 'Parser', 'taoQtiItem'),
                    type: 'POST',
                    contentType: 'text/xml',
                    dataType: 'json',
                    data: xml
                })
                .done(function (response) {
                    return resolve(response.itemData);
                })
                .fail(function (xhr) {
                    return reject(new Error(xhr.status + ' : ' + xhr.statusText));
                });
        });
    }

    //manually register the pci from its manifest
    pciTestProvider.addManifestPath('likertInteraction', 'qtiItemPci/pciCreator/dev/likertInteraction/pciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());

    QUnit.module('Likert Interaction', {
        teardown: function () {
            if (runner) {
                //runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correctly', function (assert) {

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/qtiItemPci/views/js/test/likertInteraction/data/likert_triple/');
            runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    assert.equal($container.children().length, 1, 'the container a elements');
                    assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                    assert.equal($container.find('.qti-interaction').length, 3, 'the container contains 3 interactions .qti-interaction');
                    assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 3, 'the container contains 3 custom interactions');
                    assert.equal($container.find('.qti-customInteraction .likertInteraction').length, 3, 'the container contains 3 likert interactions');
                    assert.equal($container.find('.qti-customInteraction .prompt').length, 3, 'the interaction contains 3 prompts');

                    QUnit.start();
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

    QUnit.asyncTest('state', function (assert) {

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/qtiItemPci/views/js/test/likertInteraction/data/likert_triple/');
            runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    var self = this;

                    this.setState({
                        likert1: {response: {base: {integer: 1}}},
                        likert2: {response: {base: {integer: 3}}}
                    });

                    _.delay(function(){
                        assert.equal($('input:radio[name=likert1]:checked').val(), '1', 'likert 1 state set');
                        assert.equal($('input:radio[name=likert2]:checked').val(), '3', 'likert 2 state set');
                        assert.equal($('input:radio[name=likert3]:checked').val(), undefined, 'likert 3 state untouched');

                        assert.deepEqual(self.getState(), {
                            likert1: {response: {base: {integer: 1}}},
                            likert2: {response: {base: {integer: 3}}},
                            likert3: {response: {base: {integer: 0}}},
                        }, 'state ok');

                        QUnit.start();
                    }, 100);
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        });
    });

    QUnit.asyncTest('state standard', function (assert) {

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        parseXml(likertTripleXml).then(function (itemData) {
            var assetManager = getAssetManager('/qtiItemPci/views/js/test/likertInteraction/data/likert_triple/');
            runner = qtiItemRunner('qti', itemData, {assetManager: assetManager})
                .on('render', function () {

                    assert.equal($('input:radio[name=likert1]:checked').val(), '2', 'likert 1 state set');
                    assert.equal($('input:radio[name=likert2]:checked').val(), '5', 'likert 2 state set');
                    assert.equal($('input:radio[name=likert3]:checked').val(), undefined, 'likert 3 state untouched');

                    assert.deepEqual(this.getState(), {
                        likert1: {response: {base: {integer: 2}}},
                        likert2: {response: {base: {integer: 5}}},
                        likert3: {response: {base: {integer: 0}}},
                    }, 'state ok');

                    QUnit.start();
                })
                .on('error', function (error) {
                    $('#error-display').html(error);
                })
                .init()
                .render($container, {
                    state : {
                        likert1: {response: {base: {integer: 2}}},
                        likert2: {response: {base: {integer: 5}}}
                    }
                });
        });
    });

    return;
    /* */

    QUnit.asyncTest('destroys', function (assert) {
        var changeCounter = 0;
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(6);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {
                var $sqrt;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                $sqrt = $container.find('[data-identifier="sqrt"]');
                $sqrt.trigger('click');

            })
            .on('responsechange', function (res) {
                changeCounter++;

                assert.equal(res.RESPONSE.base.string, '', 'click shouldnt trigger any response change after destroy');

                // the destroy process triggers 2 responseChange events
                if (changeCounter === 2) {
                    QUnit.start();
                }
            })
            .on('error', function (error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('resets the response', function (assert) {
        var changeCounter = 0;
        var response = {
            base: {
                string: '\\frac{12}{\\pi}'
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                // first we set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res) {
                var interactions = this._item.getInteractions(),
                    interaction = interactions[0];
                changeCounter++;

                if (changeCounter === 1) {
                    interaction.resetResponse();
                } else if (changeCounter === 2) {
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.ok(_.isPlainObject(res.RESPONSE.base), 'response base is an object');
                    assert.equal(res.RESPONSE.base.string, '', 'response base string is empty');
                    QUnit.start();
                }
            })
            .on('error', function (error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get response', function (assert) {
        var changeCounter = 0;
        var response = {
            base: {
                string: '\\frac{12}{\\pi}'
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                //set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res) {
                changeCounter++;
                if (changeCounter === 1) { // so it runs only once
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                    QUnit.start();
                }
            })
            .on('error', function (error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get state', function (assert) {
        var changeCounter = 0;
        var state = {
            RESPONSE: {
                base: {
                    string: '\\frac{12}{\\pi}'
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function (res) {
                changeCounter++;
                if (changeCounter === 1) { // so it runs only once
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res, state, 'response set/get ok');

                    QUnit.start();
                }
            })
            .init()
            .render($container);
    });

    /* */

    module('Visual test');

    QUnit.asyncTest('display and play', function (assert) {

        var $container = $('#outside-container');
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function () {
                QUnit.start();
            })
            .on('responsechange', function (response) {
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .on('error', function (error) {
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

});

