{{#each interactions}}
<li data-type-identifier="{{typeIdentifier}}" class="pci-list-element{{#unless enabled}} pci-disabled"{{/unless}}">
    <span class="desc truncate">
        <span class="name">({{model}}) - {{label}} - v{{version}}</span>
        <span class="disable-tag">- {{__ "disabled"}}</span>
    </span>

    <div class="actions">
        <div class="switch-box"></div>
    </div>
</li>
{{/each}}