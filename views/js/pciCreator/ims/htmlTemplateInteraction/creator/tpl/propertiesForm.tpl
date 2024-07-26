<div class="panel">
    <label for="" class="has-icon">{{__ "Response identifier"}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'The identifier of the choice. This identifier must not be used by any other response or item variable. An identifier is a string of characters that must start with a Letter or an underscore ("_") and contain only Letters, underscores, hyphens ("-"), period (".", a.k.a. full-stop), Digits, CombiningChars and Extenders.'}}</div>

    <input type="text"
           name="identifier"
           value="{{identifier}}"
           placeholder="e.g. RESPONSE"
           data-validate="$notEmpty; $qtiIdentifier; $availableIdentifier(serial={{serial}});">
</div>

<hr />

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
