import groupPassengerTypes from '../../../src/pages/api/groupPassengerTypes';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessionUtils from '../../../src/utils/sessions';
import { GROUP_PASSENGER_TYPES_ATTRIBUTE } from '../../../src/constants/attributes';

describe('groupPassengerTypes', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessionUtils, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /groupPassengerTypes if passengerType is missing from req.body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        groupPassengerTypes(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/groupPassengerTypes',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose one or two passenger types from the options', id: 'passenger-type-0' }],
        });
    });

    it('should return 302 redirect to /groupPassengerTypes with error on session if passengerType array size is greater than 2', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                passengerTypes: ['adult', 'child', 'student'],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        groupPassengerTypes(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/groupPassengerTypes',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'Choose one or two passenger types - you cannot exceed this limit',
                    id: 'passenger-type-0',
                },
            ],
        });
    });

    it('should return 302 redirect to /definePassengerType with the appropriate query string', () => {
        const input = ['adult', 'child'];
        const { req, res } = getMockRequestAndResponse({
            body: { passengerTypes: input },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        groupPassengerTypes(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/definePassengerType?groupPassengerType=adult',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_PASSENGER_TYPES_ATTRIBUTE, {
            passengerTypes: input,
        });
    });
});
