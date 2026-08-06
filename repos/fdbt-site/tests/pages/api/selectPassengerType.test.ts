import {
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    GROUP_SIZE_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import selectPassengerType from '../../../src/pages/api/selectPassengerType';
import * as aurora from '../../../src/data/auroradb';
import * as sessions from '../../../src/utils/sessions';
import * as userData from '../../../src/utils/apiUtils/userData';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { GROUP_PASSENGER_TYPE } from '../../../src/constants';
import { expectedSingleTicket } from '../../testData/mockData';
import { GroupPassengerTypeDb } from '../../../src/interfaces/dbTypes';

const groupDbResult: GroupPassengerTypeDb = {
    id: 3,
    name: 'family group',
    groupPassengerType: {
        name: 'family group',
        maxGroupSize: '4',
        companions: [
            {
                id: 1,
                minNumber: '1',
                maxNumber: '2',
                name: 'adult',
            },
            {
                id: 2,
                minNumber: '1',
                maxNumber: '2',
                name: 'child',
            },
        ],
    },
};

const individualDatabaseResult = {
    id: 3,
    name: 'Adult',
    passengerType: {
        id: 3,
        passengerType: 'adult',
    },
};

describe('selectPassengerType', () => {
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const getPassengerTypeByIdSpy = jest.spyOn(aurora, 'getPassengerTypeById');
    const getGroupPassengerTypeByIdSpy = jest.spyOn(aurora, 'getGroupPassengerTypeById');
    const pageErrorMessage = {
        errors: [{ errorMessage: 'Select a passenger type', id: 'individual-passengers' }],
    };
    afterEach(jest.resetAllMocks);

    it('should return 302 redirect to /selectPassengerType when no passenger type is selected and add errors to session', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectPassengerType(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PASSENGER_TYPE_ATTRIBUTE, pageErrorMessage);
    });

    it('should return 302 redirect to /selectPassengerType when the passenger selected is not for the logged in users NOC and add errors to session', async () => {
        getPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(undefined);
        getGroupPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(undefined);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                passengerTypeId: '7',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectPassengerType(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PASSENGER_TYPE_ATTRIBUTE, pageErrorMessage);
    });

    it('should return 302 redirect to /defineTimeRestrictions when the passenger selected is a group and the selected group information added to session', async () => {
        getPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(undefined);
        getGroupPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(groupDbResult);
        const convertToFullPassengerTypeSpy = jest.spyOn(aurora, 'convertToFullPassengerType');
        const fullGroup = {
            id: 1,
            name: 'family',
            groupPassengerType: {
                name: 'family',
                maxGroupSize: '3',
                companions: [
                    {
                        id: 1,
                        name: 'adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '75',
                        proofDocuments: [],
                    },
                    {
                        id: 2,
                        name: 'kid',
                        passengerType: 'child',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '5',
                        ageRangeMax: '17',
                        proofDocuments: [],
                    },
                ],
            },
        };
        convertToFullPassengerTypeSpy.mockImplementation().mockResolvedValue(fullGroup);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                passengerTypeId: '3',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectPassengerType(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectTimeRestrictions',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PASSENGER_TYPE_ATTRIBUTE, {
            passengerType: GROUP_PASSENGER_TYPE,
            id: 3,
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            GROUP_PASSENGER_INFO_ATTRIBUTE,
            fullGroup.groupPassengerType.companions,
        );
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_SIZE_ATTRIBUTE, {
            maxGroupSize: groupDbResult.groupPassengerType.maxGroupSize,
        });
    });

    it('should return 302 redirect to /defineTimeRestrictions when the passenger selected is an individual and the selected individual information added to session', async () => {
        getPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(individualDatabaseResult);
        getGroupPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(undefined);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                passengerTypeId: '3',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectPassengerType(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectTimeRestrictions',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PASSENGER_TYPE_ATTRIBUTE, {
            passengerType: 'adult',
            id: 3,
        });
    });

    it('should update the passenger type when in edit mode and redirect back to products/productDetails', async () => {
        getPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(individualDatabaseResult);
        getGroupPassengerTypeByIdSpy.mockImplementation().mockResolvedValue(groupDbResult);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                passengerTypeId: '3',
            },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await selectPassengerType(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            { ...expectedSingleTicket, passengerType: { id: 3 } },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=22D',
        });
    });
});
