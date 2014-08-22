<{{ns.pci}}portableCustomInteraction customInteractionTypeIdentifier="likertScaleInteraction">

    <{{ns.pci}}responseSchema href="http://imsglobal.org/schema/json/v1.0/response.json"/>

    <{{ns.pci}}resources location="http://imsglobal.org/pci/1.0.15/sharedLibraries.xml">
        <{{ns.pci}}libraries>
            <{{ns.pci}}lib name="likertScaleCss" href="libs/likertScaleInteraction.css"/><!-- dep css -->
            <{{ns.pci}}lib name="likertScaleJs" href="libs/likertScaleInteraction.amd.js"/><!-- amd -->
            <{{ns.pci}}lib name="jquery" href="libs/jquery.min.js"/><!-- dep -->
        </{{ns.pci}}libraries>
    </{{ns.pci}}resources>
    
    {{#pciproperties properties ns.pci}}
    
    <{{ns.pci}}properties>
        <{{ns.pci}}entry key="literal">0</{{ns.pci}}entry>
        <{{ns.pci}}entry key="scale">5</{{ns.pci}}entry>
        <{{ns.pci}}entry key="label-min">Not at all</{{ns.pci}}entry>
        <{{ns.pci}}entry key="label-max">Very much</{{ns.pci}}entry>
        <{{ns.pci}}entry key="prompt">&lt;div&gt;Do you like movies ? &lt;img src=&quot;http://cdn-static.zdnet.com/i/story/60/01/056464/vudu-movies-screenshot-082911.png&quot;&gt;&lt;/div&gt;</{{ns.pci}}entry>
    </{{ns.pci}}properties>

    <{{ns.pci}}markup>
        <{{ns.xhtml}}div id="likert1" class="likert-scale">
            <{{ns.xhtml}}div class="prompt">{{properties.prompt}}</{{ns.xhtml}}div>
            <{{ns.xhtml}}ul class="likert"></{{ns.xhtml}}ul>
        </{{ns.xhtml}}div>
    </{{ns.pci}}markup>

</{{ns.pci}}portableCustomInteraction>