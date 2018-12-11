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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA;
 */
/**
 * WebWorker implementation of Flac encoder
 *
 * @author Péter Halász <peter@taotesting.com>
 */

/* eslint vars-on-top: 0 */
/* eslint strict: [ error, global ] */

'use strict';

var Flac,
    Resampler;

/* eslint-disable-next-line */
importScripts("../lib/libflac/libflac4-1.3.2.js", "../lib/xaudiojs/resampler.js");

var encoder,
    nrOfChannels = 1,
    flacBuffers  = [],
    audioBuffers = [],
    flacLength   = 0,
    sampleRate,
    compression,
    bps,
    verify,
    blockSize,
    audioContextSampleRate;

/**
 * Triggered when the worker get initialized
 */
function init(data) {
    sampleRate = data.config.sampleRate;
    audioContextSampleRate = data.config.audioContextSampleRate;
    compression = data.config.compressionLevel;
    bps = data.config.bps;
    verify = data.config.verify;
    blockSize = data.config.blockSize;
}

/**
 * Triggered when the record get starts
 */
function startRecord() {
    encoder = Flac.create_libflac_encoder(
        sampleRate,
        nrOfChannels,
        bps,
        compression,
        0,
        verify,
        blockSize
    );

    if (encoder !== 0) {
        Flac.init_encoder_stream(encoder, function(buffer, bytes) {
            flacBuffers.push(buffer);
            flacLength += bytes;
        });
    } else {
        self.postMessage({
            command: 'error',
            errorMessage: 'Failed to initialize the Flac Encoder',
        });
    }
}

/**
 * Triggered during the record process
 */
function doRecord(buffer) {
    if (!Flac.isReady() || encoder === 0) {
        audioBuffers.push(buffer);
    } else {
        if (audioBuffers.length > 0) {
            var len = audioBuffers.length;
            var buffered = audioBuffers.splice(0, len);

            for (var i = 0; i < len; ++i) {
                _encode(buffered[i]);
            }
        }

        _encode(buffer);
    }
}

/**
 * Triggered when the record finishes
 */
function finishRecord() {
    if (!Flac.isReady()) {
        self.postMessage({
            command: 'error',
            errorMessage: 'Failed to finish the encoding',
        });
    } else {
        self.postMessage({
            command: "progress",
            progress: 0,
        });

        Flac.FLAC__stream_encoder_finish(encoder);

        self.postMessage({
            command: 'complete',
            blob: _getFlacFile(flacBuffers, flacLength),
        });

        Flac.FLAC__stream_encoder_delete(encoder);

        self.postMessage({
            command: "progress",
            progress: 1,
        });

        clear();
    }
}

/**
 * Clears the state of the current worker
 */
function clear() {
    flacBuffers.splice(0, flacBuffers.length);
    flacLength = 0;
}

/**
 * Resamples the buffered data to the desired sample rate
 *
 * @param {Float32Array} buffer
 * @returns {Float32Array}
 * @private
 */
function _resample(buffer) {
    var resampler = new Resampler(audioContextSampleRate, sampleRate, nrOfChannels, buffer);

    resampler.resampler(buffer.length);

    return resampler.outputBuffer;
}

/**
 * Submits the buffered data to encoding
 *
 * @param {Float32Array[]} bufferArray
 * @private
 */
function _encode(bufferArray) {
    bufferArray.forEach(function(buffer) {
        // resample the audio only if the desired sample rate is not equal with the audio context sample rate
        if (audioContextSampleRate !== sampleRate) {
            buffer = _resample(buffer);
        }

        var bufferLength = buffer.length;
        var bufferI32    = new Uint32Array(bufferLength);
        var view         = new DataView(bufferI32.buffer);
        var volume       = 1;
        var index        = 0;

        for (var i = 0; i < bufferLength; i++) {
            view.setInt32(index, (buffer[i] * (0x7FFF * volume)), true);
            index += 4;
        }

        Flac.FLAC__stream_encoder_process_interleaved(
            encoder,
            bufferI32,
            bufferI32.length / nrOfChannels
        );
    });
}

/**
 * Generates the flac file as a blob
 *
 * @param recBuffers
 * @param recLength
 * @returns {Blob}
 * @private
 */
function _getFlacFile(recBuffers, recLength) {
    var samples = _mergeBuffersUint8(recBuffers, recLength);

    return new Blob([samples], { type: 'audio/flac' });
}

/**
 * Merges the buffers in Uint8 format
 *
 * @param channelBuffer
 * @param recordingLength
 * @returns {Uint8Array}
 * @private
 */
function _mergeBuffersUint8(channelBuffer, recordingLength) {
    var result = new Uint8Array(recordingLength);
    var offset = 0;

    for (var i = 0; i < channelBuffer.length; i++) {
        var buffer = channelBuffer[i];

        result.set(buffer, offset);
        offset += buffer.length;
    }

    return result;
}

/**
 * @param event
 */
self.onmessage = function(event) {
    var data = event.data;

    switch (data.command) {
        case 'init':   init(data);            break;
        case 'start':  startRecord();         break;
        case 'record': doRecord(data.buffer); break;
        case 'finish': finishRecord();        break;
        case 'cancel': clear();               break;
        default:
            self.postMessage({
                command: 'error',
                errorMessage: 'Invalid command sent to Flac WebWorker: ' + data.command,
            });
    }
};

self.postMessage({ command: 'loaded' });
