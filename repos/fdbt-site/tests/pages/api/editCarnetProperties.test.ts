import { getMockRequestAndResponse, expectedCarnetReturnTicket } from '../../testData/mockData';
import { MATCHING_JSON_ATTRIBUTE, MATCHING_JSON_META_DATA_ATTRIBUTE } from '../../../src/constants/attributes';
import * as userData from '../../../src/utils/apiUtils/userData';
import editCarnetProperties, { validateDuration } from '../../../src/pages/api/editCarnetProperties';
import { CarnetExpiryUnit } from '../../../src/interfaces/matchingJsonTypes';
import { ErrorInfo } from '../../../src/interfaces';

describe('editCarnetProperties tests', () => {
    let writeHeadMock: jest.Mock;

    beforeEach(() => {
        writeHeadMock = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    it('should update a carnet products carnet expiry and quantity in bundle, then redirect back to products/productDetails', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                carnetQuantity: '4',
                carnetExpiryDuration: '3',
                carnetExpiryUnit: CarnetExpiryUnit.MONTH,
            },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedCarnetReturnTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editCarnetProperties(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedCarnetReturnTicket,
                products: [
                    {
                        ...expectedCarnetReturnTicket.products[0],
                        carnetDetails: { expiryTime: '3', expiryUnit: CarnetExpiryUnit.MONTH, quantity: '4' },
                    },
                ],
            },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2',
        });
    });
    const valuesToTest: Array<[string, CarnetExpiryUnit, string, ErrorInfo[]]> = [
        ['3', CarnetExpiryUnit.MONTH, '4', []],
        [
            '0',
            CarnetExpiryUnit.MONTH,
            '4',
            [
                {
                    id: 'edit-carnet-expiry-duration',
                    errorMessage: 'Carnet expiry amount cannot be less than 1',
                },
            ],
        ],
        ['', CarnetExpiryUnit.NO_EXPIRY, '4', []],
    ];
    it.each(valuesToTest)(
        'should update validate a carnet products carnet expiry and quantity in bundle',
        (expiryTime, expiryUnit, quantity, result) => {
            const errors = validateDuration(expiryTime, expiryUnit, quantity);
            expect(errors).toEqual(result);
        },
    );
});
