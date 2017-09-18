/**
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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * This is an audio player for the sole purpose of playing back the recorded media.
 * It is actually a very simple wrapper around an HTMLAudioElement
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/OAT/util/event'
], function(event) {
    'use strict';

    /**
     * @property {String} CREATED   - player instance created, but no media loaded
     * @property {String} IDLE      - media loaded and playable
     * @property {String} PLAYING   - media is playing
     */
    var playerStates = {
        CREATED:    'created',
        IDLE:       'idle',
        PLAYING:    'playing'
    };

    /**
     * @returns {Object} - The player
     */
    return function playerFactory() {
        var audioEl,
            player,
            state = playerStates.CREATED;

        /**
         * Set player state
         * @param {Object} playerInstance - the player instance
         * @param {String} newState - the new state
         */
        function setState(playerInstance, newState) {
            state = newState;
            playerInstance.trigger('statechange');
            playerInstance.trigger(newState);
        }

        player = {
            /**
             * Check the current state
             * @param {String} queriedState
             * @returns {Boolean}
             */
            is: function is(queriedState) {
                return (state === queriedState);
            },

            /**
             * Load a media into the player and register audio element event handlers
             * @param {String} url
             */
            load: function load(url) {
                var self = this;

                audioEl = new Audio(url);

                audioEl.ondurationchange = function ondurationchange() {
                    self.trigger('durationchange', [audioEl.duration]);
                };

                // when playback is stopped by user or when the media is loaded:
                audioEl.oncanplay = function oncanplay() {
                    setState(player, playerStates.IDLE);
                };

                // when playbacks ends on its own:
                audioEl.onended = function onended() {
                    setState(player, playerStates.IDLE);
                    audioEl.currentTime = 0;
                    self.trigger('timeupdate', [0]);
                };

                audioEl.onplaying = function onplaying() {
                    setState(player, playerStates.PLAYING);
                };

                audioEl.ontimeupdate = function ontimeupdate() {
                    self.trigger('timeupdate', [audioEl.currentTime]);
                };
            },

            /**
             * Start the playback
             */
            play: function play() {
                audioEl.play();
                // state change has to be triggered by the onplaying listener
            },

            /**
             * Stop the playback
             */
            stop: function stop() {
                audioEl.pause();
                audioEl.currentTime = 0;
                // state change is triggered by the oncanplay listener
            },

            /**
             * Reinitialise the audio element. Can be used as a destroy() function
             */
            unload: function unload() {
                audioEl = null;
                setState(player, playerStates.CREATED);
            }
        };
        event.addEventMgr(player);

        return player;
    };
});