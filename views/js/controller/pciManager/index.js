define([
    'jquery',
    'util/url',
    'qtiItemPci/pciManager/pciManager',
    'css!qtiItemPciCss/pci-manager'

], function ($, url, pciManager) {
    'use strict';

    var $container = $('.pci-manager');

    return {
        start: function start() {

            pciManager({
                renderTo: $container,
                loadUrl : url.route('getRegisteredImplementations', 'PciManager', 'qtiItemPci'),
                disableUrl : url.route('disable', 'PciManager', 'qtiItemPci'),
                enableUrl : url.route('enable', 'PciManager', 'qtiItemPci'),
                verifyUrl : url.route('verify', 'PciManager', 'qtiItemPci'),
                addUrl : url.route('add', 'PciManager', 'qtiItemPci'),
                unregisterUrl: url.route('unregister', 'PciManager', 'qtiItemPci'),
                exportPciUrl: url.route('export', 'PciManager', 'qtiItemPci')
            })
        }
    };
});