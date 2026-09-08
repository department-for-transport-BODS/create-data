import { continueButtonClick, isFinished, selectProductScope } from '../../support/helpers';
import {
    completeFlatFarePages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectFareType,
} from '../../support/steps';

describe('The flat fare faretype product journey', () => {
    it('completes successfully for multi service', () => {
        selectFareType('flatFare', false);
        defineUserTypeAndTimeRestrictions();
        selectProductScope('multipleServices');
        continueButtonClick();
        completeFlatFarePages('Flat Fare Test Product', false);
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for geo zone', () => {
        selectFareType('flatFare', false);
        defineUserTypeAndTimeRestrictions();
        selectProductScope('geoZone');
        continueButtonClick();
        completeFlatFarePages('geo zone flat fare', false, false, true);
        completeSalesPages();
        isFinished();
    });

    it.skip('completes successfully for pricing by distance', () => {
        selectFareType('flatFare', false);
        defineUserTypeAndTimeRestrictions();
        selectProductScope('multipleServicesPricedByDistance');
        continueButtonClick();
        completeFlatFarePages('Flat Fare Test Product', false, false, false, true);
        completeSalesPages();
        isFinished();
    });
});
