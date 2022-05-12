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
        <input name="navigationLock" type="checkbox" {{#if navigationLock}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Navigation lock"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'If this box is checked the test runner navigation to be disabled until the test-taker gave an answer to it.'}}
    </span>
</div>