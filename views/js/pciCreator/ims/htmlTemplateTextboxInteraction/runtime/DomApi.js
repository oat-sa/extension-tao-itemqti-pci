define(function () {
    'use strict';

    return function DomApi(container) {
        return {
            /**
             * Attach listener for incoming event
             * @param {string} type
             * @param {function} handler
             */
            on(type, handler) {
                container.addEventListener(type, handler);
            },

            /**
             * Detach listener for incoming event
             * @param {string} type
             * @param {function} handler
             */
            off(type, handler) {
                container.removeEventListener(type, handler);
            },

            /**
             * Send outgoing event
             * @param {string} type
             * @param {object} options
             */
            dispatch(type, options) {
                console.log('dispatch', type, options);
                container.dispatchEvent(new CustomEvent(type, options));
            }
        }
    }
});
