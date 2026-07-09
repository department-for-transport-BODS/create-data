import { expectedCarnetReturnTicket, getMockRequestAndResponse } from '../../testData/mockData';
import copyProduct from '../../../src/pages/api/copyProduct';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as index from '../../../src/utils/apiUtils/index';
import { getProductById, getProductIdByMatchingJsonLink } from '../../../src/data/auroradb';
import { getProductsMatchingJson } from '../../../src/data/s3';

jest.mock('../../../src/utils/apiUtils/index');

jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/data/s3');

describe('copyProduct', () => {
    const noc = 'mynoc';
    const writeHeadMock = jest.fn();
    jest.spyOn(index, 'getAndValidateNoc').mockReturnValue(noc);
    (getProductIdByMatchingJsonLink as jest.Mock).mockResolvedValue('2');
    (getProductById as jest.Mock).mockResolvedValueOnce('path');
    (getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedCarnetReturnTicket);
    const insertDataToProductsBucketAndProductsTableSpy = jest.spyOn(
        userData,
        'insertDataToProductsBucketAndProductsTable',
    );
    insertDataToProductsBucketAndProductsTableSpy.mockImplementationOnce(() => Promise.resolve('pathOne'));
    const redirectToErrorSpy = jest.spyOn(index, 'redirectToError');

    it('should copy the ticket and create a new entry in s3 and the database', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {
                id: 2,
                serviceId: 'serviceIdzz',
            },
            session: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await copyProduct(req, res);

        expect(insertDataToProductsBucketAndProductsTableSpy).toHaveBeenCalledWith(
            expectedCarnetReturnTicket,
            noc,
            expect.any(String),
            {
                req,
                res,
            },
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&copied=true&serviceId=serviceIdzz',
        });
    });

    it.each([
        [
            'Service id or product id is invalid.',
            {
                serviceId: 'serviceIdzz',
            },
        ],
        [
            'Service id or product id is invalid.',
            {
                id: 2,
                serviceId: ['id'],
            },
        ],
        ['Service id or product id is invalid.', {}],
    ])('should throw %s for query input %s', async (errorMessage, query) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query,
            mockWriteHeadFn: writeHeadMock,
        });

        await copyProduct(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem copying the selected product',
            'api.copyProduct',
            new Error(errorMessage),
        );
    });
});
