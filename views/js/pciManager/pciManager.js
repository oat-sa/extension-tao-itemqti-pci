define([
    'jquery',
    'i18n',
    'helpers',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'ui/modal'
], function($, __, helpers, layoutTpl){

//    $fileContainer.hide();
//    $placeholder.hide();

    var PciManager = function($container){

        this.$dom = $(layoutTpl({
            title : __('Manage Custom Interactions')
        }));
        $container.append(this.$dom);

        this.$dom.modal({
            startClosed : true,
            minWidth : 450
        });
        
        this.loadListingFromServer(function(data){
            
        });
    };

    PciManager.prototype.open = function(){
        this.$dom.modal('open');
    };
    
    PciManager.prototype.loadListingFromServer = function(callback){
        $.ajax({
            url : helpers._url('getRegisteredInteractions', 'PciManager', 'qtiItemPci'),
            dataType: 'json'
        }).done(function(data){
            console.log(data);
            callback(data);
        });
    };

    return PciManager;
});