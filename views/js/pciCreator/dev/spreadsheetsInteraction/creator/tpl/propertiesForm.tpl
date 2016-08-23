<div class="panel">
    <label for="" class="has-icon">{{__ 'Response identifier'}}</label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <div class="tooltip-content">{{__ 'tooltip content'}}</div>

    <input  type="text"
            name="identifier"
            value="{{identifier}}"
            placeholder="eg dfdf RESPONSE"
            data-validate="$notEmpty; $qtiIdentifier; "
    >

    <input  type="text"
            name="dfdsf"
            value="asdf"
            placeholder="adsfasdfasd">

    {*<h2 class="_accordion">*}
        {*Tableur*}
        {*<span class="icon-up"></span>*}
        {*<span class="icon-down"></span>*}
    {*</h2>*}

</div>

<div class="panel">
    <label>
        <input class="js-disable-scaffolding-behavior-checkbox" name="disableScaffoldingBehavior" type="checkbox">
        <span class="icon-checkbox"></span>
        {{__ "Enable Scaffolding Behavior"}}
    </label>
    <span class="icon-help tooltipstered" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
    <span class="tooltip-content">
        {{__ "Enable Scaffolding Behavior"}}
    </span>
</div>

