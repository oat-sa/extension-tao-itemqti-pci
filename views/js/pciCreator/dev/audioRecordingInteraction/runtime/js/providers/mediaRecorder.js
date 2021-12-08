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
 * Copyright (c) 2018-2021 (original work) Open Assessment Technologies SA;
 */
/**
 * This audio processing provider is based on the mediaRecorder API.
 * It generates compressed files, exact codec and container depends on the browser implementation.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'taoQtiItem/portableLib/lodash',
    'taoQtiItem/portableLib/OAT/util/event'
], function(_, event) {
    'use strict';

    /**
     * Default time interval for the partial update throttling
     * @type {Number}
     */
    var defaultPartialUpdateInterval = 1000;

    /**
     * @param {Object} config
     * @param {Number} config.audioBitrate - in bits per second, quality of the recording
     */
    return function mediaRecorderProviderFactory(config) {
        var mediaRecorderProvider;

        // context to manage the partial update throttling
        var partialUpdateInterval = config.partialUpdateInterval || defaultPartialUpdateInterval;
        var partialUpdateTimeout = null;
        var partialUpdateAllowed = true;
        var partialSize = 0;
        var recordSize = 0;

        // make sure the timeout context for the partial update throttling has been cleaned up
        var cleanupPartialUpdateTimeout = function cleanupPartialUpdateTimeout() {
            if (partialUpdateTimeout) {
                clearTimeout(partialUpdateTimeout);
            }
            partialUpdateTimeout = null;
        };

        var MediaRecorder = window.MediaRecorder,       // The MediaRecorder API
            mediaRecorder,                              // The MediaRecorder instance
            recorderOptions = {                         // Options for the MediaRecorder constructor
                audioBitsPerSecond: config.audioBitrate || 20000
            };

        var mimeType,               // mime type of the recording
            chunks = [],            // contains the current recording split in chunks
            chunkSizeMs = 100;      // size of a chunk (reduced from 1000ms to 100ms to avoid data loss in case of interrupted recording)

        var codecsByPreferenceOrder = [
            // !!! Do not change this order without careful consideration and regression testing !!!
            // Firefox recently (more or less) implemented the use of WebM as the default
            // container for the media produced by the mediaRecorder API.
            // This is fine except that by default, recorded audio is non seekable, eg
            // it does not have a duration property, which is needed among other things
            // to properly scale the player progress bar.
            // This was already the case for Chrome, but there is a known workaround for
            // that (documented in PCI runtime source code). This workaround DOES NOT
            // work with Firefox. As a result, I haven't found a way of easily setting
            // the duration of the recorded WebM audio. As a new workaround, I chose
            // to increase priority of the ogg container to restore previous behavior.
            'audio/ogg;codecs=opus',
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg',
            'audio/mp4'
        ];

        // set the prefered encoding format, if we are able to detect what is supported
        // if not, the browser default will be used
        if (typeof MediaRecorder.isTypeSupported === 'function') {
            codecsByPreferenceOrder.forEach(function (format) {
                if (_.isUndefined(recorderOptions.mimeType) && MediaRecorder.isTypeSupported(format)) {
                    recorderOptions.mimeType = format;
                }
            });
        }

        /**
         * The provider
         */
        mediaRecorderProvider = {
            /**
             * Create and configure the mediaRecorder object
             * @param {MediaStream} stream
             */
            init: function init(stream) {
                var self = this;

                mediaRecorder = new MediaRecorder(stream, recorderOptions);
                mimeType = mediaRecorder.mimeType;

                // save chunks of the recording
                mediaRecorder.ondataavailable = function ondataavailable(e) {
                    var blob;

                    chunks.push(e.data);
                    recordSize += e.data.size;

                    // partial update processed with a throttling, and only if data is actually available
                    if (config.updateResponsePartially && partialUpdateAllowed && recordSize > partialSize) {
                        partialUpdateAllowed = false;
                        partialSize = recordSize;

                        blob = new Blob(chunks, { type: mimeType });
                        self.trigger('partialblobavailable', [blob]);

                        partialUpdateTimeout = setTimeout(function allowPartialUpdate() {
                            partialUpdateAllowed = true;
                            partialUpdateTimeout = null;
                        }, partialUpdateInterval);
                    }
                };

                // stop record callback
                mediaRecorder.onstop = function onstop() {
                    var blob;

                    cleanupPartialUpdateTimeout();

                    if (! self.cancelled) {
                        blob = new Blob(chunks, { type: mimeType });
                        self.trigger('blobavailable', [blob]);
                    }
                    chunks = [];
                };

                mediaRecorder.onerror = function(error) {
                    window.console.error(error);
                };
            },

            /**
             * Start the recording
             */
            start: function start() {
                partialUpdateAllowed = true;
                partialSize = 0;
                recordSize = 0
                mediaRecorder.start(chunkSizeMs);
            },

            /**
             * Stop the recording
             */
            stop: function stop() {
                this.cancelled = false;
                mediaRecorder.stop();
            },

            /**
             * Cancel the recording
             */
            cancel: function cancel() {
                this.cancelled = true;
                mediaRecorder.stop();
            },

            /**
             * Destroy the mediaRecorder
             */
            destroy: function destroy() {
                cleanupPartialUpdateTimeout();
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
                mediaRecorder = null;
            }
        };

        event.addEventMgr(mediaRecorderProvider);

        return mediaRecorderProvider;
    };

});
