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

<div data-role="delayOptions" {{#unless autoStart}}style="display:none"{{/unless}}>
    <div class="panel">
        <label for="delayMinutes" class="spinner">{{__ "Min:"}}</label>
        <input name="delayMinutes" value="{{delayMinutes}}" data-increment="1" data-min="0" data-max="20" type="text" />
        <label for="delaySeconds" class="spinner">{{__ "Sec:"}}</label>
        <input name="delaySeconds" value="{{delaySeconds}}" data-increment="15" data-min="0" data-max="45" type="text" />
    </div>
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
    <label for="isCompressed">{{__ "Recording format"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "With compressed recording, the audio is saved as a webm or ogg file (smaller size). With uncompressed, as a lossless Wav file (much bigger size)."}}
    </span>
    <select name="isCompressed">
        <option value="true"{{#if isCompressed}} selected="selected"{{/if}}>{{__ 'Compressed'}}</option>
        <option value="false"{{#unless isCompressed}} selected="selected"{{/unless}}>{{__ 'Uncompressed'}}</option>
    </select>
</div>

<div data-role="compressedOptions" {{#unless isCompressed}}style="display:none"{{/unless}}>
    <div class="panel">
        <label for="audioBitrate" class="spinner">{{__ "Audio bitrate:"}}</label>
        <input name="audioBitrate" value="{{audioBitrate}}" class="large" data-increment="1000" data-min="8000" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "In bps (bits per second). Set the tradeoff between audio quality and filesize. With the default value (20.000bps), a 2minutes recording weights roughly 300KB."}}
        </span>
    </div>
</div>

<div data-role="uncompressedOptions"  {{#if isCompressed}}style="display:none"{{/if}}>
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
