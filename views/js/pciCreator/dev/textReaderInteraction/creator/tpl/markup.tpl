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
        \{{#xif "this.pages.length > 1 || this.onePageNavigation"}}
        <ul class="tr-tab-buttons js-tab-buttons \{{#xif "this.navigation == 'buttons'"}}hidden\{{/xif}}">
            \{{#each pages}}
            <li data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-tab-buttons__item">
                <span class="tr-tab-label">\{{inc @index}}</span>
                \{{#zif '"' ../this.state '" == "question"'}}
                <span class="js-remove-page tr-close-tab icon icon-bin" data-page-num="\{{@index}}" title="{{__ "Delete"}}"></span>
                \{{/zif}}
            </li>
            \{{/each}}
        </ul>
        \{{/xif}}     
                
        <div class="tr-pages-wrap clearfix">
            <div class="tr-pages" 
                \{{#xif 'this.state == "question"'}}
                style="height: \{{math pageHeight '+' 125 }}px"
                \{{else}}
                style="height: \{{math pageHeight '+' 25 }}px"
                \{{/xif}}
            >
            
                \{{#xif 'this.state == "question"'}}
                <div class="add-option js-add-page-before">
                    <span class="icon-add"></span>
                    Add page
                </div>
                \{{/xif}}
                        
                \{{#each pages}}
                <div data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-page js-tab-content tr-tabs-\{{@index}}">
                    \{{#zif '"' ../this.state '" == "question"'}}
                    <label class="tr-column-select">
                        {{__ "Columns:"}}
                        <select class="js-page-columns-select">
                            <option value="1" \{{#xif 'this.content.length == 1'}}selected \{{/xif}} >1</option>
                            <option value="2" \{{#xif 'this.content.length == 2'}}selected \{{/xif}} >2</option>
                            <option value="3" \{{#xif 'this.content.length == 3'}}selected \{{/xif}} >3</option>
                        </select>
                    </label>
                    <span class="icon-bin js-remove-page" data-page-num="\{{@index}}" title="{{__ "Delete"}}"></span>
                    \{{/zif}}
                    <div class="tr-passage" style="min-height: \{{../pageHeight}}px" >
                        \{{#each content}}
                        <div class="tr-passage-column widget-blockInteraction js-page-column" data-page-col-index="\{{@index}}">
                            \{{{this}}}
                        </div>
                        \{{/each}}
                    </div>
                </div>
                \{{/each}}
                        
                \{{#xif 'this.state == "question"'}}
                <div class="add-option js-add-page-after">
                    <span class="icon-add"></span>
                    Add page
                </div>
                \{{/xif}}
                        
            </div>
        </div>
    </div>
</script>    
<script class="text-reader-nav-tpl" type="text/x-handlebars-template">    
    <![CDATA[
    \{{#xif "this.navigation != 'tabs' && (this.pages.length > 1 || this.onePageNavigation)"}}
    <div class="tr-nav-wrap tr-nav-\{{tabsPosition}}">
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
    </div>
    \{{/xif}}
    ]]>
</script>