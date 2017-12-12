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
define(['taoQtiItem/portableLib/jquery_2_1_1', 'likertCompactInteraction/likert/runtime/js/assets'], function($, assets){
    'use strict';

    function renderChoices(id, $container, config){

        var i,
            $li,
            level = parseInt(config.level) || 5,
            $ul = $container.find('ul.likert');
        
        //ensure that renderChoices() is idempotent
        $ul.empty();
        
        //add levels
        for(i = 1; i <= level; i++){

            $li = $('<li>', {'class' : 'likert'});
            $li.append($('<input>', {type : 'radio', name : id, value : i}));

            $ul.append($li);
        }
    }

    function renderLabels($container, config){

        var $ul = $container.find('ul.likert');
        var $labelMin = $('<span>', {'class' : 'likert-label likert-label-min'}).html(config['label-min']);
        var $labelMax = $('<span>', {'class' : 'likert-label likert-label-max'}).html(config['label-max']);

        $ul.before($labelMin).before(assets.thumbDown);
        $ul.after($labelMax).after(assets.thumbUp);
    }

    return {
        render : function(id, container, config, assetManager){

            var $container = $(container);

            renderChoices(id, $container, config);
            renderLabels($container, config, assetManager);
        },
        renderChoices : function(id, container, config){
            renderChoices(id, $(container), config);
        }
    };
});