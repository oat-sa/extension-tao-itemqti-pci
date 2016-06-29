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
define(['lodash', 'core/promise', 'core/eventifier', 'taoQtiItem/qtiCreator/helper/qtiElements'], function (_, Promise, eventifier, qtiElements){
    'use strict';

    function pciRegistryFactory(){
        
        var _requirejs = window.require;
        var _loaded = false;
        var _providers = [];
        var _registry = {};

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

        return eventifier({
            addProvider : function addProvider(provider){
                if(provider && _.isFunction(provider.load)){
                    _providers.push(provider);
                }
                return this;
            },
            getAllVersions : function getAllVersions(){
                var all = {};
                _.forIn(_registry, function (versions, id){
                    all[id] = _.map(versions, 'version');
                });
                return all;
            },
            getRuntime : function getRuntime(typeIdentifier, version){
                var pci = _get(typeIdentifier, version);
                if(pci){
                    return _.assign(pci.runtime, {baseUrl : pci.baseUrl});
                }else{
                    throw 'no pci found';
                }
            },
            getCreator : function getCreator(typeIdentifier, version){
                var pci = _get(typeIdentifier, version);
                if(pci && pci.creator){
                    return _.assign(pci.creator, {
                        baseUrl : pci.baseUrl,
                        response : pci.response
                    });
                }else{
                    throw 'no pci found';
                }
            },
            getAuthoringData : function getAuthoringData(typeIdentifier, version){
                var pciModel = _get(typeIdentifier, version);
                if(pciModel && pciModel.creator && pciModel.creator.hook && pciModel.creator.icon){
                    return {
                        label : pciModel.label, //currently no translation available 
                        icon : pciModel.creator.icon.replace(new RegExp('^' + typeIdentifier + '\/'), pciModel.baseUrl),
                        short : pciModel.short,
                        description : pciModel.description,
                        qtiClass : 'customInteraction.' + pciModel.typeIdentifier, //custom interaction is block type
                        tags : _.union(['Custom Interactions'], pciModel.tags)
                    };
                }
            },
            getBaseUrl : function getBaseUrl(typeIdentifier, version){
                var runtime = _get(typeIdentifier, version);
                if(runtime){
                    return runtime.baseUrl;
                }
                return '';
            },
            loadRuntimes : function loadRuntimes(callback, reload){

                var self = this;
                var loadStack = [];

                if(_loaded && !reload){
                    callback();
                    self.trigger('runtimesloaded');
                }else{

                    _.each(_providers, function (provider){
                        loadStack.push(provider.load());
                    });

                    //performs the loadings in parallel
                    Promise.all(loadStack).then(function (results){

                        var requireConfigAliases = {};

                        //update registry
                        _registry = _.reduce(results, function (acc, _pcis){
                            return _.merge(acc, _pcis);
                        }, {});

                        //preconfiguring the pci's code baseUrl
                        _.forIn(_registry, function (versions, typeIdentifier){
                            //currently use latest runtime path
                            requireConfigAliases[typeIdentifier] = self.getBaseUrl(typeIdentifier);
                        });
                        _requirejs.config({paths : requireConfigAliases});

                        _loaded = true;
                        
                        callback();
                        self.trigger('runtimesloaded');
                        
                    }).catch(function (err){
                        
                        self.trigger('error', err);
                    });
                }
            },
            loadCreators : function loadCreators(callback, reload){
                
                var self = this;
                this.loadRuntimes(function (){
                    var requiredCreators = [];

                    _.forIn(_registry, function (versions, typeIdentifier){
                        var pciModel = _get(typeIdentifier);//currently use the latest version only
                        if(pciModel.creator && pciModel.creator.hook){
                            requiredCreators.push(pciModel.creator.hook.replace(/\.js$/, ''));
                        }
                    });

                    if(requiredCreators.length){
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
                                    if(true){//if pci
                                        //register into the qtiElements list
                                        qtiElements.classes['customInteraction.' + id] = {parents : ['customInteraction'], qti : true};
                                    }
                                }
                            });
                            callback(creators);
                            self.trigger('creatorsloaded');
                        });
                    }else{
                        callback({});
                        self.trigger('creatorsloaded');
                    }

                }, reload);
                
            }
        });
    };
    
    //singleton
    return pciRegistryFactory();
});