import { deleteAllCards, startGlobalSettings } from '../../support/globalSettings';
import { createEditMultiOperatorGroups } from '../../support/multiOperatorGroups';

describe('multi operator groups', () => {
    it('creates edits and deletes multi operator groups', () => {
        startGlobalSettings();

        // Wait for any transient popup (e.g. save confirmation) to close before navigating
        cy.get('.popup').should('not.exist');

        cy.contains('Operator groups').click();

        // start with clean environment
        deleteAllCards();

        createEditMultiOperatorGroups();

        deleteAllCards();
    });
});
