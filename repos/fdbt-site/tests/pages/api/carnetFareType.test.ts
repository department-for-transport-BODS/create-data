import { getMockRequestAndResponse } from '../../testData/mockData';
import carnetFareType from '../../../src/pages/api/carnetFareType';
import * as sessions from '../../../src/utils/sessions';
import { FARE_TYPE_ATTRIBUTE, CARNET_FARE_TYPE_ATTRIBUTE } from '../../../src/constants/attributes';
import { ErrorInfo } from '../../../src/interfaces';

describe('fareType', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('sets the carnet session attribute if it is not currently set', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'schoolService' },
            mockWriteHeadFn: writeHeadMock,
        });
        carnetFareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CARNET_FARE_TYPE_ATTRIBUTE, true);
    });

    it('should return 302 redirect to /definePassengerType when schoolService is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'schoolService' },
            mockWriteHeadFn: writeHeadMock,
        });
        carnetFareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            fareType: req.body.fareType,
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /passengerType when any option other than schoolService is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'single' },
            mockWriteHeadFn: writeHeadMock,
        });
        carnetFareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            fareType: req.body.fareType,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /carnetFareType with errors when no option is selected', () => {
        const mockError: ErrorInfo[] = [
            { id: 'fare-type-single', errorMessage: 'Choose a carnet fare type from the options' },
        ];
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [CARNET_FARE_TYPE_ATTRIBUTE]: true,
            },
        });
        carnetFareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            errors: mockError,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/carnetFareType',
        });
    });
});
