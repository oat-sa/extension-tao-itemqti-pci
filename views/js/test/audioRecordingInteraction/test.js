define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'taoQtiItem/portableElementRegistry/provider/localManifestProvider',
    'json!qtiItemPci/test/audioRecordingInteraction/data/qti.json'
], function ($, _, qtiItemRunner, ciRegistry, pciTestProvider,  itemData){

    'use strict';

    var runner;
    var fixtureContainerId = 'item-container';

    //manually register the pci from its manifest
    pciTestProvider.addManifestPath(
        'audioRecordingInteraction',
        'qtiItemPci/pciCreator/dev/audioRecordingInteraction/pciCreator.json');
    ciRegistry.resetProviders();
    ciRegistry.registerProvider(pciTestProvider.getModuleName());


    module('Audio Recording Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    // This is for PhantomJS compatibility
    function supportsMediaRecorder() {
        if (!window.MediaRecorder) {
            QUnit.assert.ok(true, 'skipping test...');
            QUnit.start();
            return false;
        }
        return true;
    }

    /* */

    QUnit.asyncTest('renders correctly', function (assert){

        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
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
                .init()
                .render($container);
        }
    });

    /* */

    QUnit.asyncTest('destroys', function(assert){
        var $container = $('#' + fixtureContainerId);

        QUnit.expect(3);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
            runner = qtiItemRunner('qti', itemData)
                .on('render', function(){
                    var $controls;

                    //call destroy manually
                    var interaction = this._item.getInteractions()[0];
                    interaction.renderer.destroy(interaction);

                    $controls = $('.audiorec-control', $container);
                    assert.equal($controls.length, 0, 'recorder has been destroyed');

                    QUnit.start();
                    try {
                        interaction.renderer.destroy(interaction);
                    } catch(e){
                        console.log(e);
                    }
                })
                .on('error', function (error){
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        }
    });

    /* */

    QUnit.asyncTest('resets the response', function(assert){
        var changeCounter = 0;
        var response = {
            base : {
                file: {
                    name: 'myFileToBeReseted',
                    mime: 'audio/wav',
                    data: 'base64encodedData'
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
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
                        assert.ok(_.isNull(res.RESPONSE.base.file), 'response record is empty');
                        QUnit.start();
                    }
                })
                .on('error', function (error){
                    $('#error-display').html(error);
                })
                .init()
                .render($container);
        }
    });

    /* */

    QUnit.asyncTest('set and get response', function (assert){
        var changeCounter = 0;
        var response = {
            base : {
                file: {
                    name: 'myFileToBeReseted',
                    mime: 'audio/wav',
                    data: 'base64encodedData'
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
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
        }
    });

    /* */

    QUnit.asyncTest('set and get state', function (assert){
        var changeCounter = 0;
        var state = {
            RESPONSE: {
                base : {
                    file: {
                        name: 'myFileToBeReseted',
                        mime: 'audio/wav',
                        data: 'base64encodedData'
                    }
                }
            }
        };
        var $container = $('#' + fixtureContainerId);
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        if (supportsMediaRecorder()) {
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
        }
    });

    /* */

    module('Visual test');

    QUnit.asyncTest('display and play', function (assert){

        var $container = $('#outside-container');
        assert.equal($container.length, 1, 'the item container exists');

        if (supportsMediaRecorder()) {
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
                .init()
                .render($container);
        }
    });

     /* */

});

