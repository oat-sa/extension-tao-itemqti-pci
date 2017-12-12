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

<hr />

<h3>{{__ "Options"}}</h3>

<div>
    <label class="panel">
        <input name="authorizeWhiteSpace" type="checkbox" {{#if authorizeWhiteSpace}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "authorize white space"}}
    </label>
    <label class="panel">
        <input name="useGapExpression" type="checkbox" {{#if useGapExpression}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "use expression with gaps"}}
    </label>
    <div class="panel mathgap-style-box" {{#unless useGapExpression}}style="display:none"{{/unless}}>
        <label for="gapStyle">{{__ "Gap size"}}</label>
        <select name="gapStyle" data-mathgap-style>
            <option value="math-gap-small">{{__ 'Small'}}</option>
            <option value="math-gap-medium">{{__ 'Medium'}}</option>
            <option value="math-gap-large">{{__ 'Large'}}</option>
        </select>
    </div>
</div>

<hr />

<h3>{{__ "Functions"}}</h3>

<div>
    <label class="panel">
        <input name="tool_sqrt" type="checkbox" {{#if tool_sqrt}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "square root"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_frac" type="checkbox" {{#if tool_frac}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "fraction"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_exp" type="checkbox" {{#if tool_exp}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "exponent"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_log" type="checkbox" {{#if tool_log}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "log"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_ln" type="checkbox" {{#if tool_ln}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "ln"}}
    </label>
</div>

<hr />
<h3>{{__ "Symbols"}}</h3>

<div>
    <label class="panel">
        <input name="tool_e" type="checkbox" {{#if tool_e}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8494;
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_infinity" type="checkbox" {{#if tool_infinity}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8734;
    </label>
</div>
<div>
    <label class="panel">
        <input name="squarebkts" type="checkbox" {{#if squarebkts}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        [ ] square brackets
    </label>
</div>

<hr />
<h3>{{__ "Trigonometry"}}</h3>

<div>
    <label class="panel">
        <input name="tool_pi" type="checkbox" {{#if tool_pi}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &pi;
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_cos" type="checkbox" {{#if tool_cos}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "cosinus"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_sin" type="checkbox" {{#if tool_sin}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "sinus"}}
    </label>
</div>

<hr />
<h3>{{__ "Comparison"}}</h3>

<div>
    <label class="panel">
        <input name="tool_lte" type="checkbox" {{#if tool_lte}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "lower than or equal"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_gte" type="checkbox" {{#if tool_gte}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "greater than or equal"}}
    </label>
</div>

<hr />
<h3>{{__ "Operands"}}</h3>

<div>
    <label class="panel">
        <input name="tool_times" type="checkbox" {{#if tool_times}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "times"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_divide" type="checkbox" {{#if tool_divide}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "divide"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_plusminus" type="checkbox" {{#if tool_plusminus}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Plus/minus"}}
    </label>
</div>

<hr />

<h3 class="txt-error"><strong><span class="icon-warning"></span> {{__ "Experimental only"}}</strong></h3>

<div>
    <label class="panel">
        <input name="allowNewLine" type="checkbox" {{#if allowNewLine}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "allow line break"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="enableAutoWrap" type="checkbox" {{#if enableAutoWrap}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "enable auto wrap"}}
    </label>
</div>

