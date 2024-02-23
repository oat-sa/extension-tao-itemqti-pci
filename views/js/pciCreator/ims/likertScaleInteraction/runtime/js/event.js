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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 *
 */

// Originally: taoQtiItem/portableLib/OAT/util/EventMgr.js
// module refactored to eliminate lodash dependency, for smaller bundles
define('EventMgr', [], function() {
    /**
     * Event Manager class
     */
    return function EventMgr() {
        const events = {};

        this.get = event => {
            if (event && events[event]) {
                return [...events[event]];
            } else {
                return [];
            }
        };

        this.on = (event, callback) => {
            let name;
            const tokens = event.split('.');
            if (tokens[0]) {
                name = tokens.shift();
                events[name] = events[name] || [];
                events[name].push({
                    ns: tokens,
                    callback: callback
                });
            }
        };

        this.off = event => {
            if (event && events[event]) {
                events[event] = [];
            }
        };

        this.trigger = (event, data) => {
            if (events[event]) {
                events[event].forEach(e => {
                    e.callback.apply({
                        type: event,
                        ns: []
                    }, data);
                });
            }
        };
    };
});

// Originally: taoQtiItem/portableLib/OAT/util/event.js
// default export
define(['EventMgr'], function(EventMgr) {
    return {
        addEventMgr: function(instance) {
            const eventMgr = new EventMgr();

            instance.on = function on(event, callback){
                eventMgr.on(event, callback);
            };
            instance.off = function off(event){
                eventMgr.off(event);
            };
            instance.trigger = function trigger(event, data){
                eventMgr.trigger(event, data);
            };
        }
    };
});
