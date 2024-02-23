<div class="likertInteraction">
    <style>
    .likertInteraction {
        --likert-choice-gap: 1em;
    }
    .likertInteraction .row {
        display: flex;
        align-items: center;
        margin-top: 1em;
    }
    .likertInteraction .row svg {
        margin-block: 0.5em;
    }
    .likertInteraction .row svg:first-of-type {
        margin-inline-start: 0.5em;
    }
    .likertInteraction .row svg:last-of-type {
        margin-inline-end: 0.5em;
    }
    .likertInteraction .row ol.likert {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--likert-choice-gap);
        list-style-type: none;
        margin: 0.25em 1em 0;
        padding: 0;
    }
    .likertInteraction.numbers-above .row {
        align-items: flex-end;
        margin-top: 1em;
    }
    .likertInteraction .row ol input {
        position: relative;
        margin: 0;
        padding: 0;
        color: inherit;
    }
    .likertInteraction.numbers-above .row ol input::before {
        content: counter(list-item);
        display: block;
        text-align: center;
        min-width: 2ch;
        position: absolute;
        top: -1.75em;
        left: -0.15em;
    }
    </style>
    <div class="prompt">{{{prompt}}}</div>
    <div class="row">
        <ol class="likert"></ol>
    </div>
</div>
