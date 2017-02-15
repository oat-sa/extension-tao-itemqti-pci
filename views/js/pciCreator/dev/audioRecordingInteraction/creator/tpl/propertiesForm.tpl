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
    <label>
        <input name="displayDownloadLink" type="checkbox" {{#if displayDownloadLink}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Display link"}} <span class="txt-error"><strong>{{__ " - TEST ONLY "}}</strong></span>
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "This is for testing purposes only. Displays a link to download the recorded file once the recording stops. This shouldn't be used in a delivery context, as it would allow the test taker to download its own recording."}}
    </span>
</div>

<div class="panel">
    <label for="audioBitrate" class="spinner">{{__ "Audio bitrate:"}}</label>
    <input name="audioBitrate" value="{{audioBitrate}}" class="large" data-increment="1000" data-min="8000" type="text" />
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "In bps (bits per second). Set the tradeoff between audio quality and filesize. ith the default value (20.000bps), a 2minutes recording weights roughly 300KB."}}
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
