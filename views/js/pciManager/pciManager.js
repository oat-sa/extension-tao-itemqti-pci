define([
    'jquery',
    'i18n',
    'lodash',
    'helpers',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'tpl!qtiItemPci/pciManager/tpl/listing',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'async',
    'ui/feedback',
    'ui/modal',
    'ui/uploader',
    'ui/filesender',
    'filereader'
], function($, __, _, helpers, layoutTpl, listingTpl, interactionsToolbar, async, feedback){

    var _fileTypeFilters = ['application/zip'];

    var _urls = {
        load : helpers._url('getRegisteredInteractions', 'PciManager', 'qtiItemPci'),
        delete : helpers._url('delete', 'PciManager', 'qtiItemPci'),
        verify : helpers._url('verify', 'PciManager', 'qtiItemPci'),
        add : helpers._url('add', 'PciManager', 'qtiItemPci')
    };

    function validateConfig(config){

        if(!config.container || !(config.container instanceof $)){
            throw new Error('Invalid container in config object');
        }
        if(!config.interactionSidebar || !(config.interactionSidebar instanceof $)){
            throw new Error('Invalid container in config object');
        }
    }

    function PciManager(config){

        validateConfig(config);

        //creates the container from the layout template
        var $container = $(layoutTpl({
            title : __('Manage Custom Interactions')
        }));
        config.container.append($container);

        //init variables:
        var listing = {},
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

            listing = data;
            updateListing(data);
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

        function open(){
            $container.modal('open');
        }

        function initEventListeners(){

            $fileContainer.on('delete.deleter', function(e, $target){

                var typeIdentifier;
                if(e.namespace === 'deleter' && $target.length){

                    typeIdentifier = $target.data('type-identifier');
                    $(this).one('deleted.deleter', function(){

                        $.getJSON(_urls.delete, {typeIdentifier : typeIdentifier}, function(data){
                            if(data.success){
                                interactionsToolbar.remove(config.interactionSidebar, 'customInteraction.' + typeIdentifier);
                                delete listing[typeIdentifier];
                                updateListing();
                            }
                        });
                    });
                }
            });

            //siwtch to upload mode
            $switcher.click(function(e){
                e.preventDefault();
                switchUpload();
            });
        }

        function updateListing(){

            if(_.size(listing)){

                $placeholder.hide();

                $fileContainer
                    .empty()
                    .html(
                        listingTpl({
                            files : listing
                        }))
                    .show();

            }else{

                $fileContainer.hide();
                $placeholder.show();
            }
        }

        function switchUpload(){

            if($fileContainer.css('display') === 'none'){
                $uploader.hide();
                $fileContainer.show();
                // Note: show() would display as inline, not inline-block!
                $switcher.filter('.upload').css({display : 'inline-block'});
                $switcher.filter('.listing').hide();
                $title.text(__('Manage custom interactions'));
            }else{
                $fileContainer.hide();
                $placeholder.hide();
                $uploader.show();
                $switcher.filter('.upload').hide();
                $switcher.filter('.listing').css({display : 'inline-block'});
                $title.text(__('Upload new custom interaction (zip package)'));
                $uploader.uploader('reset');
            }

        }

        function initUploader(){

            var errors = [];

            $uploader.on('upload.uploader', function(e, file, result){

                console.log(file, result);
                listing[result.typeIdentifier] = result;
                updateListing();
                $container.trigger('added.custominteraction', [result]);

            }).on('fail.uploader', function(e, file, err){

                errors.push(__('Unable to upload file %s : %s', file.name, err));

            }).on('end.uploader', function(){

                if(errors.length === 0){
                    _.delay(switchUpload, 500);
                }else{
                    feedback().error("<ul><li>" + errors.join('</li><li>') + "</li></ul>");
                }
                //reset errors
                errors = [];

            }).on('create.uploader', function(){

                //get ref to the uploadForm for later verification usage
                $uploadForm = $uploader.children('form');
            });

            $uploader.uploader({
                upload : true,
                multiple : true,
                uploadUrl : _urls.add,
                fileSelect : function(files, done){

                    var givenLength = files.length;
                    var fileNames = [];
                    $fileContainer.find('li > .desc').each(function(){
                        fileNames.push($(this).text().toLowerCase());
                    });

                    //check the mime-type
                    files = _.filter(files, function(file){
                        return _.contains(_fileTypeFilters, file.type);
                    });

                    if(files.length !== givenLength){
                        feedback().error('Invalid files have been removed');
                    }

                    async.filter(files, verify, done);
                }
            });

        }

        function verify(file, cb){

            var result = true,
                $fileEntry = $uploadForm.find('li[data-file-name="' + file.name + '"]'),
                $status = $fileEntry.find('.status');

            $uploadForm.sendfile({
                url : _urls.verify,
                file : file,
                loaded : function(r){
                    
                    console.log('vvv', r, file);

                    if(r.valid){
                        if(r.exists){
                            result = window.confirm('Do you want to override ' + r.label + '?');
                        }
                    }else{
                        result = false;
                    }
                    
                    $status
                        .removeClass('sending')
                        .removeClass('error')
                        .addClass('success')
                        .html(r.label+' - typeIdentifier : '+r.typeIdentifier);

                    cb(result);
                },
                failed : function(message){

                    $status
                        .removeClass('sending')
                        .removeClass('success')
                        .addClass('error')
                        .attr('title', message);
                    
                    cb(new Error(message));
                }
            });
        }

        //expose a few functions
        this.open = open;
    }

    return PciManager;
});