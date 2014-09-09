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
    'ui/modal'
], function($, __, _, helpers, layoutTpl, listingTpl, interactionsToolbar, async, feedback){

    var _urls = {
        load : helpers._url('getRegisteredInteractions', 'PciManager', 'qtiItemPci'),
        delete : helpers._url('delete', 'PciManager', 'qtiItemPci')
    };

    function validateConfig(config){

        if(!config.container || !(config.container instanceof $)){
            throw new Error('Invalid container in config object');
        }
        if(!config.interactionSidebar || !(config.interactionSidebar instanceof $)){
            throw new Error('Invalid container in config object');
        }
    }

    var PciManager = function(config){

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
            $switcher = $fileSelector.find('.upload-switcher a');

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
                $title.text(__('Browse folders:'));
            }else{
                $fileContainer.hide();
                $placeholder.hide();
                $uploader.show();
                $switcher.filter('.upload').hide();
                $switcher.filter('.listing').css({display : 'inline-block'});
                $title.text(__('Upload into:'));
                $uploader.uploader('reset');
            }

        }

        function initUploader(){

            var errors = [];

            $uploader.on('upload.uploader', function(e, file, result){
                $container.trigger('added.custominteraction', [result, currentPath]);
            });
            $uploader.on('fail.uploader', function(e, file, err){
                errors.push(__('Unable to upload file %s : %s', file.name, err));
            });

            $uploader.on('end.uploader', function(){

                if(errors.length === 0){
                    _.delay(switchUpload, 500);
                }else{
                    feedback().error("<ul><li>" + errors.join('</li><li>') + "</li></ul>");
                }
                //reset errors
                errors = [];
            });

            $uploader.uploader({
                upload : true,
                multiple : true,
                uploadUrl : options.uploadUrl + '?' + $.param(options.params) + '&' + options.pathParam + '=' + currentPath,
                fileSelect : function(files, done){

                    var givenLength = files.length;
                    var fileNames = [];
                    $fileContainer.find('li > .desc').each(function(){
                        fileNames.push($(this).text().toLowerCase());
                    });

                    //check the mime-type
                    if(options.params.filters){
                        var filters = options.params.filters.split(',');
                        //TODO check stars
                        files = _.filter(files, function(file){
                            return _.contains(filters, file.type);
                        });

                        if(files.length !== givenLength){

                            //TODO use a feedback popup
                            feedback().error('Unauthorized files have been removed');
                        }
                    }

                    async.filter(files, function(file, cb){
                        var result = true;

                        //try to call a server side service to check whether the selected files exists or not.       
                        if(options.fileExistsUrl){
                            $.getJSON(options.fileExistsUrl + '?' + $.param(options.params) + '&' + options.pathParam + '=' + currentPath + '/' + file.name, function(response){
                                if(response && response.exists === true){
                                    result = window.confirm('Do you want to override ' + file.name + '?');
                                }
                                cb(result);
                            });
                        }else{
                            //fallback on client side check 
                            if(_.contains(fileNames, file.name.toLowerCase())){
                                result = window.confirm('Do you want to override ' + file.name + '?');
                            }
                            cb(result);
                        }
                    }, done);
                }
            });
        }

        //expose a few functions
        this.open = open;
    };

    return PciManager;
});