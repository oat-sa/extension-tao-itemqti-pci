<div class="textReaderInteraction qti-interaction">
    <div class="tr-wrap">
        <div class="tr-content js-page-container">
        </div>
        <div class="js-nav-container">
        </div>
    </div>
</div>
<script class="text-reader-pages-tpl" type="text/x-handlebars-template">
    <![CDATA[
    <div class="tr-tabs js-page-tabs tr-tabs-\{{tabsPosition}} clearfix">
        <ul class="tr-tab-buttons js-tab-buttons \{{#ifCond navigation "==" "buttons"}}hidden\{{/ifCond}}">
            \{{#each pages}}
            <li data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-tab-buttons__item">
                <span class="tr-tab-label">\{{inc @index}}</span>
                \{{#ifCond ../state "==" "question"}}
                <span class="js-remove-page tr-close-tab icon icon-result-nok"></span>
                \{{/ifCond}}
            </li>
            \{{/each}}
        </ul>

                
        <div class="tr-pages-wrap clearfix">
                    
            \{{#ifCond state "==" "question"}}
            <li class="add-option js-add-page-before">
                <span class="icon-add"></span>
                Add page
            </li>
            \{{/ifCond}}
                    
                    
            \{{#each pages}}
            <div data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-page js-tab-content tr-tabs-\{{@index}}" style="height: \{{../pageHeight}}px">
                \{{#ifCond ../state "==" "question"}}
                <label class="tr-column-select">
                    {{__ "Columns:"}}
                    <select class="select2 js-page-columns-select" data-has-search="false">
                        <option value="1" \{{#ifCond this.content.length "==" 1}}selected \{{/ifCond}} >1</option>
                        <option value="2" \{{#ifCond this.content.length "==" 2}}selected \{{/ifCond}} >2</option>
                        <option value="3" \{{#ifCond this.content.length "==" 3}}selected \{{/ifCond}} >3</option>
                    </select>
                </label>
                \{{/ifCond}}
                <div class="tr-passage widget-blockInteraction">
                    \{{#each content}}
                    <div class="tr-passage-column js-page-column" data-page-col-index="\{{@index}}">
                        \{{{this}}}
                    </div>
                    \{{/each}}
                </div>
            </div>
            \{{/each}}
                    
            \{{#ifCond state "==" "question"}}
            <li class="add-option js-add-page-after">
                <span class="icon-add"></span>
                Add page
            </li>
            \{{/ifCond}}
        </div>
                
    </div>
</script>    
<script class="text-reader-nav-tpl" type="text/x-handlebars-template">    
    <![CDATA[
    \{{#ifCond navigation "!=" "tabs"}}
    <div class="tr-nav">
        <div class="tr-nav__col js-prev-page">
            <button class="btn-info small">\{{../buttonLabels.prev}}</button>
        </div>
        <div class="tr-nav__col">
            Page <span class="js-current-page">\{{../currentPage}}</span> / \{{../pagesNum}}
        </div>
        <div class="tr-nav__col js-next-page">
            <button class="btn-info small">\{{../buttonLabels.next}}</button>
        </div>
    </div>
    \{{/ifCond}}
    ]]>
</script>