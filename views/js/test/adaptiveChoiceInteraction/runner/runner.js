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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
define([
    'jquery',
    'lodash',
    'taoQtiItem/runner/qtiItemRunner',
    'json!qtiItemPci/test/adaptiveChoiceInteraction/samples/sample.json'
], function($, _, qtiItemRunner, choiceData){
    'use strict';
    var runner,
        fixtureContainerId = 'item-container',
        outsideContainerId = 'outside-container';
    
    module('Choice Interaction', {
        teardown : function(){
            if(runner){
                runner.clear();
            }
        }
    });

    QUnit.asyncTest('renders correclty', function(assert){
        QUnit.expect(3);
        var $container = $('#' + fixtureContainerId);
        
        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');
        
        runner = qtiItemRunner('qti', choiceData.itemData)
            .on('render', function(){
                assert.equal($container.children().length, 1, 'the container a elements');

                QUnit.start();
            })
            .init()
            .render($container);
    });
    
    QUnit.asyncTest('Display and play', function(assert){
        QUnit.expect(4);

        var $container = $('#' + outsideContainerId);

        assert.equal($container.length, 1, 'the item container exists');
        assert.equal($container.children().length, 0, 'the container has no children');

        qtiItemRunner('qti', choiceData.itemData)
            .on('render', function(){

                assert.equal($container.find('.qti-interaction').length, 1, 'the container contains a choice interaction');
                assert.equal($container.find('.qti-choice').length, 3, 'the interaction has 3 choices');
                QUnit.start();
            })
            .init()
            .render($container);
    });
});