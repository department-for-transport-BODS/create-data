import * as session from '../../../src/utils/sessions';
import * as index from '../../../src/utils/apiUtils';
import { CREATE_CAPS_ATTRIBUTE } from '../../../src/constants/attributes';
import createCaps from '../../../src/pages/api/createCaps';
import * as db from '../../../src/data/auroradb';
import { CapExpiryUnit, FromDb } from 'src/interfaces/matchingJsonTypes';
import { Cap } from 'src/interfaces';
import { getMockRequestAndResponse } from '../../testData/mockData';

jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/utils/apiUtils');

describe('createCaps', () => {
    const writeHeadMock = jest.fn();
    jest.mock('../../../src/data/auroradb');
    const insertSpy = jest.spyOn(db, 'insertCaps');
    const updateSpy = jest.spyOn(db, 'updateCaps');
    const getCapsSpy = jest.spyOn(db, 'getCaps');

    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
    jest.spyOn(index, 'getAndValidateNoc').mockReturnValue('BLAC');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('redirects back to /createCaps if there is no user entry', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: '',
                capPriceInput0: '',
                capDurationInput0: '',
                capDurationUnitsInput0: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createCaps(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/createCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, {
            capDetails: {
                durationAmount: '',
                durationUnits: '',
                name: '',
                price: '',
            },
            errors: [
                { errorMessage: 'Cap name cannot have less than 2 characters', id: 'cap-name' },
                { errorMessage: 'Cap price cannot be empty', id: 'cap-price' },
                { errorMessage: 'Cap duration cannot be empty', id: 'cap-period-duration-quantity' },
                { errorMessage: 'Choose an option from the dropdown', id: 'cap-duration-unit' },
            ],
        });
    });

    it('redirects back to /createCaps if the user entry contains mistakes', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: 'hello',
                capPrice: '',
                capDuration: '2',
                capDurationUnits: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createCaps(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/createCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, {
            capDetails: {
                durationAmount: '2',
                durationUnits: '',
                name: 'hello',
                price: '',
            },
            errors: [
                { errorMessage: 'Cap price cannot be empty', id: 'cap-price' },
                { errorMessage: 'Choose an option from the dropdown', id: 'cap-duration-unit' },
            ],
        });
    });

    it('redirects back to /createCaps if the user enters 0 as an input', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: 'Name',
                capPrice: '0',
                capDuration: '2',
                capDurationUnits: 'week',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await createCaps(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/createCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, {
            capDetails: {
                durationAmount: '2',
                durationUnits: 'week',
                name: 'Name',
                price: '0',
            },
            errors: [{ errorMessage: 'Cap prices cannot be zero', id: 'cap-price' }],
        });
    });

    it('redirects back to /createCaps if the cap name already exists', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: 'Cap 1',
                capPrice: '2',
                capDuration: '2',
                capDurationUnits: 'week',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const cap: FromDb<Cap> = {
            capDetails: {
                name: 'Cap 1',
                price: '4',
                durationAmount: '2',
                durationUnits: 'week' as CapExpiryUnit,
            },
            id: 2,
        };

        getCapsSpy.mockResolvedValueOnce([cap]);

        await createCaps(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/createCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, {
            capDetails: {
                durationAmount: '2',
                durationUnits: 'week',
                name: 'Cap 1',
                price: '2',
            },
            errors: [{ errorMessage: 'You already have a cap named Cap 1. Choose another name.', id: 'cap-name' }],
        });
    });

    it('redirects back to /viewCaps on user input', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: 'Cap 1',
                capPrice: '2',
                capDuration: '2',
                capDurationUnits: 'month',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const expected = {
            capDetails: {
                name: 'Cap 1',
                price: '2',
                durationAmount: '2',
                durationUnits: 'month',
            },
        };
        getCapsSpy.mockResolvedValueOnce([]);

        await createCaps(req, res);
        expect(updateSpy).not.toBeCalled();
        expect(insertSpy).toHaveBeenCalledWith(undefined, expected);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/viewCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, undefined);
    });

    it('redirects back to /viewCaps on edit mode', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capName: 'Cap 1',
                capPrice: '2',
                capDuration: '2',
                capDurationUnits: 'month',
                id: '1',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const expected = {
            capDetails: {
                name: 'Cap 1',
                price: '2',
                durationAmount: '2',
                durationUnits: 'month',
            },
        };
        getCapsSpy.mockResolvedValueOnce([]);

        await createCaps(req, res);
        expect(insertSpy).not.toBeCalled();
        expect(updateSpy).toHaveBeenCalledWith(undefined, 1, expected);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/viewCaps',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CREATE_CAPS_ATTRIBUTE, undefined);
    });
});
