define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'qtiItemPci/pciCreator/helper/formElement',
    'tpl!likertScaleInteraction/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, editor, pciFormElement, formTpl, _, $){

    var LikertInteractionStateQuestion = stateFactory.extend(Question, function(){

        var $container = this.widget.$container,
            interaction = this.widget.element;

        editor.create($container, '.prompt', function(text){
            interaction.data('prompt', text);
            interaction.updateMarkup();
        });

        editor.create($container, '.likert-label-min', function(text){
            interaction.prop('label-min', text);
        });
        
        editor.create($container, '.likert-label-max', function(text){
            interaction.prop('label-max', text);
        });

    }, function(){
        
        editor.destroy(this.widget.$container);
        
    });

    LikertInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            level = parseInt(interaction.prop('level')) || 5,
            levels = [5, 7, 9],
            levelData = {},
            propCallback = pciFormElement.getPropertyChangeCallback();

        //build select option data for the template
        _.each(levels, function(lvl){
            levelData[lvl] = {
                label : lvl,
                selected : (lvl === level)
            };
        });

        //render the form using the form template
        $form.html(formTpl({
            levels : levelData,
            'label-min' : interaction.prop('label-min'),
            'label-max' : interaction.prop('label-max')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            level : propCallback,
            'label-min' : propCallback,
            'label-max' : propCallback
        });

    };

    return LikertInteractionStateQuestion;
});
