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
 * Copyright (c) 2016-2022 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'i18n',
    'lodash',
    'ui/component',
    'ui/hider',
    'ui/switch/switch',
    'ui/button',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'tpl!qtiItemPci/pciManager/tpl/listing',
    'tpl!qtiItemPci/pciManager/tpl/packageMeta',
    'async',
    'ui/dialog/confirm',
    'ui/dialog',
    'ui/feedback',
    'ui/modal',
    'ui/uploader',
    'ui/filesender'
], function (
    $,
    __,
    _,
    component,
    hider,
    switchFactory,
    buttonFactory,
    layoutTpl,
    listingTpl,
    packageMetaTpl,
    asyncLib,
    confirmBox,
    dialog,
    feedback
) {
    'use strict';

    const _fileTypeFilters = ['application/zip', 'application/x-zip-compressed', 'application/x-zip'],
        _fileExtFilter = /.+\.(zip)$/;

    const _defaults = {
        loadUrl: null,
        disableUrl: null,
        enableUrl: null,
        verifyUrl: null,
        addUrl: null
    };

    const pciManager = {
        open: function open() {
            this.trigger('showListing');
            this.getElement().appendTo('.pci-manager');
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
    return function pciManagerFactory(config) {
        let listing = {};

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
            .on('showListing', function () {
                const $fileSelector = this.getElement().find('.file-selector'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $uploadForm = $uploader.parent('form'),
                    $switcher = $fileSelector.find('.upload-switcher a');

                hider.show($switcher.filter('.upload'));
                hider.hide($switcher.filter('.listing'));
                $uploadForm.hide();
                hider.hide($uploader);
                $title.text(__('Manage custom interactions'));

                this.trigger('updateListing');
            })
            .on('hideListing', function () {
                const $fileSelector = this.getElement().find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty'),
                    $title = $fileSelector.find('.title'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $uploadForm = $uploader.parent('form'),
                    $switcher = $fileSelector.find('.upload-switcher a');

                hider.show($switcher.filter('.listing'));
                hider.hide($switcher.filter('.upload'));
                $switcher.filter('.listing').css({ display: 'inline-block' });
                $uploadForm.show();
                hider.hide($fileContainer);
                hider.hide($placeholder);
                $title.text(__('Upload new custom interaction (zip package)'));

                $uploader.uploader('reset');
                hider.show($uploader);
            })
            .on('updateListing', function () {
                const self = this,
                    urls = _.pickBy(this.config, ['disableUrl', 'enableUrl', 'unregisterUrl', 'exportPciUrl']),
                    $fileSelector = this.getElement().find('.file-selector'),
                    $fileContainer = $fileSelector.find('.files'),
                    $placeholder = $fileSelector.find('.empty');
                if (_.size(listing)) {
                    hider.hide($placeholder);

                    $fileContainer.empty().html(
                        listingTpl({
                            interactions: listing
                        })
                    );
                    $fileContainer.find('.actions').each(function () {
                        const pciDownloadButton = $(this).find('.pci-download-button');
                        const pciswitch = $(this).find('.pci-switch');
                        const pciUnregisterButton = $(this).find('.pci-unregister-button');
                        const $li = $(this).closest('li');
                        const typeIdentifier = $li.data('typeIdentifier');
                        const pciIdentifier = $li.data('pciIdentifier');
                        const runtimeOnly = listing[typeIdentifier].runtimeOnly;
                        if (!runtimeOnly) {
                            switchFactory(pciswitch, {
                                on: {
                                    active: !$li.hasClass('pci-disabled')
                                },
                                off: {
                                    active: $li.hasClass('pci-disabled')
                                }
                            })
                                .on('on', function () {
                                    $li.removeClass('pci-disabled');
                                    $.getJSON(urls.enableUrl, { typeIdentifier: typeIdentifier }, function (data) {
                                        if (data.success) {
                                            listing[typeIdentifier].enabled = true;
                                            self.trigger('pciEnabled', typeIdentifier);
                                        }
                                    });
                                })
                                .on('off', function () {
                                    $li.addClass('pci-disabled');
                                    $.getJSON(urls.disableUrl, { typeIdentifier: typeIdentifier }, function (data) {
                                        if (data.success) {
                                            listing[typeIdentifier].enabled = false;
                                            self.trigger('pciDisabled', typeIdentifier);
                                        }
                                    });
                                });
                        }
                        buttonFactory({
                            id: 'unregister',
                            type: 'info',
                            icon: 'bin',
                            label: __('Delete'),
                            class: 'unregister',
                            renderTo: pciUnregisterButton
                        }).on('click', function confirmDialog() {
                            dialog({
                                class: 'icon-warning',
                                heading: __('Warning'),
                                message: __(
                                    'You are about to delete the Portable Custom Interaction <strong>%s</strong> from the system.',
                                    typeIdentifier
                                ),
                                content: __(
                                    'This action will affect all items that may be using it and cannot be undone. Please confirm your choice.'
                                ),
                                autoRender: true,
                                autoDestroy: true,
                                buttons: [
                                    {
                                        id: 'cancel',
                                        type: 'regular',
                                        label: __('Cancel'),
                                        close: true
                                    },
                                    {
                                        id: 'delete',
                                        type: 'error',
                                        label: __('Delete'),
                                        close: true
                                    }
                                ],
                                onDeleteBtn: function onDeleteBtn() {
                                    $.getJSON(urls.unregisterUrl, { typeIdentifier: typeIdentifier }, function (data) {
                                        if (data.success) {
                                            delete listing[typeIdentifier];
                                            self.trigger('pciDisabled', typeIdentifier);
                                        }
                                    });
                                }
                            });
                        });

                        if (!runtimeOnly) {
                            buttonFactory({
                                id: 'exportPci',
                                type: 'info',
                                icon: 'import',
                                label: __('Download'),
                                renderTo: pciDownloadButton
                            }).on('click', function () {
                                window.location =`${urls.exportPciUrl}?typeIdentifier=${typeIdentifier}&pciIdentifier=${pciIdentifier}`;
                            });
                        }
                    });

                    hider.show($fileContainer);
                } else {
                    hider.hide($fileContainer);
                    hider.show($placeholder);
                }
            })
            .on('pciEnabled', function () {
                this.trigger('updateListing');
            })
            .on('pciDisabled', function () {
                this.trigger('updateListing');
            })
            .on('render', function () {
                //init variables:
                const self = this,
                    urls = _.pickBy(this.config, ['loadUrl', 'disableUrl', 'enableUrl', 'verifyUrl', 'addUrl']),
                    $container = this.getElement(),
                    $fileSelector = $container.find('.file-selector'),
                    $uploader = $fileSelector.find('.file-upload-container'),
                    $switcher = $fileSelector.find('.upload-switcher a');
                let $uploadForm;

                //init event listeners
                initEventListeners();
                initUploader();

                //load list of custom interactions from server
                $.getJSON(urls.loadUrl, function (data) {
                    //note : init as empty object and not array otherwise _.size will fail later
                    listing = _.size(data) ? data : {};
                    self.trigger('updateListing', data);
                    self.trigger('loaded', data);
                });

                function initEventListeners() {
                    //switch to upload mode
                    $switcher.on('click', function (e) {
                        e.preventDefault();
                        if (hider.isHidden($uploader)) {
                            self.trigger('hideListing');
                        } else {
                            self.trigger('showListing');
                        }
                    });
                }

                function initUploader() {
                    let errors = [],
                        selectedFiles = {};

                    $uploader
                        .on('upload.uploader', function (e, file, interactionHook) {
                            listing[interactionHook.typeIdentifier] = interactionHook;
                            self.trigger('pciAdded', interactionHook.typeIdentifier);
                        })
                        .on('fail.uploader', function (e, file, err) {
                            errors.push(__('Unable to upload file %s : %s', file.name, err));
                        })
                        .on('end.uploader', function () {
                            if (errors.length === 0) {
                                self.trigger('showListing');
                            } else {
                                feedback().error(`<ul><li>${errors.join('</li><li>')}</li></ul>`, {
                                    encodeHtml: false
                                });
                            }
                            //reset errors
                            errors = [];
                        })
                        .on('create.uploader', function () {
                            //get ref to the uploadForm for later verification usage
                            $uploadForm = $uploader.parent('form');
                            $uploadForm.hide();
                        })
                        .on('fileselect.uploader', function () {
                            $uploadForm.find('li[data-file-name]').each(function () {
                                const $li = $(this),
                                    filename = $li.data('file-name'),
                                    packageMeta = selectedFiles[filename];

                                if (packageMeta) {
                                    //update label:
                                    $li.prepend(packageMetaTpl(packageMeta));
                                }
                            });
                        });

                    $uploader.uploader({
                        upload: true,
                        multiple: true,
                        uploadUrl: urls.addUrl,
                        fileSelect: function fileSelect(files, done) {
                            const givenLength = files.length;

                            //check the mime-type
                            files = _.filter(files, function (file) {
                                // for some weird reasons some browsers have quotes around the file type
                                const checkType = file.type.replace(/("|')/g, '');
                                return (
                                    _.includes(_fileTypeFilters, checkType) ||
                                    (checkType === '' && _fileExtFilter.test(file.name))
                                );
                            });

                            if (files.length !== givenLength) {
                                feedback().error(__('Invalid files have been removed'));
                            }

                            //reset selectedFiles list
                            selectedFiles = {};

                            //verify selected files
                            asyncLib.filter(files, verify, done);
                        }
                    });

                    function verify(file, cb) {
                        $uploadForm.sendfile({
                            url: urls.verifyUrl,
                            file: file,
                            loaded: function (r) {
                                function done(ok) {
                                    if (ok) {
                                        selectedFiles[file.name] = {
                                            typeIdentifier: r.typeIdentifier,
                                            label: r.label,
                                            version: r.version,
                                            model: r.model
                                        };
                                    }
                                    cb(ok);
                                }

                                if (r.valid) {
                                    if (r.exists) {
                                        confirmBox(
                                            __(
                                                'There is already one interaction with the same identifier "%s" (label : "%s") and same version : %s. Do you want to override the existing one ?',
                                                r.typeIdentifier,
                                                r.label,
                                                r.version
                                            ),
                                            function () {
                                                done(true);
                                            },
                                            function () {
                                                done(false);
                                            }
                                        );
                                    } else {
                                        done(true);
                                    }
                                } else {
                                    if (_.isArray(r.messages)) {
                                        _.forEach(r.messages, function (report) {
                                            feedback().error(report.message);
                                        });
                                    }

                                    done(false);
                                }
                            },
                            failed: function (message) {
                                cb(new Error(message));
                            }
                        });
                    }
                }
            })
            .init(config);
    };
});
