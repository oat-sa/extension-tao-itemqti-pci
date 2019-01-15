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
 * - record(): do not timeout if maxBuffers (= timeLimit option) is equal to zero
 * - cleanup(): removed chaining assignment that might result in a TypeError
 */
importScripts("WavAudioEncoder.js");

var sampleRate = 44100,
    numChannels = 2,
    options = undefined,
    maxBuffers = undefined,
    encoder = undefined,
    recBuffers = undefined,
    bufferCount = 0,
    updateResponsePartially;

function error(message) {
    self.postMessage({ command: "error", message: "wav: " + message });
}

function init(data) {
    sampleRate = data.config.sampleRate;
    numChannels = data.config.numChannels;
    options = data.options;
    updateResponsePartially = data.config.updateResponsePartially;
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

            if (updateResponsePartially) {
                self.postMessage({
                    command: "partialcomplete",
                    blob: encoder.partialFinish(options.wav.mimeType),
                });
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
