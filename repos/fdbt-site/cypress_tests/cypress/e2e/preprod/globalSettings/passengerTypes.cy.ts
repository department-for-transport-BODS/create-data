import { deleteCardByName, startGlobalSettings } from '../../../support/globalSettings';
import { createEditGroupPassengerTypes, createEditSinglePassengerTypes } from '../../../support/passengerTypes';
import { getTestDataName } from '../../../support/helpers';

describe('passenger types', () => {
    it('creates edits and deletes passenger types', () => {
        startGlobalSettings();

        cy.contains('Passenger types').click();

        const namePrefix = getTestDataName(`GS ${Date.now().toString(36)}`);
        const seniorName = `${namePrefix} Seniors`;
        const childName = `${namePrefix} Child`;
        const groupName = `${namePrefix} Group`;
        const editedGroupName = `${namePrefix} Edited Group`;

        createEditSinglePassengerTypes(namePrefix);
        createEditGroupPassengerTypes(groupName, editedGroupName, seniorName, childName);

        deleteCardByName(editedGroupName);
        deleteCardByName(seniorName);
        deleteCardByName(childName);
    });
});
