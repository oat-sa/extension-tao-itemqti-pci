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
    <label class="panel">
        <input name="allowPlayback" type="checkbox" {{#if allowPlayback}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Allow playback"}}
    </label>
    <label class="panel">
        <input name="autoStart" type="checkbox" {{#if autoStart}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Auto start recording"}}
    </label>
    <div class="panel creator-mathEntryInteraction-spinner">
        <label for="audioBitrate" class="spinner">{{__ "Audio bitrate (in bits per second)"}}</label>
        <input name="audioBitrate" value="{{audioBitrate}}" data-increment="1000" data-min="8000" type="text" />
    </div>
    <div class="panel creator-mathEntryInteraction-spinner">
        <label for="maxRecords" class="spinner">{{__ "Number of allowed recording attemps (0 = unlimited)"}}</label>
        <input name="maxRecords" value="{{maxRecords}}" data-increment="1" data-min="0" type="text" />
    </div>
    <div class="panel creator-mathEntryInteraction-spinner">
        <label for="maxRecordingTime" class="spinner">{{__ "Max recording time (in seconds)"}}</label>
        <input name="maxRecordingTime" value="{{maxRecordingTime}}" data-increment="10" data-min="10" type="text" />
    </div>
</div>

<hr />

<div class="panel">
    <h3>{{__ "Testing options"}}</h3>
    <label>
        <input name="displayDownloadLink" type="checkbox" {{#if displayDownloadLink}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Display download link"}}
    </label>
</div>
