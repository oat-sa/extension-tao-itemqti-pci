define([
    'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
    'mathEntryInteraction/creator/widget/states/states'
], function(Widget, states){

    var AudioRecordingInteractionWidget = Widget.clone();

    AudioRecordingInteractionWidget.initCreator = function(){

        this.registerStates(states);

        Widget.initCreator.call(this);
    };

    return AudioRecordingInteractionWidget;
});