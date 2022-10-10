<div class="math-entry-response-wrap">
    <div class="math-entry-alternative-wrap" data-index="{{index}}">
        <span class="math-entry-response-title math-entry-response-alternative">{{__ "Alternative"}}
            <a href="#" class="answer-delete">
                <span class="icon-bin"></span>
                <span>{{__ "delete the answer"}}</span>
            </a>
        </span>
        <span class="math-entry-input mq-math-mode mq-editable-field math-entry-alternative-input" style="display: block;">
    </div>
    <div class="math-entry-score-wrap math-entry-response-alternative">
        <span class="math-entry-score-title math-entry-response-alternative">{{__ "Score"}}</span>
        <input value="{{score}}" type="text" data-for="{{index}}" name="mathEntryScoreInput" class="math-entry-score-input math-entry-response-alternative" data-validate="$numeric" data-validate-option="$allowEmpty; $event(type=keyup)" placeholder="{{placeholder}}">
    </div>
</div>
