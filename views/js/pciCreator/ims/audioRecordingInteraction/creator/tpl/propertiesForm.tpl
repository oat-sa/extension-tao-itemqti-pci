<div class="panel">
    <label for="response-identifier" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input id="response-identifier"
           type="text"
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
        <input name="hideStopButton" type="checkbox" {{#if hideStopButton}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Hide stop button"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Hide the stop button from test takers."}}
    </span>
</div>

<div class="panel">
    <label>
        <input name="autoStart" type="checkbox" {{#if autoStart}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Auto start recording"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Recording starts automatically once test taker give microphone use authorisation."}}
    </span>
</div>

<div data-role="delayOptions" {{#unless autoStart}}style="display:none"{{/unless}}>
    <div class="panel">
        <label for="delay-minutes" class="spinner">{{__ "Min:"}}</label>
        <input id="delay-minutes" name="delayMinutes" value="{{delayMinutes}}" data-increment="1" data-min="0" data-max="20" type="text" />
        <label for="delay-seconds" class="spinner">{{__ "Sec:"}}</label>
        <input id="delay-seconds" name="delaySeconds" value="{{delaySeconds}}" data-increment="15" data-min="0" data-max="45" type="text" />
    </div>
</div>

<div data-role="hideRecordOption" {{#unless autoStart}}style="display:none"{{/unless}}>
    <div class="panel">
        <label>
            <input name="hideRecordButton" type="checkbox" {{#if hideRecordButton}}checked="checked"{{/if}}/>
            <span class="icon-checkbox"></span> {{__ "Hide record button"}}
         </label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Hide the record button from test takers."}}
        </span>
    </div>
</div>

<div class="panel">
    <label>
        <input name="autoPlayback" type="checkbox" {{#if autoPlayback}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Auto playback recording"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Recorded audio is automatically played back after recording stops. During playback, no user interaction is possible and all buttons are disabled."}}
    </span>
</div>

<div class="panel">
    <label>
        <input name="playSound" type="checkbox" {{#if playSound}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Play sound"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Play a sound at the start and end of recording."}}
    </span>
</div>

<div class="panel">
    <label for="max-records" class="spinner">{{__ "Max attempts:"}}</label>
    <input id="max-records" name="maxRecords" value="{{maxRecords}}" class="large" data-increment="1" data-min="0" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Maximum number of recording attempts allowed to the test taker. Set to 0 to allow unlimited attempts. With a limit of 3, the test taker will be able to click 2 times on the reset button."}}
    </span>
</div>

<div class="panel">
    <label for="max-recording-time" class="spinner">{{__ "Time limit:"}}</label>
    <input id="max-recording-time" name="maxRecordingTime" value="{{maxRecordingTime}}" class="large" data-increment="5" data-min="5" data-max="{{maximumRecordingTimeLimit}}" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "In seconds. Maximum recording time allowed (cannot be less than 5 seconds). Recording will automatically stop once reached."}}
    </span>
</div>

<hr />
<div class="panel">
    <label for="is-compressed">{{__ "Recording format"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "With compressed recording, the audio is saved as a webm or ogg file (smaller size). With uncompressed, as a lossless Wav file (much bigger size)."}}
    </span>
    <select id="is-compressed" name="isCompressed">
        <option value="true"{{#if isCompressed}} selected="selected"{{/if}}>{{__ 'Compressed'}}</option>
        <option value="false"{{#unless isCompressed}} selected="selected"{{/unless}}>{{__ 'Uncompressed'}}</option>
    </select>
</div>

<div data-role="compressedOptions" {{#unless isCompressed}}style="display:none"{{/unless}}>
    <div class="panel">
        <label for="audio-bitrate" class="spinner">{{__ "Audio bitrate:"}}</label>
        <input id="audio-bitrate" name="audioBitrate" value="{{audioBitrate}}" class="large" data-increment="1000" data-min="8000" type="text" />
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "In bps (bits per second). Set the tradeoff between audio quality and filesize. With the default value (20.000bps), a 2minutes recording weights roughly 300KB."}}
        </span>
    </div>
</div>

<div data-role="uncompressedOptions"  {{#if isCompressed}}style="display:none"{{/if}}>
    <div class="panel">
        <label for="is-stereo">{{__ "Channels"}}</label>
        <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <span class="tooltip-content">
            {{__ "Number of channels for the recording. Allow to cut the record size in half if used in mono."}}
        </span>
        <select id="is-stereo" name="isStereo">
            <option value="false"{{#unless isStereo}} selected="selected"{{/unless}}>{{__ 'Mono'}}</option>
            <option value="true"{{#if isStereo}} selected="selected"{{/if}}>{{__ 'Stereo'}}</option>
        </select>
    </div>
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

<div class="panel">
    <label for="partial-update-interval" class="spinner">{{__ "Update interval:"}}</label>
    <input id="partial-update-interval" name="partialUpdateInterval" value="{{partialUpdateInterval}}" class="large" data-increment="1" data-min="1" data-max="60" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "In seconds. The time interval between partial updates of the recording."}}
    </span>
</div>
