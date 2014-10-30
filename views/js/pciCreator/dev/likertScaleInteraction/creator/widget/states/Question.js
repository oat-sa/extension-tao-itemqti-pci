define([
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!likertScaleInteraction/creator/tpl/propertiesForm',
    'lodash',
    'jquery'
], function(stateFactory, Question, formElement, simpleEditor, containerEditor, formTpl, _, $){


    function extractHtmlFromMarkup(markupStr, selector){
        var $found = $('<div>').html(markupStr).find(selector);
        var ret = [];
        $found.each(function(){
            ret.push($(this).html());
        });
        return ret;
    }

    var LikertInteractionStateQuestion = stateFactory.extend(Question, function(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        var html = extractHtmlFromMarkup(interaction.markup, '.prompt');
        $prompt.html(html[0] || '');

        containerEditor.create($prompt, function(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            }, {
                related : interaction
            });

        simpleEditor.create($container, '.likert-label-min', function(text){
            interaction.prop('label-min', text);
        });

        simpleEditor.create($container, '.likert-label-max', function(text){
            interaction.prop('label-max', text);
        });

    }, function(){

        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    LikertInteractionStateQuestion.prototype.initForm = function(){

        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            level = parseInt(interaction.prop('level')) || 5,
            levels = [5, 7, 9],
            levelData = {};

        //build select option data for the template
        _.each(levels, function(lvl){
            levelData[lvl] = {
                label : lvl,
                selected : (lvl === level)
            };
        });

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            levels : levelData,
            identifier : interaction.attr('responseIdentifier')
        }));

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, {
            level : function(interaction, value){

                //update the pci property value:
                interaction.prop('level', value);

                //update rendering
                _widget.refresh();
            },
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            }
        });

    };

    return LikertInteractionStateQuestion;
});
