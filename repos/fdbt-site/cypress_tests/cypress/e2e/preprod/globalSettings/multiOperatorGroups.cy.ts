import { deleteCardByName, startGlobalSettings } from '../../../support/globalSettings';
import { createEditMultiOperatorGroups } from '../../../support/multiOperatorGroups';
import { getTestDataName } from '../../../support/helpers';

describe('multi operator groups', () => {
    it('creates edits and deletes multi operator groups', () => {
        startGlobalSettings();

        // Wait for any transient popup (e.g. save confirmation) to close before navigating
        cy.get('.popup').should('not.exist');

        cy.contains('Operator groups').click();

        const namePrefix = getTestDataName(`GS ${Date.now().toString(36)}`);

        createEditMultiOperatorGroups(namePrefix);

        deleteCardByName(`${namePrefix} Group 1`);
        deleteCardByName(`${namePrefix} Group 2`);
    });
});
