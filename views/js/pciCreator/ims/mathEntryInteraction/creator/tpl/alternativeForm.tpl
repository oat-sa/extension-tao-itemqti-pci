<div class="math-entry-response-wrap">
    <div class="math-entry-alternative-wrap">
        <span class="math-entry-response-title math-entry-response-alternative">{{__ "Alternative"}}
            <a href="#" class="answer-delete">
                <span class="icon-bin tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
                <div class="tooltip-content">{{__ "delete the answer"}}</div>
            </a>
        </span>
        <span class="math-entry-input mq-math-mode mq-editable-field math-entry-alternative-input" data-index="{{index}}">
    </div>
    <div class="math-entry-score-wrap math-entry-response-alternative">
        <span class="math-entry-score-title math-entry-response-alternative">{{__ "Score"}}</span>
        <input value="{{score}}" type="text" data-for="{{index}}" name="mathEntryScoreInput" class="math-entry-score-input math-entry-response-alternative" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" placeholder="{{placeholder}}">
    </div>
</div>
