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
 * Copyright (c) 2016-2019 (original work) Open Assessment Technologies SA ;
 */

define(['taoTests/runner/plugin', 'taoQtiTest/runner/helpers/currentItem'], function (pluginFactory, currentItemHelper) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name: 'navigationlock',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            const testRunner = this.getTestRunner();

            testRunner.after('renderitem', (loadedItem, item) => {
                const { pci } = item && item.portableElements;

                if (!Object.keys(pci).length) {
                    return;
                }

                const itemRunner = testRunner.itemRunner;
                const elementsOnPage = itemRunner.getData().body.elements;

                const PCINavigationLockExists = {};
                Object.values(elementsOnPage).forEach(elem => {
                    if (elem.qtiClass === 'customInteraction' && elem.properties && elem.properties.navigationLock && elem.attributes.responseIdentifier) {
                        PCINavigationLockExists[elem.attributes.responseIdentifier] = false;
                    }
                });

                if (!Object.keys(PCINavigationLockExists).length) {
                    return;
                }
                testRunner.trigger('disablenav');

                itemRunner.on('responsechange', (responses) => {
                    Object.keys(responses).forEach(responseID => {
                        if (Object.keys(PCINavigationLockExists).includes(responseID)) {
                            // if response from navigationLock PCI
                            const declarations = currentItemHelper.getDeclarations(testRunner);
                            const declaration = Object.values(declarations).find(dec => dec.attributes.identifier === responseID);
                            const attributes = declaration.attributes || {};
                            const response = responses[responseID];
                            const baseType = attributes.baseType;
                            const cardinality = attributes.cardinality;
                            const constraintValues = currentItemHelper.guessInteractionConstraintValues(testRunner);
                            if (currentItemHelper.isQuestionAnswered(
                                response,
                                baseType,
                                cardinality,
                                declaration.defaultValue,
                                constraintValues[attributes.identifier]
                            )) {
                                PCINavigationLockExists[responseID] = true;
                            } else {
                                PCINavigationLockExists[responseID] = false;
                            }
                        }
                    });
                    // if all navigationPCI answered enable navigation
                    if (!Object.values(PCINavigationLockExists).some(responded => responded === false)) {
                        testRunner.trigger('enablenav');
                    }
                });
            });
        }
    });
});
