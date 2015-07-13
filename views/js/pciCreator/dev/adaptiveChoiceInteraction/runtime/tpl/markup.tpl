<div class="adaptiveChoiceInteraction">
    <div id="feedback-box"></div>
    <div class="prompt">{{{prompt}}}</div>
    <div class="js-choice-container">
        <ol class="plain block-listing solid">
            {{#each choices}}
            <li class="qti-choice qti-simpleChoice">
                <div class="pseudo-label-box js-label-box">
                    <label class="real-label">
                        <input 
                            class="js-answer-input{{#if correct}} correct{{/if}}" 
                            type="{{../choiceType}}" 
                            name="RESPONSE" 
                            value="{{@index}}" 
                            {{#if ../states.question}}
                            disabled="disabled"
                            {{/if}}
                        />
                        <span class="icon-{{../choiceType}}"></span>
                    </label>
                    <div class="label-box">
                        <div class="label-content clear js-choice-label" data-choice-index="{{@index}}">
                            <div>{{label}}</div>
                        </div>
                    </div>
                </div>
                {{#if ../states.question}}
                <div class="mini-tlb" data-edit="question" style="display:block;">
                    <div class="rgt tlb-button js-remove-choice" data-choice-index="{{@index}}" title="Delete">
                        <span class="icon-bin"></span>
                    </div>
                </div>
                {{/if}}
            </li>
            {{/each}}
            {{#if states.question}}
            <li class="add-option js-add-choice">
                <span class="icon-add"></span>
                {{ __ 'Add choice'}}
            </li>
            {{/if}}
        </ol>
    </div>
</div>