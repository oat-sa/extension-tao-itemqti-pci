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
 * Copyright (c) 2021 (original work) Open Assessment Technologies SA ;
 */

import urls from '../../../../taoQtiItem/views/cypress/utils/urls';
import selectors from '../../../../taoQtiItem/views/cypress/utils/selectors';

describe('Item Authoring', () => {
    const className = 'Test E2E class';
    const itemName = 'Test E2E item 1';
    const qtiClass = 'customInteraction';
    const pciInteractions = {
        audioPCI: 'audioRecordingInteraction',
        likerPCI: 'likertScaleInteraction',
        liqquidPCI: 'liquidsInteraction',
        mathPCI: 'mathEntryInteraction'
    };
    const dropSelector = 'div.qti-itemBody.item-editor-drop-area';
    const undoSelector = '.feedback-info.popup a.undo';
    const closeUndoSelector = '.feedback-info.popup .icon-close';

    /**
     * Log in
     * Visit the page
     */
    before(() => {
        cy.loginAsAdmin();

        cy.intercept('POST', '**/edit*').as('edit');
        cy.intercept('POST', `**/${selectors.editClassLabelUrl}`).as('editClassLabel');
        cy.viewport(1000, 660);
        cy.visit(urls.items);
        cy.wait('@edit');

        cy.get(selectors.root).then(root => {
            if (root.find(`li[title="${className}"] a`).length) {
                cy.deleteClassFromRoot(
                    selectors.root,
                    selectors.itemClassForm,
                    selectors.deleteClass,
                    selectors.deleteConfirm,
                    className,
                    selectors.deleteClassUrl,
                    selectors.resourceRelations,
                    false,
                    true
                );
            }
        });
    });
    after(() => {
        cy.intercept('POST', '**/edit*').as('edit');
        cy.visit(urls.items);
        cy.wait('@edit');

        cy.get(selectors.root).then(root => {
            if (root.find(`li[title="${className}"] a`).length) {
                cy.deleteClassFromRoot(
                    selectors.root,
                    selectors.itemClassForm,
                    selectors.deleteClass,
                    selectors.deleteConfirm,
                    className,
                    selectors.deleteClassUrl,
                    selectors.resourceRelations,
                    false,
                    true
                );
            }
        });
    });
    /**
     * Tests
     */
    describe('Item authoring', () => {
        it('can open item authoring', function () {
            cy.addClassToRoot(
                selectors.root,
                selectors.itemClassForm,
                className,
                selectors.editClassLabelUrl,
                selectors.treeRenderUrl,
                selectors.addSubClassUrl
            );
            cy.addNode(selectors.itemForm, selectors.addItem);
            cy.renameSelectedNode(selectors.itemForm, selectors.editItemUrl, itemName);

            cy.get(selectors.authoring).click();
            cy.location().should(loc => {
                expect(`${loc.pathname}${loc.search}`).to.eq(urls.itemAuthoring);
            });
        });

        it('can add PCI interactions to canvas', () => {
            cy.getSettled('.qti-item.item-editor-item.edit-active').should('exist');
            // open inline interactions panel
            cy.get('#sidebar-left-section-custom-interactions').click();

            for (const interaction in pciInteractions) {
                cy.log('ADDING INTERACTION', interaction);
                const interactionSelector = `[data-qti-class="${qtiClass}.${pciInteractions[interaction]}"]`;
                cy.dragAndDrop(interactionSelector, dropSelector);
                // check that widget is initialized
                cy.getSettled(`${dropSelector} .widget-box.edit-active[data-qti-class="${qtiClass}"] .${pciInteractions[interaction]}`).should('exist');
                cy.log(interaction, 'IS ADDED');
            }
            // close common interactions panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });

        it('can save item with interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });

        it('can remove PCI interactions from canvas', () => {
            for (const interaction in pciInteractions) {
                cy.log('REMOVING INTERACTION', interaction);

                const interactionSelector = `[data-qti-class="customInteraction"]`;
                const deleteSelector = `${interactionSelector} .tlb [data-role="delete"]`;

                cy.get(interactionSelector).first().click({ force: true });
                cy.get(deleteSelector).first().click({ force: true });
                cy.log(interaction, 'IS REMOVED');

                cy.get(undoSelector).should('exist');
                cy.get(undoSelector).click();
                cy.log(interaction, 'UNDO REMOVE');
                cy.get(interactionSelector).first().should('exist');
                cy.get(undoSelector).should('not.exist');

                cy.get(deleteSelector).first().click({ force: true });
                cy.log(interaction, 'IS REMOVED');
                cy.get(undoSelector).should('exist');
                cy.get(closeUndoSelector).click();
            }
            // close common interactions panel
            cy.get('#sidebar-left-section-common-interactions ._accordion').click();
        });

        it('can save item with removed interactions', () => {
            cy.intercept('POST', '**/saveItem*').as('saveItem');
            cy.get('[data-testid="save-the-item"]').click();
            cy.wait('@saveItem').its('response.body').its('success').should('eq', true);
        });
    });
});
