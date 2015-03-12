<div class="textReaderInteraction qti-interaction">
    <div class="prompt">{{{prompt}}}</div>
    <div class="tr-wrap">
        <div class="tr-wrap__col">
            <div class="tr-content solid js-page-container">
            </div>
        </div>
        <div class="tr-wrap__col">
            <div class="tr-answer js-choice-container">

            </div>
        </div>
    </div>
</div>
<script id="text-reader-choices-tpl" type="text/x-handlebars-template">
    <![CDATA[
    <ol class="plain block-listing solid choice-area">
        \{{#each choices}}
        <li class="qti-choice qti-simpleChoice">
            <div class="pseudo-label-box js-label-box">
                <label class="real-label">
                \{{#ifCond ../choiceType "==" "checkbox"}}
                    <input class="js-answer-input" type="checkbox" name="\{{../../serial}}_choice" value="\{{inc @index}}" \{{#ifCond ../../state "==" "question"}} disabled="disabled" \{{/ifCond}}>
                    <span class="icon-checkbox"></span>
                \{{/ifCond}}
                \{{#ifCond ../choiceType "==" "radio"}}
                    <input class="js-answer-input" type="radio" name="\{{../../serial}}_choice" value="\{{inc @index}}" \{{#ifCond ../../state "==" "question"}} disabled="disabled" \{{/ifCond}}>
                    <span class="icon-radio"></span>
                \{{/ifCond}}
                </label>
                <div class="label-box">
                    <div class="label-content clear js-choice-label" data-choice-index="\{{@index}}">
                        <div>\{{this}}</div>
                    </div>
                </div>
            </div>
            <div class="mini-tlb" data-edit="question" data-for="" style="display: none;">
                <div class="rgt tlb-button js-remove-choice" data-choice-index="\{{@index}}" title="Delete">
                    <span class="icon-bin"></span>
                </div>
            </div>
        </li>
        \{{/each}}
        \{{#ifCond state "==" "question"}}
        <li class="add-option js-add-choice">
            <span class="icon-add"></span>
            Add choice
        </li>
        \{{/ifCond}}
    </ol>
    ]]>
</script>
<script id="text-reader-pages-tpl" type="text/x-handlebars-template">
    <![CDATA[
    \{{#ifCond state "==" "question"}}
    <li class="add-option js-add-page-before">
        <span class="icon-add"></span>
        Add page
    </li>
    \{{/ifCond}}
    <div class="tr-tabs js-page-tabs tr-tabs-\{{tabsPosition}} clearfix">
        <ul class="tr-tab-buttons js-tab-buttons">
            \{{#each pages}}
            <li data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-tab-buttons__item">
                <button class="btn-button small">{{__ "Page"}} \{{inc @index}}</button>
                \{{#ifCond ../state "==" "question"}}
                <span class="js-remove-page icon icon-close"></span>
                \{{/ifCond}}
            </li>
            \{{/each}}
        </ul>
        \{{#each pages}}
        <div id="tr-tabs-\{{@index}}" data-page-num="\{{@index}}" data-page-id="\{{id}}" class="tr-page js-tab-content">
            <div class="passage widget-blockInteraction" style="height: \{{../pageHeight}}px">
                \{{{content}}}
            </div>
        </div>
        \{{/each}}
    </div>
    \{{#ifCond state "==" "question"}}
    <li class="add-option js-add-page-after">
        <span class="icon-add"></span>
        Add page
    </li>
    \{{/ifCond}}
    \{{#ifCond state "!=" "question"}}
    <div class="tr-nav">
        <div class="tr-nav__col js-prev-page">
            <button class="btn-info small">\{{../buttonLabels.prev}}</button>
        </div>
        <div class="tr-nav__col">
            Page <span class="js-current-page">\{{../currentPage}}</span> of \{{../pagesNum}}
        </div>
        <div class="tr-nav__col js-next-page">
            <button class="btn-info small">\{{../buttonLabels.next}}</button>
        </div>
    </div>
    \{{/ifCond}}
    ]]>
</script>