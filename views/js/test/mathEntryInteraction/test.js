define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!qtiItemPci/test/mathEntryInteraction/data/qti.json'
], function ($, _, qtiItemRunner, itemData){

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    //override asset loading in order to resolve it from the runtime location
    var strategies = [{
        name : 'portableElementLocation',
        handle : function handlePortableElementLocation(url){
            if(/mathEntryInteraction/.test(url.toString())){
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
                assert.equal($container.find('.qti-customInteraction .mathEntryInteraction').length, 1, 'the container contains a Point Line Graph interaction');
                assert.equal($container.find('.qti-customInteraction .prompt').length, 1, 'the interaction contains a prompt');

                QUnit.start();
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('destroys', function(assert){
        var $container = $('#' + fixtureContainerId);
        var onerrorBackup = window.onerror;

        QUnit.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function(){
                var $record;

                //call destroy manually
                var interaction = this._item.getInteractions()[0];
                interaction.renderer.destroy(interaction);

                window.onerror = function() {
                    assert.ok(true, 'recorder has been destroyed');
                    window.onerror = onerrorBackup;
                    QUnit.start();
                };

                $record = $('.audiorec-control[data-identifier="record"]', $container);
                $record.addClass('enabled');
                $record.trigger('click');
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
            record: [
                {
                    name: 'recording',
                    base : {
                        file: {
                            name: 'myFileToBeReseted',
                            mime: 'audio/wav',
                            data: 'base64encodedData'
                        }
                    }
                },
                {
                    name: 'recordsAttempts',
                    base : {
                        integer: 2
                    }
                }
            ]
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
                    assert.ok(_.isArray(res.RESPONSE.record), 'response record is an array');
                    assert.ok(res.RESPONSE.record.length, 0, 'response record is empty');
                    QUnit.start();
                }
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get response', function (assert){
        var changeCounter = 0;
        var response = {
            record: [
                {
                    name: 'recording',
                    base : {
                        file: {
                            name: 'myFile',
                            mime: 'audio/wav',
                            data: 'base64encodedData'
                        }
                    }
                },
                {
                    name: 'recordsAttempts',
                    base : {
                        integer: 2
                    }
                }
            ]
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
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */

    QUnit.asyncTest('set and get state', function (assert){
        var changeCounter = 0;
        var state = {
            RESPONSE: {
                record: [
                    {
                        name: 'recording',
                        base : {
                            file: {
                                name: 'myOtherFile',
                                mime: 'audio/wav',
                                data: 'base64encodedDataAgain'
                            }
                        }
                    },
                    {
                        name: 'recordsAttempts',
                        base : {
                            integer: 2
                        }
                    }
                ]
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
            .assets(strategies)
            .init()
            .render($container);
    });

    /* */

    module('Visual test');

    QUnit.asyncTest('display and play', function (assert){

        var $container = $('#outside-container');
        assert.equal($container.length, 1, 'the item container exists');

        runner = qtiItemRunner('qti', itemData)
            .on('render', function (){
                QUnit.start();
            })
            .on('responsechange', function (response){
                $('#response-display').html(JSON.stringify(response, null, 2));
            })
            .on('error', function (error){
                $('#error-display').html(error);
            })
            .assets(strategies)
            .init()
            .render($container);
    });

});

