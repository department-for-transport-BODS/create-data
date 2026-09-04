import { isFinished } from '../../../support/helpers';
import {
    completeReturnPages,
    completeSalesPages,
    completeSinglePages,
    defineUserTypeAndTimeRestrictions,
    selectCarnetFareType,
} from '../../../support/steps';

describe('The carnet faretype product journey', () => {
    it('completes successfully for single faretype', () => {
        selectCarnetFareType('single');
        defineUserTypeAndTimeRestrictions();
        completeSinglePages(true, true);
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for return faretype', () => {
        selectCarnetFareType('return');
        defineUserTypeAndTimeRestrictions();
        completeReturnPages(true, true, false);
        completeSalesPages();
        isFinished();
    });
});
