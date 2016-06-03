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
 * Copyright (c) 2016 (original work) Open Assessment Technlogies SA;
 *
 */
define(['jquery', 'lodash', 'core/promise'], function ($, _, Promise){
    'use strict';

    var _requirejs = window.require;
    var _loaded = false;
    var _providers = [];
    var _registry = {};

    function getAllVersions(){
        var all = {};
        _.forIn(_registry, function (versions, id){
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
    
    function addProvider(provider){
        if(provider && _.isFunction(provider.load)){
            _providers.push(provider);
        }
        return this;
    }
    
    function loadRuntimes(callback, reload){
        
        var loadStack = [];
        
        if(_loaded && !reload){
            callback();
        }else{
            
            _.each(_providers, function(provider){
                loadStack.push(provider.load());
            });
            
            //performs the loadings in parrallel
            Promise.all(loadStack).then(function(results){
                
                var requireConfigAliases = {};
                
                //update registry
                _registry = _.reduce(results, function(acc, _pcis){
                    return _.merge(acc, _pcis);
                }, {});

                //preconfiguring the pci's code baseUrl
                _.forIn(_registry, function (versions, typeIdentifier){
                    //currently use latest runtime path
                    requireConfigAliases[typeIdentifier] = getBaseUrl(typeIdentifier);
                });
                _requirejs.config({paths : requireConfigAliases});

                _loaded = true;
                
                //@todo eventify it and fires event
                callback();
            }).catch(function(err){
//                self.trigger('error', err);
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
                icon : pciModel.creator.icon.replace(new RegExp('^' + typeIdentifier + '\/'), pciModel.baseUrl),
                short : pciModel.short,
                description : pciModel.description,
                qtiClass : 'customInteraction.' + pciModel.typeIdentifier, //custom interaction is block type
                tags : _.union(['Custom Interactions'], pciModel.tags)
            };
        }
    }

    return {
        addProvider : addProvider,
        getAllVersions : getAllVersions,
        getRuntime : getRuntime,
        getCreator : getCreator,
        getAuthoringData : getAuthoringData,
        getBaseUrl : getBaseUrl,
        load : loadRuntimes,
        loadCreators : loadCreators
    };
});