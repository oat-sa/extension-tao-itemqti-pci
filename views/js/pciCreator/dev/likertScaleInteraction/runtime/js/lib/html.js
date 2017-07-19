define(['likertScaleInteraction/runtime/js/lib/xml', 'likertScaleInteraction/runtime/js/lib/math'], function(xml, math){
    
    return {
        render : function render($container){
            
            var markup = $container.html();
            
            //remove xml ns (would break jquery selector otherwise)
            markup = xml.removeNamespace(markup);
            $container.html(markup);
            
            //render math
            math.render($container);
            
            //@todo render media files
        }
    };
});