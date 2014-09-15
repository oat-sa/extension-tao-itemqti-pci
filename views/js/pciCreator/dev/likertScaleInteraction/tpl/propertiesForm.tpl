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
    <label for="label-min" class="spinner">{{__ "Lower bound"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'The label of lower bound.'}}
    </span>
    <input name="label-min" value="{{label-min}}" type="text" />

</div>

<div class="panel">
    <label for="label-max" class="spinner">{{__ "Upper bound"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ 'The label of thee upper bound.'}}
    </span>
    <input name="label-max" value="{{label-max}}" type="text" />
</div>