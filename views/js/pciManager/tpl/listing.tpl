    <div class="action-header">
        <span class="switch-header">{{__ 'Enabled in item authoring'}}</span>
    </div>
{{#each interactions}}
<li data-type-identifier="{{typeIdentifier}}" data-pci-identifier="{{pci_identifier}}" class="pci-list-element{{#unless enabled}} pci-disabled"{{/unless}}">
    <span class="desc truncate">
        <span class="name">({{model}}{{#if runtimeOnly}} <span class="runtime">- runtime only</span>{{/if}}) - {{label}} - v{{version}}</span>
        <span class="disable-tag">- {{__ "disabled"}}</span>
    </span>

    <div class="actions">
        <div class="pci-switch"></div>
        <div class="pci-download-button"></div>
        <div class="pci-unregister-button"></div>
    </div>
</li>
{{/each}}