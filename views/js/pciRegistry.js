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
 * Copyright (c) 201 (original work) Open Assessment Technlogies SA;
 *
 */
define(['jquery', 'lodash', 'helpers'], function ($, _, helpers){
    'use strict';
    
    var _serverUrl = helpers._url('load', 'PciLoader', 'qtiItemPci');
    var _loaded = false;
    var _registry = {};
    
    var _registry0 = {
        likertScaleInteraction : {
            '0.1.0' : {
                runtimeLocation : 'http://tao.localdomain/qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction',
                hook : 'likertScaleInteraction/runtime/likertScaleInteraction.amd.js',
                libs : [
                    'likertScaleInteraction/runtime/js/renderer'
                ],
                stylesheets : [
                    'likertScaleInteraction/runtime/css/likertScaleInteraction.css'
                ],
                mediaFiles : [
                    'likertScaleInteraction/runtime/assets/ThumbUp.png',
                    'likertScaleInteraction/runtime/assets/ThumbDown.png'
                ]
            }
        }
    };

    function getRuntime(typeIdentifier, version){
        
        if(_registry[typeIdentifier]){
            //check version
            if(version){
                return _registry[typeIdentifier][version] || null;
            }else{
                //latest
                return _.values(_registry[typeIdentifier])[0];
            }
        }
    }
    
    function getRuntimeLocation(typeIdentifier, version){
        var runtime = getRuntime(typeIdentifier, version);
        if(runtime){
            return runtime.runtimeLocation;
        }
        return '';
    }
    
    function load(cb){
        if(_loaded){
            cb();
        }else{
            $.ajax({
                url: _serverUrl,
                dataType : 'json',
                type: 'GET'
            }).done(function(pcis) {
                _registry = pcis;
                _loaded = true;
                cb();
            });
        }
    }
    
    return {
        getRuntime : getRuntime,
        getRuntimeLocation : getRuntimeLocation,
        load : load
    };
});