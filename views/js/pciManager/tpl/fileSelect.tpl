{{#each files}}
<li data-type="{{type}}" data-file="{{path}}" data-mime="{{mime}}" data-size="{{size}}" data-url="{{url}}"> 
    <span class="desc truncate">{{label}}</span>
    <div class="actions">
        <div class="tlb">
            <div class="tlb-top">
                <span class="tlb-box">
                    <span class="tlb-bar">
                        <span class="tlb-start"></span>
                        <span class="tlb-group">
                            <a href="#" class="tlb-button-off" title="{{__ 'Remove this custom interaction'}}" data-delete=":parent li"><span class="icon-bin"></span></a>
                        </span>
                        <span class="tlb-end"></span>
                    </span>  
                </span>   
            </div>
        </div>
    </div>
</li>
{{/each}}