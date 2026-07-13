import * as aurora from '../../../src/data/auroradb';
import * as utils from '../../../src/utils/apiUtils/index';
import * as session from '../../../src/utils/sessions';
import { MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE } from '../../../src/constants/attributes';
import managePassengerTypes from '../../../src/pages/api/managePassengerTypes';
import { getMockRequestAndResponse } from '../../testData/mockData';

const getAndValidateNocSpy = jest.spyOn(utils, 'getAndValidateNoc');
const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
const getSinglePassengerTypeByNameAndNationalOperatorCodeSpy = jest.spyOn(
    aurora,
    'getSinglePassengerTypeByNameAndNocCode',
);
const updateSinglePassengerTypeSpy = jest.spyOn(aurora, 'updateSinglePassengerType');
const insertSinglePassengerTypeSpy = jest.spyOn(aurora, 'insertSinglePassengerType');

describe('managePassengerTypes', () => {
    const writeHeadMock = jest.fn();

    afterEach(jest.resetAllMocks);

    it('should call the getAndValidateNoc function', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await managePassengerTypes(req, res);

        expect(getAndValidateNocSpy).toHaveBeenCalledWith(req, res);
    });

    it('should error when name is an empty string', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: '',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Name must be provided',
                    id: 'name',
                },
            ],
            inputs: {
                id: 1,
                name: '',
                passengerType: {
                    id: 1,
                    passengerType: 'Adult',
                    ageRangeMin: '18',
                    ageRangeMax: '65',
                    proofDocuments: [],
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=1' });
    });

    it('should error when name is a bunch of spaces and no real characters', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: '     ',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Name must be provided',
                    id: 'name',
                },
            ],
            inputs: {
                id: 1,
                name: '',
                passengerType: {
                    id: 1,
                    passengerType: 'Adult',
                    ageRangeMin: '18',
                    ageRangeMax: '65',
                    proofDocuments: [],
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=1' });
    });

    it('should error when name is greater than 50 characters', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: 'ThisIsSomeVeryLongNameThatIsUnlikleyButYouNeverKnow',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Name must be 50 characters or under',
                    id: 'name',
                },
            ],
            inputs: {
                id: 1,
                name: 'ThisIsSomeVeryLongNameThatIsUnlikleyButYouNeverKnow',
                passengerType: {
                    id: 1,
                    passengerType: 'Adult',
                    ageRangeMin: '18',
                    ageRangeMax: '65',
                    proofDocuments: [],
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=1' });
    });

    it('should error when age greater than 150', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: 'Adults',
                type: 'Adult',
                ageRangeMin: '151',
                ageRangeMax: '161',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Age cannot be greater than 150',
                    id: 'age-range-min',
                },
                {
                    errorMessage: 'Age cannot be greater than 150',
                    id: 'age-range-max',
                },
            ],
            inputs: {
                id: 1,
                name: 'Adults',
                passengerType: {
                    id: 1,
                    passengerType: 'Adult',
                    ageRangeMin: '151',
                    ageRangeMax: '161',
                    proofDocuments: [],
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=1' });
    });

    it('should error when minimum age is greater than maximum age', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: 'Adults',
                type: 'Adult',
                ageRangeMin: '19',
                ageRangeMax: '18',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Minimum age cannot be greater than maximum age',
                    id: 'age-range-min',
                },
            ],
            inputs: {
                id: 1,
                name: 'Adults',
                passengerType: {
                    passengerType: 'Adult',
                    ageRangeMin: '19',
                    ageRangeMax: '18',
                    proofDocuments: [],
                    id: 1,
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=1' });
    });

    it('should error when adding a passenger type with the same name as an existing one', async () => {
        getSinglePassengerTypeByNameAndNationalOperatorCodeSpy.mockResolvedValueOnce({
            id: 1,
            name: 'Adults',
            passengerType: {
                id: 4,
                passengerType: 'Adult',
                ageRangeMin: '19',
                ageRangeMax: '18',
                proofDocuments: ['studentCard'],
            },
        });

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '2',
                name: 'Adults',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Adults already exists as a passenger type',
                    id: 'name',
                },
            ],
            inputs: {
                id: 2,
                name: 'Adults',
                passengerType: {
                    passengerType: 'Adult',
                    ageRangeMin: '18',
                    ageRangeMax: '65',
                    proofDocuments: [],
                    id: 2,
                },
            },
        };

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/managePassengerTypes?id=2' });
    });

    it('should call updateSessionAttribute with undefined when no errors present & updateSinglePassengerType', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '1',
                name: 'Adults',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const singlePassengerType = {
            id: 1,
            name: 'Adults',
            passengerType: {
                passengerType: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
                id: 1,
            },
        };

        const attributeValue = undefined;

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(updateSinglePassengerTypeSpy).toHaveBeenCalledWith(undefined, singlePassengerType);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/viewPassengerTypes' });
    });

    it('should call updateSessionAttribute with undefined & updateSinglePassengerType when not in Edit mode', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                id: '',
                name: 'Adults',
                type: 'Adult',
                ageRangeMin: '18',
                ageRangeMax: '65',
                proofDocuments: [],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const passengerType = {
            passengerType: 'Adult',
            ageRangeMin: '18',
            ageRangeMax: '65',
            proofDocuments: [],
            id: '',
        };

        const attributeValue = undefined;

        await managePassengerTypes(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
            attributeValue,
        );

        expect(insertSinglePassengerTypeSpy).toHaveBeenCalledWith(undefined, passengerType, 'Adults');

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/viewPassengerTypes' });
    });
});
