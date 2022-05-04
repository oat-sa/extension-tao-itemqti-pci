/* eslint-disable */
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Yuji Miyane
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var min = Math.min,
    max = Math.max;

var setString = function(view, offset, str) {
    var len = str.length;
    for (var i = 0; i < len; ++i)
        view.setUint8(offset + i, str.charCodeAt(i));
};

/**
 * @returns {DataView}
 */
var getDataView = function(numChannels, numSamples, sampleRate) {
    var dataSize = numChannels * numSamples * 2,
        view     = new DataView(new ArrayBuffer(44));
    setString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    setString(view, 8, 'WAVE');
    setString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 4, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    setString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    return view;
};

var WavAudioEncoder = function(sampleRate, numChannels) {
    this.sampleRate = sampleRate;
    this.numChannels = numChannels;
    this.numSamples = 0;
    this.dataViews = [];
};

WavAudioEncoder.prototype.encode = function(buffer) {
    var len = buffer[0].length,
        nCh = this.numChannels,
        view = new DataView(new ArrayBuffer(len * nCh * 2)),
        offset = 0;
    for (var i = 0; i < len; ++i)
        for (var ch = 0; ch < nCh; ++ch) {
            var x = buffer[ch][i] * 0x7fff;
            view.setInt16(offset, x < 0 ? max(x, -0x8000) : min(x, 0x7fff), true);
            offset += 2;
        }
    this.dataViews.push(view);
    this.numSamples += len;
};

/**
 * Returns the previously encoded audio and cleans the buffers
 *
 * @param mimeType
 * @returns {Blob}
 */
 WavAudioEncoder.prototype.finish = function(mimeType) {
    var view = getDataView(this.numChannels, this.numSamples, this.sampleRate);
    this.dataViews.unshift(view);
    var blob = new Blob(this.dataViews, { type: 'audio/wav' });
    this.cleanup();
    return blob;
};

/**
 * Returns the previously encoded audio without modifying or cleaning the original encoded data
 *
 * @param mimeType
 * @returns {Blob}
 */
 WavAudioEncoder.prototype.partialFinish = function(mimeType) {
    var view = getDataView(this.numChannels, this.numSamples, this.sampleRate);
    var tmpDataViews = this.dataViews.slice();
    tmpDataViews.unshift(view);
    var blob = new Blob(tmpDataViews, { type: 'audio/wav' });
    return blob;
};

WavAudioEncoder.prototype.cancel = WavAudioEncoder.prototype.cleanup = function() {
    delete this.dataViews;
};

/* eslint-disable */
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Yuji Miyane
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * OAT version with the following changes:
 * - init(), record(), cleanup(): allow partial update of the recording, throttled by the given interval
 * - record(): do not timeout if maxBuffers (= timeLimit option) is equal to zero
 * - cleanup(): removed chaining assignment that might result in a TypeError
 */
var sampleRate = 44100,
    numChannels = 2,
    options = undefined,
    maxBuffers = undefined,
    encoder = undefined,
    recBuffers = undefined,
    bufferCount = 0,
    updateResponsePartially,
    partialUpdateInterval,
    partialUpdateTimeout = null,
    partialUpdateAllowed = true;

var defaultPartialUpdateInterval = 1000;

function error(message) {
    self.postMessage({ command: "error", message: "wav: " + message });
}

function init(data) {
    sampleRate = data.config.sampleRate;
    numChannels = data.config.numChannels;
    options = data.options;
    updateResponsePartially = data.config.updateResponsePartially;
    partialUpdateInterval = data.config.partialUpdateInterval || defaultPartialUpdateInterval;
    partialUpdateAllowed = true;
}

function setOptions(opt) {
    if (encoder || recBuffers)
        error("cannot set options during recording");
    else
        options = opt;
}

function start(bufferSize) {
    maxBuffers = Math.ceil(options.timeLimit * sampleRate / bufferSize);
    if (options.encodeAfterRecord)
        recBuffers = [];
    else
        encoder = new WavAudioEncoder(sampleRate, numChannels);
}

function record(buffer) {
    if (!maxBuffers || bufferCount++ < maxBuffers) {
        if (encoder) {
            encoder.encode(buffer);

            if (updateResponsePartially && partialUpdateAllowed) {
                partialUpdateAllowed = false;

                self.postMessage({
                    command: "partialcomplete",
                    blob: encoder.partialFinish(options.wav.mimeType),
                });

                partialUpdateTimeout = setTimeout(function allowPartialUpdate() {
                    partialUpdateAllowed = true;
                    partialUpdateTimeout = null;
                }, partialUpdateInterval);
            }

        } else {
            recBuffers.push(buffer);
        }
    } else {
        self.postMessage({command: "timeout"});
    }
};

function postProgress(progress) {
    self.postMessage({ command: "progress", progress: progress });
};

function finish() {
    if (recBuffers) {
        postProgress(0);
        encoder = new WavAudioEncoder(sampleRate, numChannels);
        var timeout = Date.now() + options.progressInterval;
        while (recBuffers.length > 0) {
            encoder.encode(recBuffers.shift());
            var now = Date.now();
            if (now > timeout) {
                postProgress((bufferCount - recBuffers.length) / bufferCount);
                timeout = now + options.progressInterval;
            }
        }
        postProgress(1);
    }
    self.postMessage({
        command: "complete",
        blob: encoder.finish(options.wav.mimeType)
    });
    cleanup();
};

function cleanup() {
    if (partialUpdateTimeout) {
        clearTimeout(partialUpdateTimeout);
    }
    partialUpdateTimeout = null;
    encoder = undefined;
    recBuffers = undefined;
    bufferCount = 0;
}

self.onmessage = function(event) {
    var data = event.data;
    switch (data.command) {
        case "init":    init(data);                 break;
        case "options": setOptions(data.options);   break;
        case "start":   start(data.bufferSize);     break;
        case "record":  record(data.buffer);        break;
        case "finish":  finish();                   break;
        case "cancel":  cleanup();
    }
};

self.postMessage({ command: "loaded" });
