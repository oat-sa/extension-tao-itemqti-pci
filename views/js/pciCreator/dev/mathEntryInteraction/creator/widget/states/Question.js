define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!mathEntryInteraction/creator/tpl/propertiesForm'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl){
    'use strict';

    var MathEntryInteractionStateQuestion = stateFactory.extend(Question, function(){

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

    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    MathEntryInteractionStateQuestion.prototype.initForm = function(){

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
            tool_frac:      toBoolean(interaction.prop('tool_frac'),    true),
            tool_sqrt:      toBoolean(interaction.prop('tool_sqrt'),    true),
            tool_exp:       toBoolean(interaction.prop('tool_exp'),     true),
            tool_log:       toBoolean(interaction.prop('tool_log'),     true),
            tool_ln:        toBoolean(interaction.prop('tool_ln'),      true),
            tool_e:         toBoolean(interaction.prop('tool_e'),       true),
            tool_pi:        toBoolean(interaction.prop('tool_pi'),      true),
            tool_cos:       toBoolean(interaction.prop('tool_cos'),     true),
            tool_sin:       toBoolean(interaction.prop('tool_sin'),     true),
            tool_lte:       toBoolean(interaction.prop('tool_lte'),     true),
            tool_gte:       toBoolean(interaction.prop('tool_gte'),     true),
            tool_times:     toBoolean(interaction.prop('tool_times'),   true),
            tool_divide:    toBoolean(interaction.prop('tool_divide'),  true)
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            identifier: function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },
            tool_frac:      configChangeCallBack,
            tool_sqrt:      configChangeCallBack,
            tool_exp:       configChangeCallBack,
            tool_log:       configChangeCallBack,
            tool_ln:        configChangeCallBack,
            tool_e:         configChangeCallBack,
            tool_pi:        configChangeCallBack,
            tool_cos:       configChangeCallBack,
            tool_sin:       configChangeCallBack,
            tool_lte:       configChangeCallBack,
            tool_gte:       configChangeCallBack,
            tool_times:     configChangeCallBack,
            tool_divide:    configChangeCallBack
        });
    };

    return MathEntryInteractionStateQuestion;
});
