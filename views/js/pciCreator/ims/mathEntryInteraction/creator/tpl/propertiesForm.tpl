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
        <svg xmlns="http://www.w3.org/2000/svg" height="1em" width="1em" viewBox="0 0 400 400" version="1.0">
            <path d="m193.39062 4.859375-50.8125 317.375-79.093743-160.71876-58.781256 29.46875l6.6250007 12.5 38.687495-17.75 96.875003 199.40625 58.6875-366.28124h144.71876v-14h-142.46876-10.21874-4.21876z"></path>
            <text class="">√</text>
        </svg>
        {{__ "square root"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_nthroot" type="checkbox" {{#if tool_nthroot}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        <svg xmlns:xlink="http://www.w3.org/1999/xlink" width="3.266ex" height="3.009ex" style="vertical-align: -1.005ex;" viewBox="0 -863.1 1406 1295.7" role="img" focusable="false" xmlns="http://www.w3.org/2000/svg">
            <defs aria-hidden="true">
                <path stroke-width="1" id="E1-MJMATHI-78" d="M52 289Q59 331 106 386T222 442Q257 442 286 424T329 379Q371 442 430 442Q467 442 494 420T522 361Q522 332 508 314T481 292T458 288Q439 288 427 299T415 328Q415 374 465 391Q454 404 425 404Q412 404 406 402Q368 386 350 336Q290 115 290 78Q290 50 306 38T341 26Q378 26 414 59T463 140Q466 150 469 151T485 153H489Q504 153 504 145Q504 144 502 134Q486 77 440 33T333 -11Q263 -11 227 52Q186 -10 133 -10H127Q78 -10 57 16T35 71Q35 103 54 123T99 143Q142 143 142 101Q142 81 130 66T107 46T94 41L91 40Q91 39 97 36T113 29T132 26Q168 26 194 71Q203 87 217 139T245 247T261 313Q266 340 266 352Q266 380 251 392T217 404Q177 404 142 372T93 290Q91 281 88 280T72 278H58Q52 284 52 289Z"></path>
                <path stroke-width="1" id="E1-MJMAIN-221A" d="M95 178Q89 178 81 186T72 200T103 230T169 280T207 309Q209 311 212 311H213Q219 311 227 294T281 177Q300 134 312 108L397 -77Q398 -77 501 136T707 565T814 786Q820 800 834 800Q841 800 846 794T853 782V776L620 293L385 -193Q381 -200 366 -200Q357 -200 354 -197Q352 -195 256 15L160 225L144 214Q129 202 113 190T95 178Z"></path>
                <path stroke-width="1" id="E1-MJMATHI-6E" d="M21 287Q22 293 24 303T36 341T56 388T89 425T135 442Q171 442 195 424T225 390T231 369Q231 367 232 367L243 378Q304 442 382 442Q436 442 469 415T503 336T465 179T427 52Q427 26 444 26Q450 26 453 27Q482 32 505 65T540 145Q542 153 560 153Q580 153 580 145Q580 144 576 130Q568 101 554 73T508 17T439 -10Q392 -10 371 17T350 73Q350 92 386 193T423 345Q423 404 379 404H374Q288 404 229 303L222 291L189 157Q156 26 151 16Q138 -11 108 -11Q95 -11 87 -5T76 7T74 17Q74 30 112 180T152 343Q153 348 153 366Q153 405 129 405Q91 405 66 305Q60 285 60 284Q58 278 41 278H27Q21 284 21 287Z"></path>
            </defs>
            <g stroke="currentColor" fill="currentColor" stroke-width="0" transform="matrix(1 0 0 -1 0 0)" aria-hidden="true">
                <use transform="scale(0.574)" xlink:href="#E1-MJMATHI-6E" x="363" y="586"></use>
                <use xlink:href="#E1-MJMAIN-221A" x="0" y="-109"></use>
                <rect stroke="none" width="572" height="60" x="833" y="632"></rect>
                <use xlink:href="#E1-MJMATHI-78" x="833" y="0"></use>
            </g>
        </svg>
        {{__ "nth root"}}
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
        x&#8336; {{__ "subscript"}}
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
        e
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
        &#x222b; {{__ "Indefinite integral"}}
    </label>
</div>

<hr />
<h3>{{__ "Geometry"}}</h3>

<div>
    <label class="panel">
        <input name="tool_angle" type="checkbox" {{#if tool_angle}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &ang; {{__ "angle"}}
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
        &#9651; {{__ "triangle"}}
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
<div>
    <label class="panel">
        <input name="tool_tan" type="checkbox" {{#if tool_tan}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "tangent"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_cot" type="checkbox" {{#if tool_cot}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "cotangent"}}
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
        {{__ "≤"}} {{__ "lower than or equal"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_gte" type="checkbox" {{#if tool_gte}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "≥"}} {{__ "greater than or equal"}}
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
        {{__ "is a member of"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_ninmem" type="checkbox" {{#if tool_ninmem}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "is not a member of"}}
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
<div>
    <label class="panel">
        <input name="tool_supset" type="checkbox" {{#if tool_supset}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "set superset"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_subset" type="checkbox" {{#if tool_subset}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "set subset"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_ratio" type="checkbox" {{#if tool_ratio}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8758; {{__ "ratio"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_congruence" type="checkbox" {{#if tool_congruence}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8801; {{__ "congruence"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_limit" type="checkbox" {{#if tool_limit}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        {{__ "limit"}}
    </label>
</div>
<div>
    <label class="panel">
        <input name="tool_sum" type="checkbox" {{#if tool_sum}}checked="checked"{{/if}}/>
        <span class="icon-checkbox"></span>
        &#8721; {{__ "sum"}}
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

