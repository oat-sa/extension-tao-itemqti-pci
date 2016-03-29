define([
    'IMSGlobal/jquery_2_1_1',
    'qtiCustomInteractionContext',
    'OAT/util/event'
], function ($, qtiCustomInteractionContext, event) {
    'use strict';

    var spreadsheetInteraction = {

        id: -1,

        /**
         * Custom Interaction Hook API: getTypeIdentifier
         *
         * A unique identifier allowing custom interactions to be identified within an item.
         *
         * @returns {String} The unique identifier of this PCI Hook implementation.
         */
        getTypeIndentifier : function getTypeIndentifier() {
            return 'spreadsheetInteraction';
        }
    };

    qtiCustomInteractionContext.register(spreadsheetInteraction);
});
