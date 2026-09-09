import { continueButtonClick, isFinished, selectProductScope } from '../../../support/helpers';
import {
    completeFlatFareCarnet,
    completeFlatFarePages,
    completeSalesPages,
    defineUserTypeAndTimeRestrictions,
    selectCarnetFareType,
} from '../../../support/steps';

describe('The flat fare carnet product journey', () => {
    it('completes successfully for multiple services', () => {
        selectCarnetFareType('flatFare');
        defineUserTypeAndTimeRestrictions();
        completeFlatFareCarnet();
        completeSalesPages(3, 'Flat fare carnet ');
        isFinished();
    });

    it('completes successfully for geoZone', () => {
        selectCarnetFareType('flatFare');
        defineUserTypeAndTimeRestrictions();
        selectProductScope('geoZone');
        continueButtonClick();
        completeFlatFarePages('Flat fare carnet 1', false, true, true);
        completeSalesPages(1);
        isFinished();
    });
});
