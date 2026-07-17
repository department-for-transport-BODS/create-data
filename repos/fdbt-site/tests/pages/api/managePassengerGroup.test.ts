import managePassengerGroup from '../../../src/pages/api/managePassengerGroup';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as session from '../../../src/utils/sessions';
import * as aurora from '../../../src/data/auroradb';
import { GS_PASSENGER_GROUP_ATTRIBUTE } from '../../../src/constants/attributes';
import { FullGroupPassengerType } from '../../../src/interfaces/dbTypes';

const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
const getGroupPassengerTypesFromGlobalSettingsSpy = jest.spyOn(aurora, 'getGroupPassengerTypesFromGlobalSettings');
const convertToFullPassengerTypeSpy = jest.spyOn(aurora, 'convertToFullPassengerType');
const insertGroupPassengerTypeSpy = jest.spyOn(aurora, 'insertGroupPassengerType');
const updateGroupPassengerTypeSpy = jest.spyOn(aurora, 'updateGroupPassengerType');
insertGroupPassengerTypeSpy.mockResolvedValue();
updateGroupPassengerTypeSpy.mockResolvedValue();

afterEach(() => {
    jest.resetAllMocks();
});

describe('managePassengerGroup', () => {
    it('should return 302 redirect to /managePassengerGroup when there have been no user inputs and update session with errors', async () => {
        const writeHeadMock = jest.fn();
        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                maxGroupSize: '',
                ['minimumPassengers12']: '',
                ['maximumPassengers12']: '',
                ['minimumPassengers43']: '',
                ['maximumPassengers43']: '',
                passengerGroupName: '',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await managePassengerGroup(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/managePassengerGroup',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, {
            errors: [
                { errorMessage: 'Maximum group size cannot be empty', id: 'max-group-size', userInput: '' },
                { errorMessage: 'Select at least one passenger type', id: 'passenger-type-0' },
                {
                    errorMessage: 'Enter a group name of up to 50 characters',
                    id: 'passenger-group-name',
                    userInput: '',
                },
            ],
            inputs: { groupPassengerType: { companions: [], maxGroupSize: '', name: '' }, id: undefined, name: '' },
        });
    });

    it('should return 302 redirect to /managePassengerGroup when there have been incorrect user inputs and update session with errors and inputs', async () => {
        const writeHeadMock = jest.fn();

        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([]);

        const fullGroupPassengerType: FullGroupPassengerType = {
            id: 2,
            name: 'Family5',
            groupPassengerType: {
                name: 'adult',
                maxGroupSize: '5',
                companions: [
                    {
                        id: 12,
                        name: 'Adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '65',
                        proofDocuments: [],
                    },
                ],
            },
        };

        convertToFullPassengerTypeSpy.mockResolvedValueOnce(fullGroupPassengerType);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                maxGroupSize: 'seven',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: 'one',
                ['maximumPassengers12']: 'three',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '2',
                passengerGroupName: '',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await managePassengerGroup(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/managePassengerGroup',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'Maximum group size must be a whole, positive number',
                    id: 'max-group-size',
                    userInput: 'seven',
                },
                {
                    errorMessage: 'Minimum amount of Adult must be a whole, positive number',
                    id: 'minimum-passengers-12',
                    userInput: 'one',
                },
                {
                    errorMessage: 'Maximum amount of Adult must be a whole, positive number',
                    id: 'maximum-passengers-12',
                    userInput: 'three',
                },
                {
                    errorMessage: 'Enter a group name of up to 50 characters',
                    id: 'passenger-group-name',
                    userInput: '',
                },
            ],
            inputs: {
                groupPassengerType: {
                    companions: [
                        {
                            id: 12,
                            maxNumber: 'three',
                            minNumber: 'one',
                            name: 'Adult',
                        },
                        {
                            id: 43,
                            maxNumber: '2',
                            minNumber: '1',
                            name: 'Adult',
                        },
                    ],
                    maxGroupSize: 'seven',
                    name: '',
                },
                id: undefined,
                name: '',
            },
        });
    });

    it('should return 302 redirect to /viewPassengerTypes when group has two of the same passenger types and allow creation', async () => {
        const writeHeadMock = jest.fn();

        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([]);

        const fullGroupPassengerType: FullGroupPassengerType = {
            id: 2,
            name: 'Family5',
            groupPassengerType: {
                name: 'Family5',
                maxGroupSize: '5',
                companions: [
                    {
                        id: 12,
                        name: 'regular adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '65',
                        proofDocuments: [],
                    },
                    {
                        id: 43,
                        name: 'adults',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '65',
                        proofDocuments: [],
                    },
                ],
            },
        };

        convertToFullPassengerTypeSpy.mockResolvedValueOnce(fullGroupPassengerType);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                maxGroupSize: '5',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: '1',
                ['maximumPassengers12']: '2',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '2',
                passengerGroupName: 'Family5',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await managePassengerGroup(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/viewPassengerTypes',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, undefined);

        expect(insertGroupPassengerTypeSpy).toHaveBeenCalledWith(
            'TEST',
            {
                companions: [
                    {
                        id: 12,
                        maxNumber: '2',
                        minNumber: '1',
                        name: 'Adult',
                    },
                    {
                        id: 43,
                        maxNumber: '2',
                        minNumber: '1',
                        name: 'Adult',
                    },
                ],
                maxGroupSize: '5',
                name: 'Family5',
            },
            'Family5',
        );
    });

    it('should return 302 redirect to /managePassengerGroup when there have been correct user inputs but there is a group with the same name', async () => {
        const writeHeadMock = jest.fn();
        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([
            {
                id: 2,
                name: 'My duplicate group',
                groupPassengerType: {
                    name: 'adult',
                    maxGroupSize: '3',
                    companions: [
                        {
                            id: 1,
                            name: 'adult',
                            passengerType: 'adult',
                            minNumber: '2',
                            maxNumber: '3',
                            ageRangeMin: '18',
                            ageRangeMax: '79',
                            proofDocuments: [],
                        },
                    ],
                },
            },
        ]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                maxGroupSize: '7',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: '2',
                ['maximumPassengers12']: '3',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '2',
                passengerGroupName: 'My duplicate group',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await managePassengerGroup(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/managePassengerGroup',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'There is already a group with this name. Choose another',
                    id: 'passenger-group-name',
                    userInput: 'My duplicate group',
                },
            ],
            inputs: {
                groupPassengerType: {
                    companions: [
                        {
                            id: 12,
                            maxNumber: '3',
                            minNumber: '2',
                            name: 'Adult',
                        },
                        {
                            id: 43,
                            maxNumber: '2',
                            minNumber: '1',
                            name: 'Adult',
                        },
                    ],
                    maxGroupSize: '7',
                    name: 'My duplicate group',
                },
                name: 'My duplicate group',
                id: undefined,
            },
        });
    });

    it('should return 302 redirect to /viewPassengerTypes when there have been correct user inputs and the group is saved to the db', async () => {
        const writeHeadMock = jest.fn();

        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([]);

        const fullGroupPassengerType: FullGroupPassengerType = {
            id: 2,
            name: 'Family5',
            groupPassengerType: {
                name: 'adult',
                maxGroupSize: '5',
                companions: [
                    {
                        id: 12,
                        name: 'adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '65',
                        proofDocuments: [],
                    },
                ],
            },
        };

        convertToFullPassengerTypeSpy.mockResolvedValueOnce(fullGroupPassengerType);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                maxGroupSize: '5',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: '1',
                ['maximumPassengers12']: '2',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '3',
                passengerGroupName: 'My group',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await managePassengerGroup(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/viewPassengerTypes',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, undefined);

        expect(insertGroupPassengerTypeSpy).toHaveBeenCalledWith(
            'TEST',
            {
                companions: [
                    {
                        id: 12,
                        maxNumber: '2',
                        minNumber: '1',
                        name: 'Adult',
                    },
                    {
                        id: 43,
                        maxNumber: '3',
                        minNumber: '1',
                        name: 'Adult',
                    },
                ],
                maxGroupSize: '5',
                name: 'My group',
            },
            'My group',
        );
    });

    it('should return 302 redirect to /viewPassengerTypes when there has been a correct edit made and the group is updated in the db', async () => {
        const writeHeadMock = jest.fn();

        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([
            {
                id: 2,
                name: 'Family5',
                groupPassengerType: {
                    name: 'adult',
                    maxGroupSize: '5',
                    companions: [
                        {
                            id: 12,
                            name: 'adult',
                            passengerType: 'adult',
                            minNumber: '1',
                            maxNumber: '2',
                            ageRangeMin: '18',
                            ageRangeMax: '65',
                            proofDocuments: [],
                        },
                    ],
                },
            },
        ]);

        const fullGroupPassengerType: FullGroupPassengerType = {
            id: 2,
            name: 'Family5',
            groupPassengerType: {
                name: 'adult',
                maxGroupSize: '5',
                companions: [
                    {
                        id: 12,
                        name: 'adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '65',
                        proofDocuments: [],
                    },
                ],
            },
        };

        convertToFullPassengerTypeSpy.mockResolvedValueOnce(fullGroupPassengerType);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                groupId: '2',
                maxGroupSize: '5',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: '1',
                ['maximumPassengers12']: '2',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '3',
                passengerGroupName: 'Five Family',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await managePassengerGroup(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/viewPassengerTypes',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, undefined);

        expect(updateGroupPassengerTypeSpy).toHaveBeenCalledWith('TEST', {
            groupPassengerType: {
                companions: [
                    { id: 12, maxNumber: '2', minNumber: '1', name: 'Adult' },
                    { id: 43, maxNumber: '3', minNumber: '1', name: 'Adult' },
                ],
                maxGroupSize: '5',
                name: 'Five Family',
            },
            id: 2,
            name: 'Five Family',
        });
    });

    it('should return 302 redirect to /managePassengerGroup?id=2 with errors when the group name is already in use by another group in edit mode', async () => {
        const writeHeadMock = jest.fn();
        getGroupPassengerTypesFromGlobalSettingsSpy.mockResolvedValueOnce([
            {
                id: 3,
                name: 'group',
                groupPassengerType: {
                    name: 'adult',
                    maxGroupSize: '3',
                    companions: [
                        {
                            id: 1,
                            name: 'adult',
                            passengerType: 'adult',
                            minNumber: '2',
                            maxNumber: '3',
                            ageRangeMin: '18',
                            ageRangeMax: '79',
                            proofDocuments: [],
                        },
                    ],
                },
            },
        ]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                groupId: '2',
                maxGroupSize: '7',
                passengerTypes: ['12', '43'],
                ['minimumPassengers12']: '2',
                ['maximumPassengers12']: '3',
                ['minimumPassengers43']: '1',
                ['maximumPassengers43']: '2',
                passengerGroupName: 'group',
                passengerType12: 'Adult',
                passengerType43: 'Adult',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await managePassengerGroup(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/managePassengerGroup?id=2',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_PASSENGER_GROUP_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'There is already a group with this name. Choose another',
                    id: 'passenger-group-name',
                    userInput: 'group',
                },
            ],
            inputs: {
                groupPassengerType: {
                    companions: [
                        { id: 12, maxNumber: '3', minNumber: '2', name: 'Adult' },
                        { id: 43, maxNumber: '2', minNumber: '1', name: 'Adult' },
                    ],
                    maxGroupSize: '7',
                    name: 'group',
                },
                id: 2,
                name: 'group',
            },
        });
        expect(updateGroupPassengerTypeSpy).toHaveBeenCalledTimes(0);
    });
});
