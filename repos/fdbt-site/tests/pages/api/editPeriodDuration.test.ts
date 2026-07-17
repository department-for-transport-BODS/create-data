import { getMockRequestAndResponse, expectedPeriodGeoZoneTicketWithMultipleProducts } from '../../testData/mockData';
import { MATCHING_JSON_ATTRIBUTE, MATCHING_JSON_META_DATA_ATTRIBUTE } from '../../../src/constants/attributes';
import editPeriodDuration, { validateDuration } from '../../../src/pages/api/editPeriodDuration';
import * as userData from '../../../src/utils/apiUtils/userData';
import { ErrorInfo } from '../../../src/interfaces';

describe('editPeriodDuration tests', () => {
    let writeHeadMock: jest.Mock;

    beforeEach(() => {
        writeHeadMock = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    it('should update a products period duration and redirect back to products/productDetails', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { periodDurationInput: '6', periodDurationUnitsInput: 'week' },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedPeriodGeoZoneTicketWithMultipleProducts,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editPeriodDuration(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedPeriodGeoZoneTicketWithMultipleProducts,
                products: [
                    { ...expectedPeriodGeoZoneTicketWithMultipleProducts.products[0], productDuration: '6 weeks' },
                ],
            },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2',
        });
    });
    const valuesToTest: Array<[string, string, ErrorInfo[]]> = [
        ['2', 'hour', []],
        ['', 'hour', [{ id: 'edit-period-duration-quantity', errorMessage: 'Product duration cannot be empty' }]],
        [
            '',
            '',
            [
                { id: 'edit-period-duration-quantity', errorMessage: 'Product duration cannot be empty' },
                { id: 'edit-period-duration-unit', errorMessage: 'Choose an option from the dropdown' },
            ],
        ],
    ];
    it.each(valuesToTest)(
        'should update validate period products duration',
        (productDuration, productDurationUnit, result) => {
            const errors = validateDuration(productDuration, productDurationUnit);
            expect(errors).toEqual(result);
        },
    );
});
