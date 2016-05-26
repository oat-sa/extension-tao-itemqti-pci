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
    
    var _requirejs = window.require;
    var _serverUrl = helpers._url('load', 'PciLoader', 'qtiItemPci');
    var _loaded = false;
    var _registry = {};
    
    var _registry0 = {
        likertScaleInteraction : [
            {
                version : '0.1.0',
                baseUrl : 'http://tao.localdomain/qtiItemPci/views/js/pciCreator/dev/likertScaleInteraction',
                runtime : {
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
                },
                creator:{
                    hook : 'likertScaleInteraction/pciCreator.js',
                    manifest : {},
                    creator : null
                }
            }
        ]
    };

    function get(typeIdentifier, version){
        
        if(_registry[typeIdentifier]){
            //check version
            if(version){
                return _.find(_registry[typeIdentifier], version);
            }else{
                //latest
                return _.last(_registry[typeIdentifier]);
            }
        }
    }
    
    function getRuntime(typeIdentifier, version){
        var pci = get(typeIdentifier, version);
        if(pci){
            return _.assign(pci.runtime, {baseUrl : pci.baseUrl});
        }else{
            throw 'no pci found';
        }
    }
    
    function getCreator(typeIdentifier, version){
        var pci = get(typeIdentifier, version);
        if(pci){
            return _.assign(pci.creator, {baseUrl : pci.baseUrl});
        }else{
            throw 'no pci found';
        }
    }
    
    function getBaseUrl(typeIdentifier, version){
        var runtime = get(typeIdentifier, version);
        if(runtime){
            return runtime.baseUrl;
        }
        return '';
    }
    
    function loadRuntimes(cb){
        if(_loaded){
            cb();
        }else{
            $.ajax({
                url: _serverUrl,
                dataType : 'json',
                type: 'GET'
            }).done(function(pcis) {
                console.log('load loadRuntimes');
                
                //test...
                pcis = _registry0;
                
                _registry = pcis;
                
                //preconfiguring the pci's code baseUrl
                var requireConfigAliases = {};
                _.forIn(pcis, function(versions, typeIdentifier){
                    //currently use latest runtime path
                    requireConfigAliases[typeIdentifier] = getBaseUrl(typeIdentifier);
                });
                _requirejs.config({paths : requireConfigAliases});
                
                _loaded = true;
                cb();
            });
        }
    }
    
    function loadCreators(cb){
        loadRuntimes(function(){
            var required = [];
            var versions = [];
            //currently use the latest version only
            _.forIn(_registry, function(versions, typeIdentifier){
                required.push(getCreator(typeIdentifier).hook);
            });
            _requirejs(required, function(){
                var creators = {};
                _.each(arguments, function(creator){
                    var id = creator.getTypeIdentifier();
                    creators[id] = creator;
                    _registry[id].creator = creator;
                    //load manifest....
                });
                callback(creators);
            });
        });
    }
    
    return {
        get : get,
        getRuntime : getRuntime,
        getCreator : getCreator,
        getBaseUrl : getBaseUrl,
        load : loadRuntimes,
        loadCreators : loadCreators
    };
});