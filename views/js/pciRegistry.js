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
                version : '1.0.0',
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
                creator : {
                    hook : 'likertScaleInteraction/pciCreator.js',
                    manifest : 'likertScaleInteraction/pciCreator.json',
                    model : null
                }
            }
        ]
    };
    
    function getAllVersions(){
        var all = {};
        _.forIn(_registry, function(versions, id){
            all[id] = _.map(versions, 'version');
        });
        return all;
    }
    
    function _get(typeIdentifier, version){

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
        var pci = _get(typeIdentifier, version);
        if(pci){
            return _.assign(pci.runtime, {baseUrl : pci.baseUrl});
        }else{
            throw 'no pci found';
        }
    }

    function getCreator(typeIdentifier, version){
        var pci = _get(typeIdentifier, version);
        if(pci && pci.creator){
            return _.assign(pci.creator, {
                baseUrl : pci.baseUrl,
                response : pci.response
            });
        }else{
            throw 'no pci found';
        }
    }

    function getBaseUrl(typeIdentifier, version){
        var runtime = _get(typeIdentifier, version);
        if(runtime){
            return runtime.baseUrl;
        }
        return '';
    }

    function loadRuntimes(callback, reload){
        if(_loaded && !reload){
            callback();
        }else{
            $.ajax({
                url : _serverUrl,
                dataType : 'json',
                type : 'GET'
            }).done(function (pcis){
                
                //test...
//                pcis = _registry0;

                _registry = pcis;

                //preconfiguring the pci's code baseUrl
                var requireConfigAliases = {};
                _.forIn(pcis, function (versions, typeIdentifier){
                    //currently use latest runtime path
                    requireConfigAliases[typeIdentifier] = getBaseUrl(typeIdentifier);
                });
                _requirejs.config({paths : requireConfigAliases});

                _loaded = true;
                callback();
            });
        }
    }

    function loadCreators(callback, reload){
        
        loadRuntimes(function (){
            var requiredCreators = [];
            
            _.forIn(_registry, function (versions, typeIdentifier){
                var pciModel = _get(typeIdentifier);//currently use the latest version only
                requiredCreators.push(pciModel.creator.hook.replace(/\.js$/, ''));
            });
            
            //@todo support caching
            _requirejs(requiredCreators, function (){
                var creators = {};
                _.each(arguments, function (creatorHook){
                    var id = creatorHook.getTypeIdentifier();
                    var pciModel = _get(id);
                    var i = _.findIndex(_registry[id], {version : pciModel.version});
                    if(i < 0){
                        throw 'no creator found for id/version ' + id + '/' + pciModel.version;
                    }else{
                        _registry[id][i].creator.module = creatorHook;
                        creators[id] = creatorHook;
                    }
                });
                callback(creators);
            });
        }, reload);
    }

    function getAuthoringData(typeIdentifier, version){
        var pciModel = _get(typeIdentifier, version);
        if(pciModel && pciModel.creator){
            return {
                label : pciModel.label, //currently no translation available 
                icon : pciModel.creator.icon.replace(new RegExp('^'+typeIdentifier+'\/'), pciModel.baseUrl),
                short : pciModel.short,
                description : pciModel.description,
                qtiClass : 'customInteraction.' + pciModel.typeIdentifier, //custom interaction is block type
                tags : _.union(['Custom Interactions'], pciModel.tags)
            };
        }
    }

    return {
        getAllVersions : getAllVersions,
        getRuntime : getRuntime,
        getCreator : getCreator,
        getAuthoringData : getAuthoringData,
        getBaseUrl : getBaseUrl,
        load : loadRuntimes,
        loadCreators : loadCreators
    };
});