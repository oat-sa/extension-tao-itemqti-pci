    <div class="action-header">
        <span class="switch-header">Enabled in item authoring</span>
    </div>
{{#each interactions}}
<li data-type-identifier="{{typeIdentifier}}" class="pci-list-element{{#unless enabled}} pci-disabled"{{/unless}}">
    <span class="desc truncate">
        <span class="name">({{model}}{{#runtimeOnly}} <span class="runtime">- runtime only</span>{{/runtimeOnly}}) - {{label}} - v{{version}}</span>
        <span class="disable-tag">- {{__ "disabled"}}</span>
    </span>

    <div class="actions">
        {{#unless runtimeOnly}}<div class="pci-switch"></div>{{/unless}}
        {{#unless runtimeOnly}}<div class="pci-download-button"></div>{{/unless}}
        <div class="pci-unregister-button"></div>
    </div>
</li>
{{/each}}