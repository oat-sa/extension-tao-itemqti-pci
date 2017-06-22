{{#each interactions}}
<li data-type-identifier="{{typeIdentifier}}" class="pci-list-element{{#unless enabled}} disabled"{{/unless}}">
    <span class="desc truncate">
        <span class="name">{{label}} - {{version}}</span>
        <span class="disable-tag">- {{__ "disabled"}}</span>
    </span>

    <div class="actions">
        <div class="tlb rgt">
            <div class="tlb-top">
                <span class="tlb-box">
                    <span class="tlb-bar">
                        <span class="tlb-start"></span>
                        <span class="tlb-group">
                            <a href="#" data-role="disable" class="tlb-button-off button-disable" title="{{__ 'Disable this custom interaction'}}"><span class="icon-result-nok"></span></a>
                            <a href="#" data-role="enable" class="tlb-button-off button-enable" title="{{__ 'Enable this custom interaction'}}"><span class="icon-result-ok"></span></a>
                        </span>
                        <span class="tlb-end"></span>
                    </span>
                </span>
            </div>
        </div>
    </div>
</li>
{{/each}}