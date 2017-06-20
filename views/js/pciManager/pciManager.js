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
define([
    'jquery',
    'i18n',
    'lodash',
    'helpers',
    'ui/component',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'tpl!qtiItemPci/pciManager/tpl/listing',
    'tpl!qtiItemPci/pciManager/tpl/packageMeta',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'taoQtiItem/portableElementRegistry/ciRegistry',
    'async',
    'ui/dialog/confirm',
    'ui/deleter',
    'ui/feedback',
    'ui/modal',
    'ui/uploader',
    'ui/filesender'
], function($, __, _, helpers, component, layoutTpl, listingTpl, packageMetaTpl, interactionsToolbar, ciRegistry, async, confirmBox, deleter, feedback){
    'use strict';

    var ns = '.pcimanager';

    var _fileTypeFilters = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'],
        _fileExtFilter = /.+\.(zip)$/;

    var _urls = {
        load : helpers._url('getRegisteredImplementations', 'PciManager', 'qtiItemPci'),
        disable : helpers._url('disable', 'PciManager', 'qtiItemPci'),
        enable : helpers._url('enable', 'PciManager', 'qtiItemPci'),
        verify : helpers._url('verify', 'PciManager', 'qtiItemPci'),
        add : helpers._url('add', 'PciManager', 'qtiItemPci')
    };

    function validateConfig(config){
        if(!config.interactionSidebar || !(config.interactionSidebar instanceof $)){
            throw new Error('Invalid container in config object : missing interaction sidebar');
        }
    }

    function PciManager(initConfig){
        //creates the container from the layout template
        //var $container = $(layoutTpl());
        //config.container.append($container);
        var listing = {};
        var _defaults = {};
        var pciManager = {
            open: function open(){
                this.trigger('showListing');
                this.getElement().modal('open');
            }
        };

        var config = initConfig;

        validateConfig(initConfig);

        return component(pciManager, _defaults)
            .setTemplate(layoutTpl)
            .on('destroy', function() {
                console.log('destroyed');
            })
            .on('showListing', function(){
                var $fileSelector = this.getElement().find('.file-selector'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a');

                $switcher.filter('.upload').css({display : 'inline-block'});
                $switcher.filter('.listing').hide();

                $uploader.hide();
                $title.text(__('Manage custom interactions'));

                this.trigger('updateListing');
            })
            .on('hideListing', function(){
                var $fileSelector = this.getElement().find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a');

                $switcher.filter('.upload').hide();
                $switcher.filter('.listing').css({display : 'inline-block'});

                $fileContainer.hide();
                $placeholder.hide();
                $title.text(__('Upload new custom interaction (zip package)'));

                $uploader.uploader('reset');
                $uploader.show();
            })
            .on('updateListing', function(){
                var $fileSelector = this.getElement().find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a'),
                    $uploadForm;

                if(_.size(listing)){

                    $placeholder.hide();

                    $fileContainer
                        .empty()
                        .html(
                            listingTpl({
                                interactions : listing
                            }))
                        .show();

                }else{

                    $fileContainer.hide();
                    $placeholder.show();
                }
            })
            .on('pciEnabled', function(){
                this.trigger('updateListing');
            })
            .on('pciDisabled', function(){
                this.trigger('updateListing');
            })
            .on('render', function() {

                //init variables:
                var self = this,
                    $container = this.getElement(),
                    $fileSelector = $container.find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a'),
                    $uploadForm;

                //init modal box
                $container.modal({
                    startClosed : true,
                    minWidth : 450
                });

                //load list of custom interactions from server
                loadListingFromServer(function(data){
                    //note : init as empty object and not array otherwise _.size will fail later
                    listing = _.size(data) ? data : {};
                    self.trigger('updateListing', data);
                });

                //init event listeners
                initEventListeners();
                initUploader();

                /**
                 * Below are all function definitions
                 */

                function loadListingFromServer(callback){

                    $.getJSON(_urls.load, function(data){
                        callback(data);
                    });
                }

                function initEventListeners(){

                    deleter($fileContainer);

                    $fileContainer.on('click', 'li[data-type-identifier] a[data-role=enable]', function(){
                        var $li = $(this).closest('.pci-list-element');
                        var typeIdentifier = $li.data('type-identifier');
                        $li.removeClass('disabled');
                        $.getJSON(_urls.enable, {typeIdentifier : typeIdentifier}, function(data){
                            if(data.success){
                                listing[typeIdentifier].enabled = true;
                                self.trigger('pciEnabled', typeIdentifier);
                            }
                        });
                    }).on('click', 'li[data-type-identifier] a[data-role=disable]', function(){
                        var $li = $(this).closest('.pci-list-element');
                        var typeIdentifier = $li.data('type-identifier');
                        $li.addClass('disabled');
                        $.getJSON(_urls.disable, {typeIdentifier : typeIdentifier}, function(data){
                            if(data.success){
                                listing[typeIdentifier].enabled = false;
                                self.trigger('pciDisabled', typeIdentifier);
                            }
                        });
                    });

                    //switch to upload mode
                    $switcher.click(function(e){
                        e.preventDefault();
                        if($uploader.css('display') === 'none'){
                            self.trigger('hideListing');
                        }else{
                            self.trigger('showListing');
                        }
                    });

                    return;
                    //when a pci is created add required resources :
                    $(document).on('resourceadded.qti-creator.qti-hook-pci', function(e, typeIdentifier, resources, interaction){
                        console.log('resourceadded.qti-creator.qti-hook-pci');
                        //render new stylesheet:
                        var reqPaths = [];
                        _.each(resources, function(res){
                            if(/\.css$/.test(res)){
                                reqPaths.push('css!'+typeIdentifier + '/' + res);
                            }
                        });
                        if(reqPaths.length){
                            require(reqPaths);
                        }
                    });
                }

                function add(interactionHook){
                    console.log('DEPRECTEAD');
                    return;
                    self.trigger('pciAdded', interactionHook.typeIdentifier);
                    var id = interactionHook.typeIdentifier;

                    listing[id] = interactionHook;

                    //for backward compatibility only
                    $container.trigger('added' + ns, [interactionHook]);

                    return ciRegistry.loadCreators({reload: true, enabledOnly : true}).then(function(){
                        var data = ciRegistry.getAuthoringData(id);
                        if(data.tags && data.tags[0] === interactionsToolbar.getCustomInteractionTag()){
                            if(!interactionsToolbar.exists(config.interactionSidebar, data.qtiClass)){

                                //add toolbar button
                                var $insertable = interactionsToolbar.add(config.interactionSidebar, data);

                                //init insertable
                                var $itemBody = $('.qti-itemBody');//current editor instance
                                $itemBody.gridEditor('addInsertables', $insertable, {
                                    helper : function(){
                                        return $(this).find('.icon').clone().addClass('dragging');
                                    }
                                });
                            }
                        }else{
                            throw 'invalid authoring data for custom interaction';
                        }
                    });
                }

                function initUploader(){

                    var errors = [],
                        selectedFiles = {};

                    $uploader.on('upload.uploader', function(e, file, interactionHook){

                        console.log('SHOULD NOT BE CALLED');
                        add(interactionHook);

                    }).on('fail.uploader', function(e, file, err){

                        errors.push(__('Unable to upload file %s : %s', file.name, err));

                    }).on('end.uploader', function(){

                        if(errors.length === 0){
                            //timeout to give time to the user to realize that the upload is other and now transitioning to another view
                            _.delay(function(){
                                self.trigger('showListing');
                            }, 500);
                        }else{
                            feedback().error("<ul><li>" + errors.join('</li><li>') + "</li></ul>", {encodeHtml: false});
                        }
                        //reset errors
                        errors = [];

                    }).on('create.uploader', function(){

                        //get ref to the uploadForm for later verification usage
                        $uploadForm = $uploader.parent('form');

                    }).on('fileselect.uploader', function(){

                        $uploadForm.find('li[data-file-name]').each(function(){

                            var $li = $(this),
                                filename = $li.data('file-name'),
                                packageMeta = selectedFiles[filename];

                            if(packageMeta){
                                //update label:
                                $li.prepend(packageMetaTpl(packageMeta));
                            }
                        });

                    });

                    $uploader.uploader({
                        upload : true,
                        multiple : true,
                        uploadUrl : _urls.add,
                        fileSelect : function fileSelect(files, done){

                            var givenLength = files.length;

                            //check the mime-type
                            files = _.filter(files, function(file){
                                // for some weird reasons some browsers have quotes around the file type
                                var checkType = file.type.replace(/("|')/g, '');
                                return _.contains(_fileTypeFilters, checkType) || (checkType === '' && _fileExtFilter.test(file.name));
                            });

                            if(files.length !== givenLength){
                                feedback().error('Invalid files have been removed');
                            }

                            //reset selectedFiles list
                            selectedFiles = {};

                            //verify selected files
                            async.filter(files, verify, done);
                        }
                    });

                    function verify(file, cb){

                        $uploadForm.sendfile({
                            url : _urls.verify,
                            file : file,
                            loaded : function(r){

                                function done(ok){
                                    if(ok){
                                        selectedFiles[file.name] = {
                                            typeIdentifier : r.typeIdentifier,
                                            label : r.label,
                                            version : r.version
                                        };
                                    }
                                    cb(ok);
                                }

                                if(r.valid){
                                    if(r.exists){
                                        confirmBox(
                                            __('There is already one interaction with the same identifier "%s" (label : "%s") and same version : %s. Do you want to override the existing one ?', r.typeIdentifier, r.label, r.version),
                                            function(){
                                                done(true);
                                            },function(){
                                                done(false);
                                            });
                                    }else{
                                        done(true);
                                    }
                                }else{
                                    if(_.isArray(r.package)){
                                        _.each(r.package, function(msg){
                                            if(msg.message){
                                                feedback().error(msg.message);
                                            }
                                        });
                                    }
                                    done(false);
                                }
                            },
                            failed : function(message){
                                cb(new Error(message));
                            }
                        });
                    }
                }

            })
            .init(initConfig);
    }

    return PciManager;
});
