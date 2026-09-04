import { isFinished } from '../../support/helpers';
import {
    completeReturnPages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectFareType,
} from '../../support/steps';

describe('The return faretype product journey', () => {
    it('completes successfully for csv upload', () => {
        selectFareType('return', false);
        defineUserTypeAndTimeRestrictions();
        completeReturnPages(true, false, false);
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for manual upload', () => {
        selectFareType('return', false);
        defineUserTypeAndTimeRestrictions();
        completeReturnPages(false, false, false);
        completeSalesPages();
        isFinished();
    });
});
