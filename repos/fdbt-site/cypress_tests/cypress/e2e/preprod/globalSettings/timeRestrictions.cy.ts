import { deleteAllCards, startGlobalSettings } from '../../../support/globalSettings';
import { createEditTimeRestriction } from '../../../support/timeRestrictions';

describe.skip('time restrictions', () => {
    it('creates edits and deletes time restrictions', () => {
        startGlobalSettings();

        cy.contains('Time restrictions').click();

        // start with clean environment
        deleteAllCards();

        createEditTimeRestriction();

        deleteAllCards();
    });
});
