import { isFinished } from '../../../support/helpers';
import {
    completePeriodMultiServicePages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectCarnetFareType,
} from '../../../support/steps';

describe('the period carnet product journey', () => {
    it('completes successfully for multi-service and multiple products', () => {
        const productNamePrefix = 'Carnet period product';

        selectCarnetFareType('period');
        defineUserTypeAndTimeRestrictions();
        completePeriodMultiServicePages(4, productNamePrefix, true);
        completeSalesPages(4, productNamePrefix);
        isFinished();
    });
});
