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
        &radic; {{__ "square root"}}
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
        x&#8319; {{__ "exponent"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_subscript" type="checkbox" {{#if tool_subscript}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        x&#8345; {{__ "subscript"}}
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
        <input name="roundbkts" type="checkbox" {{#if roundbkts}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        ( ) {{__ "parentheses/round brackets"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="curlybkts" type="checkbox" {{#if curlybkts}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        { } {{__ "braces/curly brackets"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="squarebkts" type="checkbox" {{#if squarebkts}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        [ ] {{__ "square brackets"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_integral" type="checkbox" {{#if tool_integral}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Indefinite integral"}}
    </label>
</div>

<hr />
<h3>{{__ "Geometry"}}</h3>

<div>
    <label class="panel">
        <input name="tool_angle" type="checkbox" {{#if tool_angle}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &ang; {{__ "angle" }}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_integral" type="checkbox" {{#if tool_integral}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "Indefinite integral"}}
        </label>
</div>
<div>
    <label class="panel">
        <input name="tool_triangle" type="checkbox" {{#if tool_triangle}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#9651; {{__ "triangle" }}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_similar" type="checkbox" {{#if tool_similar}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &sim; {{__ "similar"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_paral" type="checkbox" {{#if tool_paral}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8741; {{__ "is parallel with"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_perp" type="checkbox" {{#if tool_perp}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8869; {{__ "is perpendicular to"}}
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
        <input name="tool_lower" type="checkbox" {{#if tool_lower}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &lt; {{__ "lower than"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_greater" type="checkbox" {{#if tool_greater}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &gt; {{__ "greater than"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_lte" type="checkbox" {{#if tool_lte}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &le; {{__ "lower than or equal"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_gte" type="checkbox" {{#if tool_gte}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &ge; {{__ "greater than or equal"}}
    </label>
</div>

<hr />
<h3>{{__ "Operands"}}</h3>

<div>
    <label class="panel">
        <input name="tool_equal" type="checkbox" {{#if tool_equal}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        = {{__ "equal"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_plus" type="checkbox" {{#if tool_plus}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        + {{__ "plus"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_minus" type="checkbox" {{#if tool_minus}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        – {{__ "minus"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_times" type="checkbox" {{#if tool_times}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &times; {{__ "times"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_timesdot" type="checkbox" {{#if tool_timesdot}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        · {{__ "times dot"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_divide" type="checkbox" {{#if tool_divide}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &divide; {{__ "divide"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_plusminus" type="checkbox" {{#if tool_plusminus}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#177; {{__ "Plus/minus"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_inmem" type="checkbox" {{#if tool_inmem}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "is member of"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_ninmem" type="checkbox" {{#if tool_ninmem}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "is not member of"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_union" type="checkbox" {{#if tool_union}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "set union"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_intersec" type="checkbox" {{#if tool_intersec}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "set intersection"}}
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

