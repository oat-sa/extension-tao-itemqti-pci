define(['IMSGlobal/jquery_2_1_1'], function($){
    
    return {
        render : function(radioGroupId, container, config){
            
            var $container = $(container),
                $li,
                level = parseInt(config.level) || 5,
                $ul = $container.find('ul.likert');

            for(var i = 1; i <= level; i++){

                $li = $('<li>', {'class' : 'likert'});
                $li.append($('<input>', {type : 'radio', name : radioGroupId, value : i}));

                $ul.append($li);
            }

            //add labels:
            var $labelMin = $('<span>', {'class' : 'likert-label likert-label-min'}).html(config['label-min']);
            var $labelMax = $('<span>', {'class' : 'likert-label likert-label-max'}).html(config['label-max']);

            $ul.find('li:first').prepend($labelMin);
            $ul.find('li:last').append($labelMax);
        }
    };
});