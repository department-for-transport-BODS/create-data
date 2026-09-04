import { clickElementById, continueButtonClick, isFinished } from '../../support/helpers';
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
        clickElementById('radio-option-multipleServices');
        continueButtonClick();
        completeFlatFarePages('Flat Fare Test Product', false);
        completeSalesPages();
        isFinished();
    });

    it('completes successfully for geo zone', () => {
        selectFareType('flatFare', false);
        defineUserTypeAndTimeRestrictions();
        clickElementById('radio-option-geoZone');
        continueButtonClick();
        completeFlatFarePages('geo zone flat fare', false, false, true);
        completeSalesPages();
        isFinished();
    });

    it.skip('completes successfully for pricing by distance', () => {
        selectFareType('flatFare', false);
        defineUserTypeAndTimeRestrictions();
        clickElementById('radio-option-multipleServicesPricedByDistance');
        continueButtonClick();
        completeFlatFarePages('Flat Fare Test Product', false, false, false, true);
        completeSalesPages();
        isFinished();
    });
});
