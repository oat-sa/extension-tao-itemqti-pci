define([
    'taoQtiItem/qtiCreator/widgets/static/Widget',
    'sampleToolCmRuler/creator/widget/states/states'
], function(Widget, states){

    var CmRulerWidget = Widget.clone();

    CmRulerWidget.initCreator = function(){
        
        this.registerStates(states);
        Widget.initCreator.call(this);
    };
    
    CmRulerWidget.buildContainer = function(){
        
        this.$container = this.$original;
        this.$container.addClass('widget-box');
    };
    
    return CmRulerWidget;
});