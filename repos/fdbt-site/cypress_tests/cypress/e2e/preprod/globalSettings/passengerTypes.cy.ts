import { deleteAllCards, startGlobalSettings } from '../../../support/globalSettings';
import { createEditGroupPassengerTypes, createEditSinglePassengerTypes } from '../../../support/passengerTypes';

describe.skip('passenger types', () => {
    it('creates edits and deletes passenger types', () => {
        startGlobalSettings();

        cy.contains('Passenger types').click();

        // start with clean environment
        deleteAllCards();

        createEditSinglePassengerTypes();
        createEditGroupPassengerTypes();

        deleteAllCards();
    });
});
