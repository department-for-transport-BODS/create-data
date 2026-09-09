import { startGlobalSettings } from '../../../support/globalSettings';
import { enterOperatorDetails } from '../../../support/operatorDetails';

describe('operator details', () => {
    it('updates operator details', () => {
        startGlobalSettings();

        cy.contains('Operator details').click();

        enterOperatorDetails();
    });
});
