    <div class="action-header">
        <span class="switch-header">Enabled in item authoring</span>
    </div>
{{#each interactions}}
<li data-type-identifier="{{typeIdentifier}}" class="pci-list-element{{#unless enabled}} pci-disabled"{{/unless}}">
    <span class="desc truncate">
        <span class="name">({{model}}) - {{label}} - v{{version}}</span>
        <span class="disable-tag">- {{__ "disabled"}}</span>
    </span>

    <div class="actions">
        <div class="pci-switch"></div>
        <div class="pci-buttons"></div>
    </div>
</li>
{{/each}}