<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. RESPONSE"
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<div class="panel">
    <label>
        <input name="allowPlayback" type="checkbox" {{#if allowPlayback}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Allow playback"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Give the possibility to the test taker to playback its own recording."}}
    </span>
</div>

<div class="panel">
    <label>
        <input name="autoStart" type="checkbox" {{#if autoStart}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Auto start recording"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Recording starts automatically once test taker give microphone use authorisation. If a media stimulus is used, then the recording starts automatically after the stimulus has been played."}}
    </span>
</div>

<div class="panel">
    <label for="maxRecords" class="spinner">{{__ "Max attempts:"}}</label>
    <input name="maxRecords" value="{{maxRecords}}" class="large" data-increment="1" data-min="0" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Maximum number of recording attempts allowed to the test taker. Set to 0 to allow unlimited attempts. With a limit of 3, the test taker will be able to click 2 times on the reset button."}}
    </span>
</div>
<div class="panel">
    <label for="maxRecordingTime" class="spinner">{{__ "Time limit:"}}</label>
    <input name="maxRecordingTime" value="{{maxRecordingTime}}" class="large" data-increment="10" data-min="10" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "In seconds. Maximum recording time allowed (cannot be less than 10seconds). Recording will automatically stop once reached."}}
    </span>
</div>

<hr />

<div class="panel">
    <label for="recordingFormat">{{__ "Recording format"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "With compressed (lossy), the audio is saved as a webm or ogg file (small size) and with the compressed (lossless) it will ge saved in flac format (medium size). With uncompressed, as a lossless Wav file (bigger size)."}}
    </span>
    <select name="recordingFormat">
        <option value="compressed_lossy" {{#equal recordingFormat 'compressed_lossy'}}selected{{/equal}}>{{__ 'Compressed (lossy)'}}</option>
        <option value="compressed_lossless" {{#equal recordingFormat 'compressed_lossless'}}selected{{/equal}}>{{__ 'Compressed (lossless)'}}</option>
        <option value="uncompressed" {{#equal recordingFormat 'uncompressed'}}selected{{/equal}}>{{__ 'Uncompressed'}}</option>
    </select>
</div>

<div data-role="compressedLossyOptions" style="display: none">
    <div class="panel">
        <label for="audioBitrate" class="spinner">{{__ "Audio bitrate:"}}</label>
        <input name="audioBitrate" value="{{audioBitrate}}" class="large" data-increment="1000" data-min="8000" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "In bps (bits per second). Set the tradeoff between audio quality and filesize. With the default value (20.000bps), a 2minutes recording weights roughly 300KB."}}
        </span>
    </div>
</div>

<div data-role="compressedLosslessOptions" style="display: none">
    <div class="panel">
        <label for="sampleRate" class="spinner">{{__ "Sample Rate:"}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Audio sample rate"}}
        </span>
        <select name="sampleRate">
            <option value="8000"  {{#equal sampleRate 8000}}selected{{/equal}}>{{__ '8000 Hz'}}</option>
            <option value="11000" {{#equal sampleRate 11000}}selected{{/equal}}>{{__ '11000 Hz'}}</option>
            <option value="22000" {{#equal sampleRate 22000}}selected{{/equal}}>{{__ '22000 Hz'}}</option>
            <option value="22050" {{#equal sampleRate 22050}}selected{{/equal}}>{{__ '22050 Hz'}}</option>
            <option value="44100" {{#equal sampleRate 44100}}selected{{/equal}}>{{__ '44100 Hz'}}</option>
            <option value="48000" {{#equal sampleRate 48000}}selected{{/equal}}>{{__ '48000 Hz'}}</option>
        </select>

    </div>
    <div class="panel">
        <label for="flacCompressionLevel" class="spinner">{{__ "Compression level"}}</label>
        <input name="flacCompressionLevel" value="{{flacCompressionLevel}}" class="large" data-increment="1" data-min="0" data-max="8" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "The desired Flac compression level"}}
        </span>
    </div>
    <div class="panel">
        <label for="flacBps" class="spinner">{{__ "Bits per sample"}}</label>
        <input name="flacBps" value="{{flacBps}}" class="large" data-increment="1" data-min="1" data-max="32" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Bits per sample"}}
        </span>
    </div>
    <div class="panel">
        <label for="flacBlockSize" class="spinner">{{__ "Block size"}}</label>
        <input name="flacBlockSize" value="{{flacBlockSize}}" class="large" data-increment="1" data-min="0" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "The number of samples to user per frame"}}
        </span>
    </div>
    <div class="panel">
        <label>
            <input name="flacVerify" type="checkbox" {{#if flacVerify}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span>
            {{__ "Verify"}}
        </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
        {{__ "Enable or disable checksum verification during encoding"}}
    </span>
    </div>
</div>

<div data-role="uncompressedOptions" style="display: none">
    <div class="panel">
        <label for="isStereo">{{__ "Channels"}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Number of channels for the recording. Allow to cut the record size in half if used in mono."}}
        </span>
        <select name="isStereo">
            <option value="false"{{#unless isStereo}} selected="selected"{{/unless}}>{{__ 'Mono'}}</option>
            <option value="true"{{#if isStereo}} selected="selected"{{/if}}>{{__ 'Stereo'}}</option>
        </select>
    </div>
</div>

<hr />

<div class="panel">
    <label>
        <input name="useMediaStimulus" type="checkbox" {{#if useMediaStimulus}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Use media stimulus"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "This options allow to insert a media stimulus that will have to be played before recording can happen."}}
    </span>
</div>

<div class="panel">
    <div class="media-stimulus-properties-form{{#unless useMediaStimulus}} hidden{{/unless}}"></div>
</div>

<hr />

<h3 class="txt-error"><strong><span class="icon-warning"></span> {{__ "For tests only"}}</strong></h3>

<div class="panel">
    <label>
        <input name="displayDownloadLink" type="checkbox" {{#if displayDownloadLink}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow download"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "This is for testing purposes only. Displays a link to download the recorded file once the recording stops. This shouldn't be used in a delivery context, as it would allow the test taker to download its own recording."}}
    </span>
</div>
