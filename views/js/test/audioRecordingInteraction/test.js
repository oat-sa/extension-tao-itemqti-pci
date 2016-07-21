define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!qtiItemPci/test/audioRecordingInteraction/data/qti.json'
], function ($, _, qtiItemRunner, itemData){

    'use strict';

    var runner;
    // var fixtureContainerId = 'item-container';
    var fixtureContainerId = 'outside-container'; // <= use this to display result on screen

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
            name : 'portableElementLocation',
            handle : function handlePortableElementLocation(url){
                if(/audioRecordingInteraction/.test(url.toString())){
                    return '../../../qtiItemPci/views/js/pciCreator/dev/' + url.toString();
                }
            }
        }, {
            name : 'default',
            handle : function defaultStrategy(url){
                return url.toString();
            }
        }];

    module('Audio Recording Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    /* * /

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
                assert.equal($container.find('.qti-customInteraction .audioRecordingInteraction').length, 1, 'the container contains a Point Line Graph interaction');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .on('responsechange', function (response){
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* * /

    QUnit.asyncTest('enables to select a choice', function(assert){
        QUnit.expect(10);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){
                var $prehistory = $('.qti-choice[data-identifier="Prehistory"]', $container);

                assert.equal($container.find('.qti-interaction.qti-orderInteraction').length, 1, 'the container contains a choice interaction .qti-orderInteraction');
                assert.equal($container.find('.qti-orderInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                assert.equal($prehistory.length, 1, 'the Prehistory choice exists');

                interactUtils.tapOn($prehistory);
            })
            .on('statechange', function(state){

                assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 4, 'the choice list contains now 4 choices');
                assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 1, 'the result list contains now 1 choice');

                assert.ok(typeof state === 'object', 'The state is an object');
                assert.ok(typeof state.RESPONSE === 'object', 'The state has a response object');
                assert.deepEqual(state.RESPONSE, { response : { list  : { identifier : ['Prehistory'] } } }, 'The Prehistory response is selected');
                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to remove a choice', function(assert){
        QUnit.expect(7);

        var $container = $('#' + fixtureContainerId);
        var changes = 0;

        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){
                var $prehistory = $('.qti-choice[data-identifier="Prehistory"]', $container);

                interactUtils.tapOn($prehistory, function(){
                    interactUtils.tapOn($prehistory, function(){
                        var $removeChoice = $('.icon-remove-from-selection', $container);
                        interactUtils.tapOn($removeChoice);
                    }, 100);
                }, 100);
            })
            .on('statechange', function(state){
                changes++;
                if (changes === 1) {
                    assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 4, 'the choice list contains now 4 choices');
                    assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 1, 'the result list contains now 1 choice');
                    assert.deepEqual(state.RESPONSE, { response : { list  : { identifier : ['Prehistory'] } } }, 'The Prehistory response is selected');
                } else if (changes === 2) {
                    assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 5, 'the choice list contains now 5 choices');
                    assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 0, 'the result list contains now 0 choice');
                    assert.deepEqual(state.RESPONSE, { response : { list  : { identifier : [] } } }, 'The Prehistory response has been removed from selection');

                    QUnit.start();
                }
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('enables to reorder choices', function(assert){
        QUnit.expect(12);

        var $container = $('#' + fixtureContainerId);
        var changes = 0;

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){
                assert.equal($container.find('.qti-interaction.qti-orderInteraction').length, 1, 'the container contains a choice interaction .qti-orderInteraction');
                assert.equal($container.find('.qti-orderInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                var $prehistory = $('.qti-choice[data-identifier="Prehistory"]', $container);
                assert.equal($prehistory.length, 1, 'the Prehistory choice exists');

                var $antiquity = $('.qti-choice[data-identifier="Antiquity"]', $container);
                assert.equal($antiquity.length, 1, 'the Antiquity choice exists');

                interactUtils.tapOn($prehistory, function(){
                    interactUtils.tapOn($antiquity, function(){
                        assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 3, 'the choice list contains now 3 choices');
                        assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 2, 'the result list contains now 2 choice');

                        interactUtils.tapOn($antiquity,function(){
                            assert.ok($antiquity.hasClass('active'), 'The antiquity choice is now active');

                            interactUtils.tapOn($('.icon-move-before'));
                        }, 10);
                    }, 10);
                }, 10);
            })
            .on('statechange', function(state){
                changes++;
                if (changes === 1) {
                    assert.deepEqual(state.RESPONSE, {response: {list: {identifier: ['Prehistory']}}}, 'The response is ok');
                } else if (changes === 2) {
                    assert.deepEqual(state.RESPONSE, {response: {list: {identifier: ['Prehistory', 'Antiquity']}}}, 'The response is ok');
                } else if (changes === 3) {
                    assert.deepEqual(state.RESPONSE, { response : { list  : { identifier : ['Antiquity', 'Prehistory'] } } }, 'The response follows the reordering');
                    QUnit.start();
                }
            })
            .init()
            .render($container);
    });


    QUnit.asyncTest('set the default response', function(assert){
        QUnit.expect(6);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){

                assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 5, 'the choice list contains all choices');
                assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 0, 'the result list contains no choices');

                this.setState({ RESPONSE : { response : { list  : { identifier : ['Antiquity', 'Prehistory'] } } } });

                _.delay(function(){
                    assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 3, 'the choice list contains now 3 choices');
                    assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 2, 'the result list contains now 2 choices');

                    QUnit.start();
                }, 10);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('destroys', function(assert){
        QUnit.expect(4);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){
                var self = this;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                var $prehistory = $('.qti-choice[data-identifier="Prehistory"]', $container);
                assert.equal($prehistory.length, 1, 'the Prehistory choice exists');

                interactUtils.tapOn($prehistory, function(){

                    assert.deepEqual(self.getState(), {'RESPONSE': { response : { list : { identifier : [] } } } }, 'Click does not trigger response once destroyed');

                    QUnit.start();
                }, 100);
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('resets the response', function(assert){
        QUnit.expect(11);

        var $container = $('#' + fixtureContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', orderData)
            .on('render', function(){
                var self = this;

                assert.equal($container.find('.qti-interaction.qti-orderInteraction').length, 1, 'the container contains a choice interaction .qti-orderInteraction');
                assert.equal($container.find('.qti-orderInteraction .qti-choice').length, 5, 'the interaction has 5 choices');

                var $prehistory = $('.qti-choice[data-identifier="Prehistory"]', $container);
                assert.equal($prehistory.length, 1, 'the Prehistory choice exists');

                interactUtils.tapOn($prehistory, function(){
                    interactUtils.tapOn($prehistory, function(){
                        assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 4, 'the choice list contains now 4 choices');
                        assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 1, 'the result list contains now 1 choice');
                        assert.ok($prehistory.hasClass('active'), 'the Prehistory choice is active');

                        //call resetResponse manually
                        var interaction = self._item.getInteractions()[0];
                        interaction.renderer.resetResponse(interaction);

                        _.delay(function(){

                            assert.equal($container.find('.qti-orderInteraction .choice-area .qti-choice').length, 5, 'the choice list contains all choices');
                            assert.equal($container.find('.qti-orderInteraction .result-area .qti-choice').length, 0, 'the result list contains no choices anymore');
                            assert.ok(! $prehistory.hasClass('active'), 'the Prehistory choice is not active');

                            QUnit.start();
                        }, 100);
                    }, 100);
                }, 100);
            })
            .init()
            .render($container);
    });



    /* * /

    QUnit.asyncTest('response', function (assert){

        var response = {
            list : {
                string : [
                    "0.5 45",
                    "2.5 75",
                    "4 10",
                    "5.5 50"
                ]
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

                QUnit.start();

                assert.ok(_.isPlainObject(res), 'response changed');
                assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
            })
            .assets(strategies)
            .init()
            .render($container);

    });

    /* * /

    QUnit.asyncTest('state', function (assert){

        var response = {
            list : {
                string : [
                    "0.5 45",
                    "2.5 75",
                    "4 10",
                    "5.5 50"
                ]
            }
        };
        var state = {RESPONSE : response};
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){

                this.setState(state);
                assert.deepEqual(this.getState(), state, 'state set/get ok');
            })
            .on('responsechange', function (res){

                QUnit.start();

                //if the state has been set, the response should have changed
                assert.ok(_.isPlainObject(res), 'response changed');
                assert.ok(_.isPlainObject(res.RESPONSE), 'response identifier ok');
                assert.deepEqual(res.RESPONSE, response, 'response set/get ok');
            })
            .assets(strategies)
            .init()
            .render($container);

    });

    /* */

    module('Visual test');

    QUnit.asyncTest('display and play', function (assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                QUnit.start();
            })
            .on('responsechange', function (response){
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .on('error', function (error){
                $('#response-display').html(error);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

});

