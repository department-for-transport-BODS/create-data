import { isFinished } from '../support/helpers';
import {
    completeFlatFarePages,
    completeMultiOpGeoZonePages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectFareType,
} from '../support/steps';

describe('the scheme journey', () => {
    it('completes successfully for geozone and a single product', () => {
        selectFareType('period', true);
        defineUserTypeAndTimeRestrictions();
        completeMultiOpGeoZonePages();
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for geozone and multiple products', () => {
        const numberOfProducts = 5;
        const multiProductNamePrefix = 'Scheme product ';
        selectFareType('period', true);
        defineUserTypeAndTimeRestrictions();
        completeMultiOpGeoZonePages(false, numberOfProducts, multiProductNamePrefix);
        completeSalesPages(numberOfProducts, multiProductNamePrefix);
        isFinished();
    });

    it('completes successfully for flat fare', () => {
        selectFareType('flatFare', true);
        defineUserTypeAndTimeRestrictions();
        completeFlatFarePages('Scheme Flat Fare Test Product', true);
        completeSalesPages();
        isFinished();
    });
});
