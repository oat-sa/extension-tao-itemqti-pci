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
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/jquery_2_1_1',
    'taoQtiItem/portableLib/OAT/util/event'
], function(_, $, event) {
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
     * Converts a base64 string to a blob
     * [Source]{@link https://github.com/jeremybanks/b64-to-blob}
     * [CC0 1.0]{@link https://creativecommons.org/publicdomain/zero/1.0/}
     * @param b64Data - raw base64 data without any prefix
     * @param contentType - mime type
     * @param sliceSize
     * @returns {Blob}
     */
    function b64toBlob(b64Data, contentType, sliceSize) {
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        var offset, slice, byteNumbers, byteArray, blob, i;

        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        for (offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            slice = byteCharacters.slice(offset, offset + sliceSize);

            byteNumbers = new Array(slice.length);
            for (i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

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
                    if (_.isFinite(audioEl.duration)) {
                        self.trigger('durationchange', [audioEl.duration]);
                    }
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

                audioEl.onloadedmetadata = function() {
                    var ontimeupdateBackup = audioEl.ontimeupdate;

                    // Chrome workaround for bug https://bugs.chromium.org/p/chromium/issues/detail?id=642012
                    // source: https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome/39971175#39971175
                    if (audioEl.duration === Infinity) {
                        audioEl.ontimeupdate = function() {
                            audioEl.ontimeupdate = ontimeupdateBackup;
                            audioEl.currentTime = 0;
                            audioEl.load();
                        };
                        audioEl.currentTime = 1e101;
                        audioEl.onloadedmetadata = null;
                    }
                };

                setState(player, playerStates.IDLE);
            },

            /**
             * Load from base64
             */
            loadFromBase64: function loadFromBase64(base64, mime) {
                var blob = b64toBlob(base64, mime),
                    blobUrl = window.URL && window.URL.createObjectURL && window.URL.createObjectURL(blob);

                if (blobUrl) {
                    this.load(blobUrl);
                }
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
                setState(player, playerStates.IDLE);
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
