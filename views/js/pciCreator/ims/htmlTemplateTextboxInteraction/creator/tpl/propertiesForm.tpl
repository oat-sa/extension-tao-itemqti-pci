<div class="panel">
    <label for="html" class="has-icon">{{__ "HTML Template"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The HTML template provided to the PCI's iframe. Can be a full HTML document or just body contents."}}</span>
    <input type="text"
           id="html"
           name="html"
           value="{{html}}"
           placeholder=""
           data-validate="$notEmpty;">
</div>

<div class="panel">
    <label for="responseSelector" class="has-icon">{{__ "Response selector"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "CSS selector of the response element (textarea or input)"}}</span>
    <input type="text"
           id="responseSelector"
           name="responseSelector"
           value="{{responseSelector}}"
           data-validate="$notEmpty;">
</div>

<div class="panel">
    <label for="wordcountSelector" class="has-icon">{{__ "Wordcount selector"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "CSS selector of the wordcount display element. Leave blank to hide wordcount."}}</span>
    <input type="text"
           id="wordcountSelector"
           name="wordcountSelector"
           value="{{wordcountSelector}}">
</div>
