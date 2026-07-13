import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    SALES_OFFER_PACKAGES_ATTRIBUTE,
} from '../../../src/constants/attributes';
import { MultiProduct } from '../../../src/interfaces';
import selectSalesOfferPackages, {
    getProductsByValues,
    sanitiseReqBody,
} from '../../../src/pages/api/selectSalesOfferPackage';
import * as session from '../../../src/utils/sessions';
import {
    expectedFlatFareTicket,
    expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
    expectedPointToPointPeriodTicket,
    expectedSingleTicket,
    getMockRequestAndResponse,
} from '../../testData/mockData';
import * as userData from '../../../src/utils/apiUtils/userData';
import { ExpiryUnit, TicketWithIds } from '../../../src/interfaces/matchingJsonTypes';

describe('selectSalesOfferPackage', () => {
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    beforeEach(jest.resetAllMocks);

    it('redirects back to /selectSalesOfferPackages if there are no sales offer packages selected, single product', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                '^0000-product-TestProduct': '',
            },
        });

        await selectSalesOfferPackages(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/selectPurchaseMethods',
        });
    });

    it('redirects back to /selectSalesOfferPackages if there are no sales offer packages selected, multiple product', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                '^0000-product-TestProduct': '',
                '^0001-product-SecondTestProduct': '',
            },
        });

        await selectSalesOfferPackages(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/selectPurchaseMethods',
        });
    });

    it('should update the purchase method when in edit mode and redirect back to products/productDetails', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                'product-product':
                    '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
            },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
                [MULTIPLE_PRODUCT_ATTRIBUTE]: undefined,
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await selectSalesOfferPackages(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedSingleTicket,
                products: [
                    {
                        ...expectedSingleTicket.products[0],
                        salesOfferPackages: [{ id: 1 }],
                    },
                ],
            },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=22D',
        });
    });

    it('redirects to /productDateInformation if there are sales offer packages selected', async () => {
        const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
        const { req, res } = getMockRequestAndResponse({
            body: {
                'product-Weekly Ticket':
                    '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
                'price-Weekly Ticket-Adult': '22',
                'product-Day Ticket':
                    '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
                'price-Day Ticket-Adult': '22',
                'product-Monthly Ticket':
                    '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
                'price-Monthly Ticket-Adult': '22',
            },
            session: {
                [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                    products: [
                        {
                            productName: 'Weekly Ticket',
                            productPrice: '50',
                            productDuration: '5',
                            productDurationUnits: ExpiryUnit.WEEK,
                            productValidity: '24hr',
                        },
                        {
                            productName: 'Day Ticket',
                            productPrice: '2.50',
                            productDuration: '1',
                            productDurationUnits: ExpiryUnit.YEAR,
                            productValidity: '24hr',
                        },
                        {
                            productName: 'Monthly Ticket',
                            productPrice: '200',
                            productDuration: '28',
                            productDurationUnits: ExpiryUnit.MONTH,
                            productValidity: 'endOfCalendarDay',
                        },
                    ] as MultiProduct[],
                },
            },
        });

        await selectSalesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SALES_OFFER_PACKAGES_ATTRIBUTE, [
            {
                productName: 'Weekly Ticket',
                salesOfferPackages: [
                    {
                        description: '',
                        id: 1,
                        name: 'Adult',
                        paymentMethods: ['mobilePhone'],
                        purchaseLocations: ['mobileDevice'],
                        ticketFormats: ['paperTicket', 'smartCard'],
                    },
                ],
            },
            {
                productName: 'Day Ticket',
                salesOfferPackages: [
                    {
                        description: '',
                        id: 1,
                        name: 'Adult',
                        paymentMethods: ['mobilePhone'],
                        purchaseLocations: ['mobileDevice'],
                        ticketFormats: ['paperTicket', 'smartCard'],
                    },
                ],
            },
            {
                productName: 'Monthly Ticket',
                salesOfferPackages: [
                    {
                        description: '',
                        id: 1,
                        name: 'Adult',
                        paymentMethods: ['mobilePhone'],
                        purchaseLocations: ['mobileDevice'],
                        ticketFormats: ['paperTicket', 'smartCard'],
                    },
                ],
            },
        ]);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/productDateInformation',
        });
        updateSessionAttributeSpy.mockRestore();
    });

    describe('sanitiseReqBody', () => {
        it('fills an error array if the user has not selected a SOP for each product', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    '^0000-product-TestProduct': '',
                },
            });
            const result = sanitiseReqBody(req, [{ productName: 'TestProduct' }]);
            expect(result.errors).toStrictEqual([
                {
                    errorMessage: 'Choose at least one sales offer package from the options',
                    id: 'product-TestProduct-checkbox-0',
                },
            ]);
            expect(result.sanitisedBody).toStrictEqual({});
        });
        it('returns an object with a string matching the SalesOfferPackage object structure', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    'product-TestProduct':
                        '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
                    'price-First product-Adult': '22',
                },
            });

            const result = sanitiseReqBody(req, [{ productName: 'TestProduct' }]);
            expect(result.errors.length).toBe(0);
            expect(result.sanitisedBody).toStrictEqual({
                TestProduct: [
                    {
                        id: 1,
                        name: 'Adult',
                        description: '',
                        purchaseLocations: ['mobileDevice'],
                        paymentMethods: ['mobilePhone'],
                        ticketFormats: ['paperTicket', 'smartCard'],
                    },
                ],
            });
            expect(result.sanitisedBody.TestProduct[0]).toEqual({
                id: 1,
                name: 'Adult',
                description: '',
                purchaseLocations: ['mobileDevice'],
                paymentMethods: ['mobilePhone'],
                ticketFormats: ['paperTicket', 'smartCard'],
            });
        });

        it('returns an object with a string matching the SalesOfferPackage object structure in edit mode', () => {
            const { req } = getMockRequestAndResponse({
                cookieValues: {},
                body: {
                    'product-TestProduct':
                        '{"id":1,"name":"Adult","description":"","purchaseLocations":["mobileDevice"],"paymentMethods":["mobilePhone"],"ticketFormats":["paperTicket","smartCard"]}',
                    'price-First product-Adult': '22',
                },
                uuid: {},
                session: {
                    [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                        productId: '2',
                        serviceId: '22D',
                        matchingJsonLink: 'test/path',
                    },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: undefined,
                },
                mockWriteHeadFn: writeHeadMock,
            });

            const result = sanitiseReqBody(req, [{ productName: 'TestProduct' }]);

            expect(result.errors.length).toBe(0);
            expect(result.sanitisedBody).toStrictEqual({
                TestProduct: [
                    {
                        id: 1,
                        name: 'Adult',
                        description: '',
                        purchaseLocations: ['mobileDevice'],
                        paymentMethods: ['mobilePhone'],
                        ticketFormats: ['paperTicket', 'smartCard'],
                    },
                ],
            });
            expect(result.sanitisedBody.TestProduct[0]).toEqual({
                id: 1,
                name: 'Adult',
                description: '',
                purchaseLocations: ['mobileDevice'],
                paymentMethods: ['mobilePhone'],
                ticketFormats: ['paperTicket', 'smartCard'],
            });
        });
    });
    describe('getProductsByValues', () => {
        it('returns an object with productName if the ticket is a point to point', () => {
            expect(getProductsByValues(expectedPointToPointPeriodTicket, undefined, '')).toEqual([
                {
                    productName: 'My product',
                    productPrice: '',
                },
            ]);
        });
        it('returns multipleProducts if multipleProducts is present', () => {
            expect(getProductsByValues(expectedFlatFareTicket as TicketWithIds, undefined, '')).toEqual([
                {
                    productName: 'Weekly Rider',
                    productPrice: '7',
                },
            ]);
        });
        it('returns an object with productName if it is present in the ticket', () => {
            expect(
                getProductsByValues(
                    expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
                    {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productNameId: '',
                                productPriceId: '',
                            },
                        ],
                    },
                    '',
                ),
            ).toEqual([
                {
                    productName: 'Weekly Ticket',
                    productPrice: '50',
                    productNameId: '',
                    productPriceId: '',
                },
            ]);
        });
        it('returns an object name with the default of products and empty productPrice if none of the conditions are met', () => {
            expect(getProductsByValues(expectedSingleTicket, undefined, '')).toEqual([
                {
                    productName: 'product',
                    productPrice: '',
                },
            ]);
        });
    });
});
