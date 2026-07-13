import multipleProduct, {
    checkProductPricesAreValid,
    checkProductDurationsAreValid,
    containsErrors,
    getErrorsForSession,
    checkProductNamesAreValid,
    checkProductDurationTypesAreValid,
} from '../../../src/pages/api/multipleProducts';
import {
    multipleProducts,
    invalidDurationProducts,
    invalidPriceProducts,
    invalidNameProducts,
    getMockRequestAndResponse,
    duplicateNameProducts,
    invalidDurationTypeProducts,
    multipleProductsWithErrors,
} from '../../testData/mockData';
import * as apiUtils from '../../../src/utils/apiUtils';
import {
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as sessions from '../../../src/utils/sessions';

describe('multipleProducts', () => {
    let writeHeadMock: jest.Mock;

    beforeEach(() => {
        writeHeadMock = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cases: any[] = [
        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '-1',
                multipleProductDurationUnitsInput0: 'week',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'month',
            },
            { Location: '/multipleProducts' },
            'period',
        ],

        [
            {
                multipleProductNameInput0: 'B',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '1',
                multipleProductDurationUnitsInput0: 'year',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
            },
            { Location: '/multipleProducts' },
            'period',
        ],

        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '23',
                multipleProductDurationUnitsInput0: 'week',
                multipleProductNameInput1:
                    'Super Saver Bus Ticket for the cheapest you have ever seen and no other bus service will compare to this one, or your money back',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
            },
            { Location: '/multipleProducts' },
            'period',
        ],

        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '3',
                multipleProductDurationUnitsInput0: 'day',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
            },
            { Location: '/selectPeriodValidity' },
            'period',
        ],

        [
            {
                multipleProductNameInput0: '',
                multipleProductPriceInput0: '',
                multipleProductDurationInput0: '',
                multipleProductNameInput1: '',
                multipleProductPriceInput1: '',
                multipleProductDurationInput1: '',
                multipleProductNameInput3: '',
                multipleProductPriceInput3: '',
                multipleProductDurationInput3: '',
                multipleProductNameInput4: '',
                multipleProductPriceInput4: '',
                multipleProductDurationInput4: '',
            },
            { Location: '/multipleProducts' },
            'period',
        ],
        [
            {
                multipleProductNameInput0: 'test name',
                multipleProductPriceInput0: '100',
            },
            { Location: '/multipleProducts' },
            'ticketConfirmation',
            'flatFare',
        ],
    ];

    test.each(cases)('given %p as request, redirects to %p', (testData, expectedLocation, fareType) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: testData,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { fareType },
                [CARNET_FARE_TYPE_ATTRIBUTE]: false,
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, expectedLocation);
    });

    const carnetCases = [
        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '3',
                multipleProductDurationUnitsInput0: 'day',
                carnetQuantityInput0: '10',
                carnetExpiryDurationInput0: '5',
                carnetExpiryUnitInput0: 'year',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
                carnetQuantityInput1: '',
                carnetExpiryDurationInput1: '',
                carnetExpiryUnitInput1: '',
            },
            { Location: '/multipleProducts' },
        ],

        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '3',
                multipleProductDurationUnitsInput0: 'day',
                carnetQuantityInput0: '10',
                carnetExpiryDurationInput0: '5',
                carnetExpiryUnitInput0: 'year',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
                carnetQuantityInput1: '20.5',
                carnetExpiryDurationInput1: '10',
                carnetExpiryUnitInput1: 'week',
            },
            { Location: '/multipleProducts' },
        ],

        [
            {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '3',
                multipleProductDurationUnitsInput0: 'day',
                carnetQuantityInput0: '10',
                carnetExpiryDurationInput0: '5',
                carnetExpiryUnitInput0: 'year',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
                carnetQuantityInput1: '20',
                carnetExpiryDurationInput1: '10',
                carnetExpiryUnitInput1: 'week',
            },
            { Location: '/selectPeriodValidity' },
        ],
    ];

    it.each(carnetCases)('given %p as request, redirects to %p for carnet products', (testData, expectedLocation) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: testData,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [NUMBER_OF_PRODUCTS_ATTRIBUTE]: 2,
                [CARNET_FARE_TYPE_ATTRIBUTE]: true,
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, expectedLocation);
    });

    it('does not store the expiry time units if no expiry is chosen from the dropdown', () => {
        const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductDurationInput0: '3',
                multipleProductDurationUnitsInput0: 'day',
                carnetQuantityInput0: '10',
                carnetExpiryDurationInput0: '5',
                carnetExpiryUnitInput0: 'no expiry',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
                multipleProductDurationInput1: '54',
                multipleProductDurationUnitsInput1: 'week',
                carnetQuantityInput1: '20',
                carnetExpiryDurationInput1: '90',
                carnetExpiryUnitInput1: 'no expiry',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [CARNET_FARE_TYPE_ATTRIBUTE]: true,
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/selectPeriodValidity' });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_PRODUCT_ATTRIBUTE, {
            products: [
                {
                    carnetDetails: { expiryTime: '', expiryUnit: 'no expiry', quantity: '10' },
                    productCarnetExpiryDurationId: 'product-details-carnet-expiry-quantity-0',
                    productCarnetExpiryUnitsId: 'product-details-carnet-expiry-unit-0',
                    productCarnetQuantityId: 'product-details-carnet-quantity-0',
                    productDuration: '3',
                    productDurationId: 'product-details-period-duration-quantity-0',
                    productDurationUnits: 'day',
                    productDurationUnitsId: 'product-details-period-duration-unit-0',
                    productName: 'Best Product',
                    productNameId: 'multiple-product-name-0',
                    productPrice: '2.00',
                    productPriceId: 'multiple-product-price-0',
                },
                {
                    carnetDetails: { expiryTime: '', expiryUnit: 'no expiry', quantity: '20' },
                    productCarnetExpiryDurationId: 'product-details-carnet-expiry-quantity-1',
                    productCarnetExpiryUnitsId: 'product-details-carnet-expiry-unit-1',
                    productCarnetQuantityId: 'product-details-carnet-quantity-1',
                    productDuration: '54',
                    productDurationId: 'product-details-period-duration-quantity-1',
                    productDurationUnits: 'week',
                    productDurationUnitsId: 'product-details-period-duration-unit-1',
                    productName: 'Second Best Product',
                    productNameId: 'multiple-product-name-1',
                    productPrice: '2.05',
                    productPriceId: 'multiple-product-price-1',
                },
            ],
        });
    });

    it('redirects to ticket confirmation for a flat fare ticket', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
                multipleProductNameInput1: 'Second Best Product',
                multipleProductPriceInput1: '2.05',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'flatFare',
                },
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/ticketConfirmation' });
    });

    it('redirects to ticket confirmation for a multi operator flat fare ticket', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'multiOperator',
                },
                [TICKET_REPRESENTATION_ATTRIBUTE]: {
                    name: 'multipleServicesFlatFareMultiOperator',
                },
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/ticketConfirmation' });
    });

    it('redirects to page for a multi operator ticket with no flat fare', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                multipleProductNameInput0: 'Best Product',
                multipleProductPriceInput0: '2.00',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'multiOperator',
                },
                [TICKET_REPRESENTATION_ATTRIBUTE]: {
                    name: 'multipleServices',
                },
            },
        });

        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        multipleProduct(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/multipleProducts' });
    });

    describe('getErrorsForSession', () => {
        it('returns an empty array if a product list has no errors', () => {
            const errors = getErrorsForSession(multipleProducts);
            expect(errors).toEqual([]);
        });

        it('returns an error info array if a product list has errors', () => {
            const errors = getErrorsForSession(multipleProductsWithErrors);
            expect(errors.length).toBe(2);
        });
    });

    describe('containsErrors', () => {
        it('returns true if a product list has errors', () => {
            const result = containsErrors(multipleProductsWithErrors);
            expect(result).toBe(true);
        });

        it('returns false if a product list has no errors', () => {
            const result = containsErrors(multipleProducts);
            expect(result).toBe(false);
        });
    });

    describe('checkProductDurationsAreValid', () => {
        it('adds duration errors to a product with invalid durations', () => {
            const result = checkProductDurationsAreValid(invalidDurationProducts);
            expect(result[0].productDurationError).toBeUndefined();
            expect(result[1].productDurationError).toBe('Product duration cannot be zero or a negative number');
            expect(result[2].productDurationError).toBe('Product duration cannot be zero or a negative number');
            expect(result[3].productDurationError).toBe('Product duration cannot be empty');
            expect(result[4].productDurationError).toBe('Product duration must be a whole, positive number');
        });
    });

    describe('checkProductDurationTypesAreValid', () => {
        it('adds duration errors to a product with invalid durations', () => {
            const result = checkProductDurationTypesAreValid(invalidDurationTypeProducts, false);
            expect(result[0].productDurationUnitsError).toBeUndefined();
            expect(result[1].productDurationUnitsError).toBe('Choose an option from the dropdown');
            expect(result[2].productDurationUnitsError).toBeUndefined();
        });
    });

    describe('checkProductPricesAreValid', () => {
        it('adds price errors to a product with invalid prices', () => {
            const result = checkProductPricesAreValid(invalidPriceProducts);
            expect(result[0].productPriceError).toBeUndefined();
            expect(result[1].productPriceError).toBe('Product price cannot be empty');
            expect(result[2].productPriceError).toBe('This must be a positive number');
            expect(result[3].productPriceError).toBe('This must be a valid price in pounds and pence');
        });
    });

    describe('checkProductNamesAreValid', () => {
        it('adds name errors to a product with invalid names', () => {
            const result = checkProductNamesAreValid(invalidNameProducts);
            expect(result[0].productNameError).toBeUndefined();
            expect(result[1].productNameError).toBe('Product name cannot have less than 2 characters');
            expect(result[2].productNameError).toBe('Product name cannot have less than 2 characters');
            expect(result[3].productNameError).toBe('Product name cannot have more than 50 characters');
        });

        it('adds name errors to a product with duplicate names', () => {
            const result = checkProductNamesAreValid(duplicateNameProducts);
            expect(result[0].productNameError).toBe('Product names must be unique');
            expect(result[1].productNameError).toBe('Product names must be unique');
            expect(result[2].productNameError).toBe('Product names must be unique');
        });
    });
});
