define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!audioRecordingInteraction/creator/tpl/propertiesForm',
    'lodash'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _){
    'use strict';

    var AudioRecordingInteractionStateQuestion = stateFactory.extend(Question, function(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        containerEditor.create($prompt, {
            change : function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction
        });

    }, function(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    AudioRecordingInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        function toBoolean(value, defaultValue) {
            if (typeof(value) === "undefined") {
                return defaultValue;
            } else {
                return (value === true || value === "true");
            }
        }

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),

            allowPlayback: toBoolean(interaction.prop('allowPlayback'), true),
            audioBitrate: interaction.prop('audioBitrate'),
            autoStart: toBoolean(interaction.prop('autoStart'), false),
            displayDownloadLink: toBoolean(interaction.prop('displayDownloadLink'), false),
            maxRecords: interaction.prop('maxRecords'),
            maxRecordingTime: interaction.prop('maxRecordingTime')
        }));

        //init form javascript
        formElement.initWidget($form);

        function configChangeCallBack(i, value, name) {
            i.prop(name, value);
            interaction.triggerPci('configChange', [i.getProperties()]);
        }

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },

            allowPlayback: configChangeCallBack,
            audioBitrate: configChangeCallBack,
            autoStart: configChangeCallBack,
            displayDownloadLink: configChangeCallBack,
            maxRecords: configChangeCallBack,
            maxRecordingTime: configChangeCallBack
        });

    };

    return AudioRecordingInteractionStateQuestion;
});
