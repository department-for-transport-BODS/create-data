import fareConfirmation from '../../../src/pages/api/fareConfirmation';
import * as apiUtils from '../../../src/utils/apiUtils';
import { getMockRequestAndResponse, mockSchemOpIdToken } from '../../testData/mockData';
import { OPERATOR_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../../../src/constants/attributes';

describe('fareConfirmation', () => {
    const writeHeadMock = jest.fn();
    const redirectOnFareTypeSpy = jest.spyOn(apiUtils, 'redirectOnFareType');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should redirect on fareType when the user logged in is not a scheme operator', () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });
        fareConfirmation(req, res);
        expect(redirectOnFareTypeSpy).toHaveBeenCalled();
    });

    it('should redirect to /ticketRepresentation when the user logged in is a scheme operator', () => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
            cookieValues: {
                idToken: mockSchemOpIdToken,
            },
            session: {
                [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
            },
        });
        fareConfirmation(req, res);
        expect(redirectOnFareTypeSpy).toHaveBeenCalled();
    });
});
