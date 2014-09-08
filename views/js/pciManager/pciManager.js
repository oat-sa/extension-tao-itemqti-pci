define([
    'jquery',
    'i18n',
    'lodash',
    'helpers',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'tpl!qtiItemPci/pciManager/tpl/listing',
    'taoQtiItem/qtiCreator/editor/interactionsToolbar',
    'ui/modal'
], function($, __, _, helpers, layoutTpl, listingTpl, interactionsToolbar){

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

        var _this = this;

        validateConfig(config);

        this.$dom = $(layoutTpl({
            title : __('Manage Custom Interactions')
        }));
        config.container.append(this.$dom);

        this.$dom.modal({
            startClosed : true,
            minWidth : 450
        });
        this.$fileContainer = this.$dom.find('.files');
        this.$placeholder = this.$dom.find('.empty');

        this.listing = {};

        this.loadListingFromServer(function(data){

            _this.listing = data;
            _this.updateListing(data);
        });

        this.$fileContainer.on('delete.deleter', function(e, $target){
            var params = {};
            if(e.namespace === 'deleter' && $target.length){
                params.typeIdentifier = $target.data('type-identifier');
                $(this).one('deleted.deleter', function(){
                    $.getJSON(_urls.delete, params, function(data){
                        if(data.success){
                            interactionsToolbar.remove(config.interactionSidebar, 'customInteraction.' + params.typeIdentifier);
                        }
                    });
                });
            }
        });

    };

    PciManager.prototype.open = function(){

        this.$dom.modal('open');
    };

    PciManager.prototype.loadListingFromServer = function(callback){

        $.getJSON(_urls.load, function(data){
            callback(data);
        });
    };

    PciManager.prototype.updateListing = function(){

        if(_.size(this.listing)){

            this.$placeholder.hide();

            this.$fileContainer
                .empty()
                .html(
                    listingTpl({
                        files : this.listing
                    }))
                .show();

        }else{

            this.$fileContainer.hide();
            this.$placeholder.show();
        }
    };

    return PciManager;
});