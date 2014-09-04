define([
    'taoQtiItem/qtiCreator/widgets/interactions/Widget',
    'taoQtiItem/qtiLikertScaleCreator/widget/states/states'
], function(Widget, states){

    var LikertScaleInteractionWidget = Widget.clone();

    LikertScaleInteractionWidget.initCreator = function(){
        
        this.registerStates(states);
        
        Widget.initCreator.call(this);
    };
    
    return LikertScaleInteractionWidget;
});