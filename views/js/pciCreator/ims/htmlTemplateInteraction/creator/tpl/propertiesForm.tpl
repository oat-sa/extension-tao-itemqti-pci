<div class="panel">
    <label for="html" class="has-icon">{{__ "HTML Template"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">{{__ "The HTML template provided to the PCI's iframe. Can be a full HTML document or just body contents. Can contain inline styles or images, but no scripts. For a single or multiple response elements, add 'name=\"the-name\"' and 'data-response' attributes to each one. For wordcount display, add an empty element with 'data-wordcount-for=\"the-name\"' attribute."}}</span>
    <input type="text"
           id="html"
           name="html"
           value="{{html}}"
           placeholder=""
           data-validate="$notEmpty;">
</div>
