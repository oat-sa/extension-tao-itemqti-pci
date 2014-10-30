define(['IMSGlobal/jquery_2_1_1', 'OAT/util/html'], function($, html){
    
    function renderChoices(id, $container, config){
        
        var $li,
                level = parseInt(config.level) || 5,
                $ul = $container.find('ul.likert');

            for(var i = 1; i <= level; i++){

                $li = $('<li>', {'class' : 'likert'});
                $li.append($('<input>', {type : 'radio', name : id, value : i}));

                $ul.append($li);
            }

            //add labels:
            var $labelMin = $('<span>', {'class' : 'likert-label likert-label-min'}).html(config['label-min']);
            var $labelMax = $('<span>', {'class' : 'likert-label likert-label-max'}).html(config['label-max']);

            $ul.find('li:first').prepend($labelMin);
            $ul.find('li:last').append($labelMax);
    }
    
    return {
        render : function(id, container, config){
            
            var $container = $(container);
            
            renderChoices(id, $container, config);
            html.render($container.find('.prompt'));
            
        }
    };
});