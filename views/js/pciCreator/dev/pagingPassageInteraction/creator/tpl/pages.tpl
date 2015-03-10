{{#ifCond state "==" "question"}}
<li class="add-option js-add-page-before">
    <span class="icon-add"></span>
    Add page
</li>
{{/ifCond}}
<div class="pp-tabs js-page-tabs">
    <ul>
        {{#each pages}}
        <li>
            <a href="#pp-tabs-{{@index}}">{{label}}</a>
            {{#ifCond ../state "==" "question"}}
            <span class="ui-icon ui-icon-close js-remove-page" data-page-num="{{@index}}" data-page-id="{{id}}">Remove Tab</span>
            {{/ifCond}}
        </li>
        {{/each}}
    </ul>
    {{#each pages}}
    <div id="pp-tabs-{{@index}}" data-page-num="{{@index}}" data-page-id="{{id}}">
        <div class="passage" style="height: {{../pageHeight}}px">
            {{{content}}}
        </div>
    </div>
    {{/each}}
</div>
{{#ifCond state "==" "question"}}
<li class="add-option js-add-page-after">
    <span class="icon-add"></span>
    Add page
</li>
{{/ifCond}}
{{#ifCond state "!=" "question"}}
<div class="pp-nav">
    <div class="pp-nav__col js-prev-page">
        <button class="btn-info small">{{../buttonLabels.prev}}</button>
    </div>
    <div class="pp-nav__col">
        Page <span class="js-current-page">{{../currentPage}}</span> of {{../pagesNum}}
    </div>
    <div class="pp-nav__col js-next-page">
        <button class="btn-info small">{{../buttonLabels.next}}</button>
    </div>
</div>
{{/ifCond}}
