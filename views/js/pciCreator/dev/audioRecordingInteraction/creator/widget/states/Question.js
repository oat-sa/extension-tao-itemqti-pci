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
    'tpl!audioRecordingInteraction/creator/tpl/propertiesForm',
    'util/typeCaster'
], function( _, __, $, stateFactory, Question, formElement, pciMediaManagerFactory, simpleEditor, containerEditor, formTpl, typeCaster){
    'use strict';

    var AudioRecordingInteractionStateQuestion = stateFactory.extend(Question, function create(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt'),
            interaction = this.widget.element;

        containerEditor.create($prompt, {
            change : function change(text){
                interaction.data('prompt', text);
                interaction.updateMarkup();
            },
            markup : interaction.markup,
            markupSelector : '.prompt',
            related : interaction,
            areaBroker: this.widget.getAreaBroker()
        });

    }, function destroy(){
        var $container = this.widget.$container,
            $prompt = $container.find('.prompt');

        simpleEditor.destroy($container);
        containerEditor.destroy($prompt);
    });

    /**
     * Change callback of form values
     * @param {Object} interaction
     * @param {*} value
     * @param {String} name
     */
    function configChangeCallBack(interaction, value, name) {
        interaction.prop(name, value);
        interaction.triggerPci('configChange', [interaction.getProperties()]);
    }

    AudioRecordingInteractionStateQuestion.prototype.initForm = function initForm(){
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            $mediaStimulusForm,
            $uncompressedOptions,
            $compressedLossyOptions,
            $compressedLosslessOptions;

        var pciMediaManager = pciMediaManagerFactory(_widget);

        //render the form using the form template
        $form.html(formTpl({
            serial : response.serial,
            identifier : interaction.attr('responseIdentifier'),

            allowPlayback:          typeCaster.strToBool(interaction.prop('allowPlayback'), true),
            autoStart:              typeCaster.strToBool(interaction.prop('autoStart'), false),
            maxRecords:             interaction.prop('maxRecords'),
            maxRecordingTime:       interaction.prop('maxRecordingTime'),
            audioBitrate:           interaction.prop('audioBitrate'),
            sampleRate:             interaction.prop('sampleRate'),
            isStereo:               typeCaster.strToBool(interaction.prop('isStereo'), false),
            useMediaStimulus:       typeCaster.strToBool(interaction.prop('useMediaStimulus'), false),
            displayDownloadLink:    typeCaster.strToBool(interaction.prop('displayDownloadLink'), false),
            recordingFormat:        interaction.prop('recordingFormat'),
            isCompressed:           typeCaster.strToBool(interaction.prop('isCompressed'), true),
            isLossless:             typeCaster.strToBool(interaction.prop('isLossless'), false),
            flacCompressionLevel:   interaction.prop('flacCompressionLevel'),
            flacBps:                interaction.prop('flacBps'),
            flacVerify:             typeCaster.strToBool(interaction.prop('flacVerify'), false),
            flacBlockSize:          interaction.prop('flacBlockSize'),
        }));

        $mediaStimulusForm = $form.find('.media-stimulus-properties-form');
        $mediaStimulusForm.append(pciMediaManager.getForm());

        $uncompressedOptions = $form.find('[data-role="uncompressedOptions"]');
        $compressedLossyOptions = $form.find('[data-role="compressedLossyOptions"]');
        $compressedLosslessOptions = $form.find('[data-role="compressedLosslessOptions"]');

        //init form javascript
        formElement.initWidget($form);

        //display the proper blocks
        toggleEncodingOptions(interaction.prop('recordingFormat'));

        /**
         * Toggles the proper block which belongs to the given recording format
         *
         * @param {String}   recordingFormat supported values: compressed_lossy, compressed_lossless, uncompressed
         * @param {Function} [callback]      callback function (optional)
         */
        function toggleEncodingOptions(recordingFormat, callback) {
            switch (recordingFormat) {
                case 'compressed_lossy':
                    $uncompressedOptions.hide();
                    $compressedLossyOptions.show();
                    $compressedLosslessOptions.hide();
                    break;

                case 'compressed_lossless':
                    $uncompressedOptions.hide();
                    $compressedLossyOptions.hide();
                    $compressedLosslessOptions.show();
                    break;

                case 'uncompressed':
                    $uncompressedOptions.show();
                    $compressedLossyOptions.hide();
                    $compressedLosslessOptions.hide();
                    break;
            }

            typeof callback === 'function' && callback(recordingFormat);
        }

        //init data change callbacks
        formElement.setChangeCallbacks($form, interaction, _.assign({
            allowPlayback:        configChangeCallBack,
            autoStart:            configChangeCallBack,
            maxRecords:           configChangeCallBack,
            maxRecordingTime:     configChangeCallBack,
            audioBitrate:         configChangeCallBack,
            sampleRate:           configChangeCallBack,
            isStereo:             configChangeCallBack,
            displayDownloadLink:  configChangeCallBack,
            flacCompressionLevel: configChangeCallBack,
            flacBps:              configChangeCallBack,
            flacVerify:           configChangeCallBack,
            flacBlockSize:        configChangeCallBack,

            identifier: function identifier(i, value){
                response.id(value);
                interaction.attr('responseIdentifier', value);
            },

            useMediaStimulus: function useMediaStimulusCb(boundInteraction, value, name) {
                if (value) {
                    $mediaStimulusForm.removeClass('hidden');
                    $mediaStimulusForm.show(250);
                } else {
                    $mediaStimulusForm.hide(250);
                }
                configChangeCallBack(boundInteraction, value, name);
            },

            recordingFormat: function(boundInteraction, value, name) {
                toggleEncodingOptions(value, function(recordingFormat) {
                    switch (recordingFormat) {
                        case 'compressed_lossy':
                            configChangeCallBack(boundInteraction, true, 'isCompressed');
                            configChangeCallBack(boundInteraction, false, 'isLossless');
                            break;

                        case 'compressed_lossless':
                            configChangeCallBack(boundInteraction, true, 'isCompressed');
                            configChangeCallBack(boundInteraction, true, 'isLossless');
                            break;

                        case 'uncompressed':
                            configChangeCallBack(boundInteraction, false, 'isCompressed');
                            configChangeCallBack(boundInteraction, null, 'isLossless');
                            break;
                    }
                });

                configChangeCallBack(boundInteraction, value, name);
            },


        }, pciMediaManager.getChangeCallbacks()));

        pciMediaManager.init();
    };

    return AudioRecordingInteractionStateQuestion;
});
