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
 * Copyright (c) 2017-2023 (original work) Open Assessment Technologies SA;
 */
define([
    'lodash',
    'i18n',
    'jquery',
    'module',
    'taoQtiItem/qtiCreator/widgets/states/factory',
    'taoQtiItem/qtiCreator/widgets/interactions/states/Question',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/widgets/helpers/pciMediaManager/pciMediaManager',
    'taoQtiItem/qtiCreator/editor/simpleContentEditableElement',
    'tpl!audioRecordingInteraction/creator/tpl/propertiesForm'
], function (_, __, $, module, stateFactory, Question, formElement, pciMediaManagerFactory, simpleEditor, formTpl) {
    'use strict';

    var AudioRecordingInteractionStateQuestion = stateFactory.extend(
        Question,
        function create() {},
        function destroy() {
            var $container = this.widget.$container;

            simpleEditor.destroy($container);
        }
    );

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

    /**
     * Type casting helpers for PCI parameters
     * @param {String, boolean} value
     * @param {String, boolean} defaultValue
     * @returns {boolean}
     */
    function toBoolean(value, defaultValue) {
        if (typeof value === 'undefined') {
            return defaultValue;
        } else if (value === '') {
            return false;
        } else {
            return value === true || value === 'true';
        }
    }

    AudioRecordingInteractionStateQuestion.prototype.initForm = function initForm() {
        var _widget = this.widget,
            $form = _widget.$form,
            interaction = _widget.element,
            response = interaction.getResponseDeclaration(),
            $compressedOptions,
            $uncompressedOptions,
            $autoStartSubOptions,
            $sequentialOption,
            $delayOptions,
            $hideRecordOption;

        var pciMediaManager = pciMediaManagerFactory(_widget);

        //render the form using the form template
        $form.html(
            formTpl(
                _.defaults({}, module.config(), {
                    serial: response.serial,
                    identifier: interaction.attr('responseIdentifier'),

                    allowPlayback: toBoolean(interaction.prop('allowPlayback'), true),
                    hideStopButton: toBoolean(interaction.prop('hideStopButton'), false),
                    autoStart: toBoolean(interaction.prop('autoStart'), false),
                    sequential: !!interaction.hasClass('sequential'),
                    hideRecordButton: toBoolean(interaction.prop('hideRecordButton'), false),
                    autoPlayback: toBoolean(interaction.prop('autoPlayback'), false),
                    playSound: toBoolean(interaction.prop('playSound'), false),

                    delayMinutes: interaction.prop('delayMinutes'),
                    delaySeconds: interaction.prop('delaySeconds'),

                    maxRecords: interaction.prop('maxRecords'),
                    maxRecordingTime: interaction.prop('maxRecordingTime'),

                    isCompressed: toBoolean(interaction.prop('isCompressed'), true),
                    audioBitrate: interaction.prop('audioBitrate'),
                    isStereo: toBoolean(interaction.prop('isStereo'), false),

                    updateResponsePartially: toBoolean(interaction.prop('updateResponsePartially'), true),
                    partialUpdateInterval: parseInt(interaction.prop('partialUpdateInterval'), 10) / 1000,

                    displayDownloadLink: toBoolean(interaction.prop('displayDownloadLink'), false),

                    enableDomEvents: toBoolean(interaction.prop('enableDomEvents'), false)
                })
            )
        );

        $compressedOptions = $form.find('[data-role="compressedOptions"]');
        $uncompressedOptions = $form.find('[data-role="uncompressedOptions"]');

        $autoStartSubOptions = $form.find('[data-role="autoStartSubOptions"]');
        $sequentialOption = $form.find('[data-role="sequentialOption"]');
        $delayOptions = $form.find('[data-role="delayOptions"]');
        $hideRecordOption = $form.find('[data-role="hideRecordOption"]');

        //init form javascript
        formElement.initWidget($form);

        //init data change callbacks
        formElement.setChangeCallbacks(
            $form,
            interaction,
            _.assign(
                {
                    identifier: function identifier(i, value) {
                        response.id(value);
                        interaction.attr('responseIdentifier', value);
                    },

                    allowPlayback: configChangeCallBack,
                    hideStopButton: configChangeCallBack,

                    autoStart: function autoStart(boundInteraction, value, name) {
                        if (value) {
                            $autoStartSubOptions.show();
                        } else {
                            $autoStartSubOptions.hide();

                            $hideRecordOption.find('input[name="hideRecordButton"]').prop('checked', false);
                            configChangeCallBack(boundInteraction, false, 'hideRecordButton');

                            $sequentialOption.find('input[name="sequential"]').prop('checked', false);
                            $form.find('input[name="maxRecords"]').prop('disabled', false);
                            interaction.toggleClass('sequential', false);
                            configChangeCallBack(boundInteraction, false, 'enableDomEvents');
                        }
                        configChangeCallBack(boundInteraction, value, name);
                    },
                    sequential: function sequential(boundInteraction, value) {
                        if (value) {
                            $form.find('input[name="maxRecords"]').prop('value', 1).prop('disabled', true);
                            configChangeCallBack(boundInteraction, 1, 'maxRecords');
                        } else {
                            $form.find('input[name="maxRecords"]').prop('disabled', false);
                        }
                        interaction.toggleClass('sequential', value);
                        configChangeCallBack(boundInteraction, value, 'enableDomEvents');
                    },
                    hideRecordButton: configChangeCallBack,
                    autoPlayback: configChangeCallBack,
                    playSound: configChangeCallBack,

                    delayMinutes: configChangeCallBack,
                    delaySeconds: configChangeCallBack,

                    maxRecords: configChangeCallBack,
                    maxRecordingTime: configChangeCallBack,

                    isCompressed: function isCompressed(boundInteraction, value, name) {
                        if (value === 'true') {
                            $uncompressedOptions.hide();
                            $compressedOptions.show();
                        } else {
                            $uncompressedOptions.show();
                            $compressedOptions.hide();
                        }
                        configChangeCallBack(boundInteraction, value, name);
                    },
                    audioBitrate: configChangeCallBack,
                    isStereo: configChangeCallBack,

                    partialUpdateInterval: function partialUpdateInterval(boundInteraction, value, name) {
                        value = parseFloat(value) * 1000;
                        configChangeCallBack(boundInteraction, value, name);
                    },

                    displayDownloadLink: configChangeCallBack
                },
                pciMediaManager.getChangeCallbacks()
            )
        );

        if (!interaction.hasClass('sequential')) {
            $form.find('input[name="maxRecords"]').prop('disabled', false);
        }

        pciMediaManager.init();
    };

    return AudioRecordingInteractionStateQuestion;
});
