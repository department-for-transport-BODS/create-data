import { expectedPointToPointPeriodTicket, getMockRequestAndResponse } from '../../testData/mockData';
import editProductName from '../../../src/pages/api/editProductName';
import { MATCHING_JSON_ATTRIBUTE, MATCHING_JSON_META_DATA_ATTRIBUTE } from '../../../src/constants/attributes';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as index from '../../../src/utils/apiUtils/index';

jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/utils/apiUtils/index');

describe('editProductName', () => {
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    const redirectToErrorSpy = jest.spyOn(index, 'redirectToError');

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should update productName for periodTicket', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {
                id: 2,
                productName: 'My product',
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedPointToPointPeriodTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editProductName(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedPointToPointPeriodTicket,
                products: [{ ...expectedPointToPointPeriodTicket.products[0], productName: 'My product' }],
            },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2',
        });
    });

    it.each([
        [
            'Insufficient data provided for edit product name query.',
            {
                productName: 'My product',
            },
        ],
        ['Insufficient data provided for edit product name query.', { productName: ['My product'] }],
        [
            'Insufficient data provided for edit product name query.',
            {
                id: 2,
            },
        ],
        [
            'User has inputted a product name too short, too long or with invalid characters.',
            { productName: 'a', id: 2 },
        ],
        [
            'User has inputted a product name too short, too long or with invalid characters.',
            { productName: 'absjfkdfdfabsjfkdfdfabsjfkdfdfabsjfkdfdfabsjfkdfdfabsjfkdfdf', id: 2 },
        ],
        [
            'User has inputted a product name too short, too long or with invalid characters.',
            { productName: 'a%df', id: 2 },
        ],
        [
            'Service id passed is not a string.',
            {
                serviceId: ['1'],
            },
        ],
    ])('should throw %s for query input %s', async (errorMessage, query) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query,
            mockWriteHeadFn: writeHeadMock,
        });

        await editProductName(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem editing the selected product name',
            'api.editProductName',
            new Error(errorMessage),
        );
    });

    it('throws an error if either of the expected session attributes are missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {
                id: 2,
                productName: 'My product',
            },
            session: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await editProductName(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem editing the selected product name',
            'api.editProductName',
            new Error('Cannot delete product name as attributes not set.'),
        );
    });

    it('throws an error if the id in the request does not match the id in the session', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {
                id: 3,
                productName: 'My product',
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedPointToPointPeriodTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editProductName(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem editing the selected product name',
            'api.editProductName',
            new Error('Product id in request does not match product id in session.'),
        );
    });
});
