import { getRandomNumber, isFinished } from '../../support/helpers';
import {
    completePointToPointPeriodPages,
    completeHybridPages,
    completePeriodGeoZonePages,
    completePeriodMultiServicePages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectFareType,
} from '../../support/steps';

describe('the period faretype product journey', () => {
    it('completes successfully for geozone and multiple products', () => {
        const numberOfProducts = getRandomNumber(1, 5);
        const multiProductNamePrefix = 'Cypress product ';
        selectFareType('period', false);
        defineUserTypeAndTimeRestrictions();
        completePeriodGeoZonePages(numberOfProducts, multiProductNamePrefix);
        completeSalesPages(numberOfProducts, multiProductNamePrefix);
        isFinished();
    });

    it('completes successfully for multi-service and multiple products', () => {
        const numberOfProducts = getRandomNumber(1, 5);
        const multiProductNamePrefix = 'Cypress product ';
        selectFareType('period', false);
        defineUserTypeAndTimeRestrictions();
        completePeriodMultiServicePages(numberOfProducts, multiProductNamePrefix);
        completeSalesPages(numberOfProducts, multiProductNamePrefix);
        isFinished();
    });

    it('completes successfully for point to point period products', () => {
        selectFareType('period', false);
        defineUserTypeAndTimeRestrictions();
        completePointToPointPeriodPages();
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for hybrid and multiple products', () => {
        const numberOfProducts = getRandomNumber(1, 5);
        const multiProductNamePrefix = 'Hybrid product ';
        selectFareType('period', false);
        defineUserTypeAndTimeRestrictions();
        completeHybridPages(numberOfProducts, multiProductNamePrefix);
        completeSalesPages(numberOfProducts, multiProductNamePrefix);
        isFinished();
    });
});
