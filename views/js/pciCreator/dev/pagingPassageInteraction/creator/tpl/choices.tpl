<ol class="plain block-listing solid choice-area">
    {{#each choices}}
    <li class="qti-choice qti-simpleChoice">
        <div class="pseudo-label-box js-label-box">
            <label class="real-label">
            {{#ifCond ../choiceType "==" "checkbox"}}
                <input type="checkbox" name="{{../../serial}}_choice" value="{{inc @index}}" {{#ifCond ../../state "==" "question"}} disabled="disabled" {{/ifCond}}>
                <span class="icon-checkbox"></span>
            {{/ifCond}}
            {{#ifCond ../choiceType "==" "radio"}}
                <input type="radio" name="{{../../serial}}_choice" value="{{inc @index}}" {{#ifCond ../../state "==" "question"}} disabled="disabled" {{/ifCond}}>
                <span class="icon-radio"></span>
            {{/ifCond}}
            </label>
            <div class="label-box">
                <div class="label-content clear js-choice-label" data-choice-index="{{@index}}">
                    <div>{{this}}</div>
                </div>
            </div>
        </div>
        <div class="mini-tlb" data-edit="question" data-for="" style="display: none;">
            <div class="rgt tlb-button js-remove-choice" data-choice-index="{{@index}}" title="Delete">
                <span class="icon-bin"></span>
            </div>
        </div>
    </li>
    {{/each}}
    {{#ifCond state "==" "question"}}
    <li class="add-option js-add-choice">
        <span class="icon-add"></span>
        Add choice
    </li>
    {{/ifCond}}
</ol>