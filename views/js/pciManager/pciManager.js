define([
    'jquery',
    'i18n',
    'tpl!qtiItemPci/pciManager/tpl/layout',
    'ui/modal'
], function($, __, layoutTpl){

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
    };

    PciManager.prototype.open = function(){
        this.$dom.modal('open');
    };

    return PciManager;
});