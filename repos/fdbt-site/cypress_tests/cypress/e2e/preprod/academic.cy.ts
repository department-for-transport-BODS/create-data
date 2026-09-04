import { isFinished } from '../../support/helpers';
import {
    completeAcademicMultiServicePage,
    completeAcademicPointToPointPage,
    completeSalesPages,
    selectFareType,
} from '../../support/steps';

describe('The school faretype product journey', () => {
    it('completes successfully for Academic term/year multi services ticket', () => {
        const numberOfProducts = 5;
        const multiProductNamePrefix = 'Cypress product ';
        selectFareType('schoolService', false);
        completeAcademicMultiServicePage(numberOfProducts, multiProductNamePrefix);
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for Academic term/year point to point period ticket', () => {
        selectFareType('schoolService', false);
        completeAcademicPointToPointPage();
        completeSalesPages();
        isFinished();
    });
});
