<div class="panel mathEntryInteraction">
    <hr>
    <h3>{{__ "Define correct responses"}}:</h3>
    <div class="answer-entries-config" data-config-for-hot-uid="{{@key}}">
        <div class="panel">
            <div class="entry-config">
                {{#each correctAnswerEntries}}
                <div class="correct-answer-entry" data-correct-answer="{{this}}">
                    <p>{{__ "Correct answer option"}} {{increaseIndex @index}}</p>
                    <a href="#" class="answer-edit" id="edit_{{@index}}">
                        <span class="icon-edit"></span>
                        <span>{{__ "edit the answer"}}</span>
                    </a>

                    <br>

                    <a href="#" class="answer-delete" id="delete_{{@index}}">
                        <span class="icon-bin"></span>
                        <span>{{__ "delete the answer"}}</span>
                    </a>
                </div>
                <br>
                {{/each}}
            </div>
        </div>

    </div>

</div>


