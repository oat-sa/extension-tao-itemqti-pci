<ol class="plain block-listing solid choice-area">\
    {{#each choices}}
    <li class="qti-choice qti-simpleChoice">
        <div class="pseudo-label-box">
            <label class="real-label">
                <input type="checkbox" name="" value="" disabled="disabled">
                <span class="icon-checkbox"></span>
            </label>
            <div class="label-box">
                <div class="label-content clear" contenteditable="false">
                    <div data-html-editable="true">choice #1</div>
                </div>
            </div>
        </div>
    </li>
    {{/each}}
    <li class="add-option" style="display: list-item;">
        <span class="icon-add"></span>
        Add choice
    </li>
</ol>