import { deleteCardByName, startGlobalSettings } from '../../../support/globalSettings';
import { createEditTimeRestriction } from '../../../support/timeRestrictions';
import { getTestDataName } from '../../../support/helpers';

describe('time restrictions', () => {
    it('creates edits and deletes time restrictions', () => {
        startGlobalSettings();

        cy.contains('Time restrictions').click();

        const namePrefix = getTestDataName(`GS ${Date.now().toString(36)}`);
        const name = `${namePrefix} Weekends`;
        const editedName = `${namePrefix} Working Days`;

        createEditTimeRestriction(name, editedName);

        deleteCardByName(editedName);
    });
});
