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
 * Copyright (c) 2016-2017 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'i18n',
    'lodash',
    'helpers',
    'ui/component',
    'ui/hider',
    'ui/switch/switch',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'tpl!qtiItemPci/pciManager/tpl/listing',
    'tpl!qtiItemPci/pciManager/tpl/packageMeta',
    'async',
    'ui/dialog/confirm',
    'ui/feedback',
    'ui/modal',
    'ui/uploader',
    'ui/filesender'
], function($, __, _, helpers, component, hider, switchFactory, layoutTpl, listingTpl, packageMetaTpl, asyncLib, confirmBox, feedback){
    'use strict';

    var _fileTypeFilters = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'],
        _fileExtFilter = /.+\.(zip)$/;

    var _defaults = {
        loadUrl : null,
        disableUrl : null,
        enableUrl : null,
        verifyUrl : null,
        addUrl : null
    };

    var pciManager = {
        open: function open(){
            this.trigger('showListing');
            this.getElement().modal('open');
        }
    };

    /**
     * Create a pci manager
     *
     * @param {Object} config
     * @param {String} config.loadUrl - the service be called to load the list of pcis
     * @param {String} config.verifyUrl - the service be called to verify a pci package
     * @param {String} config.addUrl - the service be called to add a pci
     * @param {String} config.enableUrl - the service be called to enable the pcis
     * @param {String} config.disableUrl - the service be called to disable the pcis
     * @returns {*}
     */
    return function pciManagerFactory(config){

        var listing = {};

        /**
         * Create pci manager component
         *
         * @returns {Object} a pciManager component
         * @fires pciManager#loaded - when the pci manager is initially loaded
         * @fires pciManager#showListing - when the list of pci is displayed
         * @fires pciManager#hideListing - when the list of pci is hidden
         * @fires pciManager#updateListing - when the list of pci is updated
         * @fires pciManager#pciEnabled - when a pci is enabled
         * @fires pciManager#pciDisabled - when a pci is pci-disabled
         */
        return component(pciManager, _defaults)
            .setTemplate(layoutTpl)
            .on('showListing', function(){
                var $fileSelector = this.getElement().find('.file-selector'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a');

                hider.show($switcher.filter('.upload'));
                hider.hide($switcher.filter('.listing'));

                hider.hide($uploader);
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

                hider.show($switcher.filter('.listing'));
                hider.hide($switcher.filter('.upload'));
                $switcher.filter('.listing').css({display : 'inline-block'});

                hider.hide($fileContainer);
                hider.hide($placeholder);
                $title.text(__('Upload new custom interaction (zip package)'));

                $uploader.uploader('reset');
                hider.show($uploader);
            })
            .on('updateListing', function(){
                var self = this,
                    urls = _.pick(this.config, ['disableUrl', 'enableUrl']),
                    $fileSelector = this.getElement().find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty');

                if(_.size(listing)){

                    hider.hide($placeholder);

                    $fileContainer
                        .empty()
                        .html(listingTpl({
                            interactions : listing
                        }));

                    $fileContainer.find('.switch-box').each(function(){
                        var $switch = $(this);
                        var $li = $switch.closest('.pci-list-element');
                        var typeIdentifier = $li.data('type-identifier');
                        switchFactory($switch, {
                            on : {
                                active : !$li.hasClass('pci-disabled')
                            },
                            off : {
                                active : $li.hasClass('pci-disabled')
                            }
                        }).on('on', function(){
                            $li.removeClass('pci-disabled');
                            $.getJSON(urls.enableUrl, {typeIdentifier : typeIdentifier}, function(data){
                                if(data.success){
                                    listing[typeIdentifier].enabled = true;
                                    self.trigger('pciEnabled', typeIdentifier);
                                }
                            });
                        }).on('off', function(){
                            $li.addClass('pci-disabled');
                            $.getJSON(urls.disableUrl, {typeIdentifier : typeIdentifier}, function(data){
                                if(data.success){
                                    listing[typeIdentifier].enabled = false;
                                    self.trigger('pciDisabled', typeIdentifier);
                                }
                            });
                        });
                    });

                    hider.show($fileContainer);

                }else{

                    hider.hide($fileContainer);
                    hider.show($placeholder);
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
                    urls = _.pick(this.config, ['loadUrl', 'disableUrl', 'enableUrl', 'verifyUrl', 'addUrl']),
                    $container = this.getElement(),
                    $fileSelector = $container.find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a'),
                    $uploadForm;

                //init modal box
                $container.modal({
                    startClosed : true,
                    minWidth : 450
                });

                //init event listeners
                initEventListeners();
                initUploader();

                //load list of custom interactions from server
                $.getJSON(urls.loadUrl, function(data){
                    //note : init as empty object and not array otherwise _.size will fail later
                    listing = _.size(data) ? data : {};
                    self.trigger('updateListing', data);
                    self.trigger('loaded', data);
                });

                function initEventListeners(){
                    //switch to upload mode
                    $switcher.on('click', function(e){
                        e.preventDefault();
                        if(hider.isHidden($uploader)){
                            self.trigger('hideListing');
                        }else{
                            self.trigger('showListing');
                        }
                    });
                }

                function initUploader(){

                    var errors = [],
                        selectedFiles = {};

                    $uploader.on('upload.uploader', function(e, file, interactionHook){

                        listing[interactionHook.typeIdentifier] = interactionHook;
                        self.trigger('pciAdded', interactionHook.typeIdentifier);

                    }).on('fail.uploader', function(e, file, err){

                        errors.push(__('Unable to upload file %s : %s', file.name, err));

                    }).on('end.uploader', function(){

                        if(errors.length === 0){
                            self.trigger('showListing');
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
                        uploadUrl : urls.addUrl,
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
                            asyncLib.filter(files, verify, done);
                        }
                    });

                    function verify(file, cb){

                        $uploadForm.sendfile({
                            url : urls.verifyUrl,
                            file : file,
                            loaded : function(r){

                                function done(ok){
                                    if(ok){
                                        selectedFiles[file.name] = {
                                            typeIdentifier : r.typeIdentifier,
                                            label : r.label,
                                            version : r.version,
                                            model : r.model
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
                                        _.each(r.package, function(report){
                                            if(_.isArray(report.messages)){
                                                _.forEach(report.messages, function(msg){
                                                    feedback().error(msg.message);
                                                });
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
            .init(config);
    };
});
