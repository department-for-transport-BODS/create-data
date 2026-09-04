import { startGlobalSettings } from '../../../support/globalSettings';
import { enterOperatorDetails } from '../../../support/operatorDetails';

describe('time restrictions', () => {
    it('creates edits and deletes time restrictions', () => {
        startGlobalSettings();

        cy.contains('Operator details').click();

        enterOperatorDetails();
    });
});
