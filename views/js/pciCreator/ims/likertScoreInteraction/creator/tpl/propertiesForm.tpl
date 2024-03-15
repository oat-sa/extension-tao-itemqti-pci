<div class="panel">
    <label for="level">{{__ "Level"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Scale size"}}</span>
    <select name="level" class="select2" data-has-search="false">
        {{#each levels}}
        <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
        {{/each}}
    </select>
</div>

<div class="panel">
    <label>
        <input name="icons" type="checkbox" {{#if icons}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Show icons"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Display icons at each end, or not"}}</span>
</div>

<div class="panel">
    <label>
        <input name="numbers" type="checkbox" {{#if numbers}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span> {{__ "Show numbers"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "Display numbers above the choices, or not"}}</span>
</div>
