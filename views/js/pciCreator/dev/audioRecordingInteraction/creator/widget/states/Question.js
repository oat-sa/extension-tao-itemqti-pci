/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'i18n',
    'jquery',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/pciMediaManager/pciMediaManager',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'taoQtiItem/qtiCreator/editor/containerEditor',
    'tpl!audioRecordingInteraction/creator/tpl/propertiesForm'
], function( _, __, $, stateFactory, Question, formElement, pciMediaManagerFactory, simpleEditor, containerEditor, formTpl){
    'use strict';

    var AudioRecordingInteractionStateQuestion = stateFactory.extend(Question, function create(){
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

    }, function destroy(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    /**
     * xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx
     * @param interaction
     * @param value
     * @param name
     */
    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    /**
     * xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx
     */
    AudioRecordingInteractionStateQuestion.prototype.initForm = function initForm(){
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration();

        var pciMediaManager = pciMediaManagerFactory(_widget);

        //fixme: use helper ?
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

            allowPlayback:          toBoolean(interaction.prop('allowPlayback'), true),
            audioBitrate:           interaction.prop('audioBitrate'),
            autoStart:              toBoolean(interaction.prop('autoStart'), false),
            displayDownloadLink:    toBoolean(interaction.prop('displayDownloadLink'), false),
            maxRecords:             interaction.prop('maxRecords'),
            maxRecordingTime:       interaction.prop('maxRecordingTime')
        }));

        $form.append(pciMediaManager.getForm());

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, _.assign({
            identifier : function(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },

            allowPlayback:          configChangeCallBack,
            audioBitrate:           configChangeCallBack,
            autoStart:              configChangeCallBack,
            displayDownloadLink:    configChangeCallBack,
            maxRecords:             configChangeCallBack,
            maxRecordingTime:       configChangeCallBack
        }, pciMediaManager.getChangeCallbacks()));

        pciMediaManager.init();
    };

    return AudioRecordingInteractionStateQuestion;
});
