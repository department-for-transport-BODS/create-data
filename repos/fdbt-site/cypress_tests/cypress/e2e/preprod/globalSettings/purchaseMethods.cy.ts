import { deleteCardByName, startGlobalSettings } from '../../../support/globalSettings';
import { createEditPurchaseMethod } from '../../../support/purchaseMethods';
import { getTestDataName } from '../../../support/helpers';

describe('purchase methods', () => {
    it('creates edits and deletes purchase methods', () => {
        startGlobalSettings();

        cy.contains('Purchase methods').click();

        const namePrefix = getTestDataName(`GS ${Date.now().toString(36)}`);
        const standardName = `${namePrefix} Standard`;
        const standardEditedName = `${namePrefix} Edited Standard`;
        const cappedName = `${namePrefix} Capped`;
        const cappedEditedName = `${namePrefix} Edited Capped`;

        createEditPurchaseMethod(standardName, standardEditedName);
        deleteCardByName(standardEditedName);
        createEditPurchaseMethod(cappedName, cappedEditedName, true);
        deleteCardByName(cappedEditedName);
    });
});
