import {
    CAPS_DEFINITION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as auroradb from '../../../src/data/auroradb';
import selectCaps from '../../../src/pages/api/selectCaps';
import * as sessions from '../../../src/utils/sessions';
import { expectedSingleTicket, getMockRequestAndResponse, mockIdTokenMultiple } from '../../testData/mockData';
import * as userData from '../../../src/utils/apiUtils/userData';
import { CapExpiryUnit } from '../../../src/interfaces/matchingJsonTypes';

jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/data/auroradb');

describe('selectCaps', () => {
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should set the CAPS_DEFINITION_ATTRIBUTE and redirect to select purchase methods when no errors are found', async () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const getCapByNocAndIdSpy = jest.spyOn(auroradb, 'getCapByNocAndId');
        getCapByNocAndIdSpy.mockImplementation().mockResolvedValue({
            id: 2,
            capDetails: {
                name: 'cappy cap',
                price: '2',
                durationAmount: '1',
                durationUnits: CapExpiryUnit.MONTH,
            },
        });
        const { req, res } = getMockRequestAndResponse({
            body: {
                capChoice: 'yes',
                caps: [2],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            cookieValues: {
                idToken: mockIdTokenMultiple,
            },
            session: {
                [OPERATOR_ATTRIBUTE]: { name: 'test', nocCode: 'HELLO', uuid: 'blah' },
            },
        });
        await selectCaps(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CAPS_DEFINITION_ATTRIBUTE, [
            {
                id: 2,
            },
        ]);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPurchaseMethods',
        });

        expect(getCapByNocAndIdSpy).toHaveBeenCalledWith('HELLO', 2);
    });

    it('should update the product details redirect to select purchase methods ', async () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const getCapByNocAndIdSpy = jest.spyOn(auroradb, 'getCapByNocAndId');

        getCapByNocAndIdSpy.mockImplementation().mockResolvedValue({
            id: 2,
            capDetails: {
                name: 'cappy cap',
                price: '2',
                durationAmount: '1',
                durationUnits: CapExpiryUnit.MONTH,
            },
        });

        const { req, res } = getMockRequestAndResponse({
            body: {
                capChoice: 'yes',
                caps: [2],
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            cookieValues: {
                idToken: mockIdTokenMultiple,
            },
            session: {
                [OPERATOR_ATTRIBUTE]: { name: 'test', nocCode: 'HELLO', uuid: 'blah' },
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
        });

        await selectCaps(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CAPS_DEFINITION_ATTRIBUTE, undefined);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });

        expect(getCapByNocAndIdSpy).toHaveBeenCalledWith('HELLO', 2);
    });

    it('redirect back to selectCaps with errors if user does not select a premade cap but chose yes radio button', async () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const { req, res } = getMockRequestAndResponse({
            body: {
                capChoice: 'yes',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectCaps(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CAPS_DEFINITION_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose one of the premade caps', id: 'caps' }],
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectCaps',
        });
    });
    it('redirect back to selectCaps with errors if user does not select any radio button', async () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const { req, res } = getMockRequestAndResponse({
            body: {},
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectCaps(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CAPS_DEFINITION_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose one of the options below', id: 'no-caps' }],
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectCaps',
        });
    });
    it('redirects to selectPurchaseMethods when the user choses the no radio button', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                capChoice: 'no',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await selectCaps(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPurchaseMethods',
        });
    });
});
