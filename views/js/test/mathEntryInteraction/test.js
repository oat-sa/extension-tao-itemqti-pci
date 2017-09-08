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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/mathEntryInteraction/data/qti.json'
], function ($, _, qtiItemRunner, ciRegistry, pciTestProvider, itemData){

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    //manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'mathEntryInteraction',
        'qtiItemPci/pciCreator/dev/mathEntryInteraction/pciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());



    QUnit.module('Math Entry Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    /* */

    QUnit.asyncTest('renders correctly', function (assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){

                assert.equal($container.children().length, 1, 'the container a elements');
                assert.equal($container.children('.qti-item').length, 1, 'the container contains a the root element .qti-item');
                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains an interaction .qti-interaction');
                assert.equal($container.find('.qti-interaction.qti-customInteraction').length, 1, 'the container contains a custom interaction');
                assert.equal($container.find('.qti-customInteraction .mathEntryInteraction').length, 1, 'the container contains a Math Entry interaction');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('destroys', function(assert){
        var changeCounter = 0;
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(6);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                var $sqrt;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                $sqrt = $container.find('[data-identifier="sqrt"]');
                $sqrt.trigger('click');

            })
            .on('responsechange', function (res){
                changeCounter++;

                assert.equal(res.RESPONSE.base.string, '', 'click shouldnt trigger any response change after destroy');

                // the destroy process triggers 2 responseChange events
                if (changeCounter === 2) {
                    QUnit.start();
                }
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('resets the response', function(assert){
        var changeCounter = 0;
        var response = {
            base : {
                string: '\\frac{12}{\\pi}'
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                // first we set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res){
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
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('resets the response with gap expression', function(assert){
        var changeCounter = 0;
        var response = {
            list : {
                string: [
                    '\\frac{1}{2}',
                    '\\frac{1}{4}'
                ]
            }
        };
        var $container = $('#' + fixtureContainerId);

        var newItemData = _.cloneDeep(itemData);
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.useGapExpression = 'true';
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.gapExpression = '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses.responsedeclaration_59b29448bccf2756213375.cardinality = 'multiple';

        runner = qtiItemRunner('qti', newItemData)
            .on('render', function (){
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                // first we set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res){
                var interactions = this._item.getInteractions(),
                    interaction = interactions[0];
                changeCounter++;

                if (changeCounter === 1) {
                    interaction.resetResponse();
                } else if (changeCounter === 3) {
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.ok(_.isPlainObject(res.RESPONSE.list), 'response list is an object');
                    assert.ok(_.isArray(res.RESPONSE.list.string), 'response list string is an array');
                    assert.equal(res.RESPONSE.list.string[0], '', 'first response is empty');
                    assert.equal(res.RESPONSE.list.string[1], '', 'second response is empty');
                    QUnit.start();
                }
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get response', function (assert){
        var changeCounter = 0;
        var response = {
            base : {
                string: '\\frac{12}{\\pi}'
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                //set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res){
                changeCounter++;
                if (changeCounter === 1) { // so it runs only once
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                    QUnit.start();
                }
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('set and get response with gap expression', function (assert){
        var changeCounter = 0;
        var response = {
            list : {
                string: [
                    '\\frac{1}{2}',
                    '\\frac{1}{4}'
                ]
            }
        };
        var $container = $('#' + fixtureContainerId);

        var newItemData = _.cloneDeep(itemData);
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.useGapExpression = 'true';
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.gapExpression = '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses.responsedeclaration_59b29448bccf2756213375.cardinality = 'multiple';

        runner = qtiItemRunner('qti', newItemData)
            .on('render', function (){
                var interaction,
                    interactions = this._item.getInteractions();

                assert.equal(_.size(interactions), 1, 'one interaction');
                interaction = interactions[0];

                //set the response
                interaction.setResponse(response);
            })
            .on('responsechange', function (res){

                changeCounter++;
                if (changeCounter === 3) {
                    assert.ok(_.isPlainObject(res), 'response changed');
                    assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                    assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
                    QUnit.start();
                }
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get state', function (assert){
        var changeCounter = 0;
        var state = {
            RESPONSE: {
                base : {
                    string: '\\frac{12}{\\pi}'
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function (res){
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

    QUnit.asyncTest('set and get state with gap expression', function (assert){
        var changeCounter = 0;
        var state = {
            RESPONSE: {
                list : {
                    string: [
                        '\\frac{1}{2}',
                        '\\frac{1}{4}'
                    ]
                }
            }
        };
        var $container = $('#' + fixtureContainerId);

        var newItemData = _.cloneDeep(itemData);
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.useGapExpression = 'true';
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.gapExpression = '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses.responsedeclaration_59b29448bccf2756213375.cardinality = 'multiple';

        runner = qtiItemRunner('qti', newItemData)
            .on('render', function (){

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function (res){
                changeCounter++;
                if (changeCounter === 3) { // so it runs only once
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

    QUnit.asyncTest('display and play', function (assert){

        var $container = $('#outside-container');

        var newItemData = _.cloneDeep(itemData);
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.useGapExpression = 'true';
        newItemData.body.elements.interaction_portablecustominteraction_59b29448bdbf1249551660.properties.gapExpression = '\\frac{1}{2}+\\taoGap=\\frac{5}{4}-\\taoGap';
        newItemData.responses.responsedeclaration_59b29448bccf2756213375.cardinality = 'multiple';

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', newItemData)
            .on('render', function (){
                QUnit.start();
            })
            .on('responsechange', function (response){
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .init()
            .render($container);
    });

});

