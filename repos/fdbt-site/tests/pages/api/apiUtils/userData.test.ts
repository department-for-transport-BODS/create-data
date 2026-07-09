import {
    UNASSIGNED_STOPS_ATTRIBUTE,
    UNASSIGNED_INBOUND_STOPS_ATTRIBUTE,
    DIRECTION_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
} from './../../../../src/constants/attributes';
import {
    CARNET_PRODUCT_DETAILS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    FARE_ZONE_ATTRIBUTE,
    FULL_TIME_RESTRICTIONS_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    POINT_TO_POINT_PRODUCT_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    TERM_TIME_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
} from '../../../../src/constants/attributes';
import * as auroradb from '../../../../src/data/auroradb';
import * as s3 from '../../../../src/data/s3';
import { MultipleProductAttribute, MultiProduct, Operator, TicketPeriodWithInput } from '../../../../src/interfaces';
import {
    adjustSchemeOperatorJson,
    getBaseTicketAttributes,
    getGeoZoneTicketJson,
    getMultipleServicesTicketJson,
    getPointToPointPeriodJson,
    getProductsAndSalesOfferPackages,
    getReturnTicketJson,
    getSchemeOperatorTicketJson,
    getSingleTicketJson,
    isTermTime,
} from '../../../../src/utils/apiUtils/userData';
import {
    expectedCarnetPeriodMultipleServicesTicketWithMultipleProducts,
    expectedCarnetReturnTicket,
    expectedCarnetSingleTicket,
    expectedCircularReturnTicket,
    expectedFlatFareGeoZoneTicket,
    expectedFlatFareTicket,
    expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
    expectedNonCircularReturnTicket,
    expectedPeriodGeoZoneTicketWithMultipleProducts,
    expectedPeriodMultipleServicesTicketWithMultipleProducts,
    expectedPointToPointPeriodTicket,
    expectedProductDetailsArray,
    expectedSchemeOperatorTicket,
    expectedSchemeOperatorTicketAfterGeoZoneAdjustment,
    expectedSingleTicket,
    getMockRequestAndResponse,
    mockFullTimeRestrictionAttribute,
    mockMatchingFaresZones,
    mockOutboundMatchingFaresZones,
    mockSchemOpIdToken,
    mockTimeRestriction,
    service,
    userFareStages,
    zoneStops,
    expectedSchemeOperatorMultiServicesTicket,
    expectedSchemeOperatorAfterFlatFareAdjustmentTicketWithNocInServices,
    expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
    expectedFlatFareGeoZoneTicketWithExemptions,
} from '../../../testData/mockData';
import { CarnetExpiryUnit, ExpiryUnit, PeriodExpiry, TicketType } from '../../../../src/interfaces/matchingJsonTypes';
import * as util from '../../../../src/utils/apiUtils';

jest.mock('../../../../src/utils/apiUtils');
jest.mock('../../../../src/data/s3');
jest.mock('../../../../src/data/auroradb');

beforeEach(() => {
    jest.spyOn(util, 'getNocFromIdToken').mockImplementationOnce(() => 'BLAC');
});

afterEach(() => {
    jest.resetAllMocks();
});

describe('userData', () => {
    describe('isTermTime', () => {
        it('should return true if term time is true', () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [TERM_TIME_ATTRIBUTE]: { termTime: true },
                },
            });
            expect(isTermTime(req)).toBeTruthy();
        });
        it('should return false if term time is false', () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [TERM_TIME_ATTRIBUTE]: { termTime: false },
                },
            });
            expect(isTermTime(req)).toBeFalsy();
        });
    });

    describe('getProductsAndSalesOfferPackages', () => {
        it('should return an array of ProductDetails objects', () => {
            const multipleProductAttribute: MultipleProductAttribute = {
                products: [
                    {
                        productName: 'Product',
                        productNameId: '',
                        productPrice: '2.99',
                        productPriceId: '',
                        productDuration: '1',
                        productDurationId: '',
                        productDurationUnits: ExpiryUnit.DAY,
                        productDurationUnitsId: '',
                    },
                    {
                        productName: 'Product Two',
                        productNameId: '',
                        productPrice: '7.99',
                        productPriceId: '',
                        productDuration: '7',
                        productDurationId: '',
                        productDurationUnits: ExpiryUnit.DAY,
                        productDurationUnitsId: '',
                    },
                ],
            };
            const productSops = [
                {
                    productName: 'Product',
                    salesOfferPackages: [
                        {
                            id: 1,
                            name: 'Onboard (cash)',
                            description: '',
                            purchaseLocations: ['onBoard'],
                            paymentMethods: ['cash'],
                            ticketFormats: ['paperTicket'],
                            isCapped: false,
                        },
                        {
                            id: 2,
                            name: 'Onboard (contactless)',
                            description: '',
                            purchaseLocations: ['onBoard'],
                            paymentMethods: ['contactlessPaymentCard'],
                            ticketFormats: ['paperTicket'],
                            isCapped: false,
                        },
                    ],
                },
                {
                    productName: 'Product Two',
                    salesOfferPackages: [
                        {
                            id: 2,
                            name: 'Onboard (contactless)',
                            description: '',
                            purchaseLocations: ['onBoard'],
                            paymentMethods: ['contactlessPaymentCard'],
                            ticketFormats: ['paperTicket'],
                            isCapped: false,
                        },
                    ],
                },
            ];
            const validity: PeriodExpiry = { productValidity: '24hr', productEndTime: '' };
            const result = getProductsAndSalesOfferPackages(productSops, multipleProductAttribute, validity);
            expect(result).toEqual(expectedProductDetailsArray);
        });
    });

    describe('getBaseTicketAttributes', () => {
        it('should replace the fareType attribute with the schoolFareType attribute for a schoolService', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                    [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                    } as TicketPeriodWithInput,
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [TERM_TIME_ATTRIBUTE]: { termTime: true },
                },
            });
            const result = getBaseTicketAttributes(req, res, 'period');
            expect(result.type).toEqual('period');
        });
    });

    describe('getSingleTicketJson', () => {
        it('should return a SingleTicket object', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'single' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2024-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [TERM_TIME_ATTRIBUTE]: { termTime: true },
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: undefined,
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'inbound',
                    },
                },
            });
            const result = getSingleTicketJson(req, res);
            expect(result).toEqual(expectedSingleTicket);
        });

        it('should correctly add carnet detail', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'single' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [TERM_TIME_ATTRIBUTE]: { termTime: true },
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: {
                        productName: 'Test Product',
                        carnetDetails: {
                            quantity: '5',
                            expiryTime: '10',
                            expiryUnit: CarnetExpiryUnit.DAY,
                        },
                    },
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'inbound',
                    },
                },
            });
            const result = getSingleTicketJson(req, res);
            expect(result).toEqual(expectedCarnetSingleTicket);
        });
    });

    describe('getReturnTicketJson', () => {
        it('should return a ReturnTicket object for a non circular return journey', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockOutboundMatchingFaresZones,
                    },
                    [INBOUND_MATCHING_ATTRIBUTE]: {
                        inboundUserFareStages: userFareStages,
                        inboundMatchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'return' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: undefined,
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [UNASSIGNED_INBOUND_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                },
            });
            const result = getReturnTicketJson(req, res);
            expect(result).toEqual(expectedNonCircularReturnTicket);
        });

        it('should return a ReturnTicket object for a circular journey', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'return' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: undefined,
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [UNASSIGNED_INBOUND_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                },
            });
            const result = getReturnTicketJson(req, res);
            expect(result).toEqual(expectedCircularReturnTicket);
        });

        it('should correctly add carnet detail', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockOutboundMatchingFaresZones,
                    },
                    [INBOUND_MATCHING_ATTRIBUTE]: {
                        inboundUserFareStages: userFareStages,
                        inboundMatchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'return' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: {
                        productName: 'Test Return Product',
                        carnetDetails: {
                            quantity: '10',
                            expiryTime: '',
                            expiryUnit: CarnetExpiryUnit.NO_EXPIRY,
                        },
                    },
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [UNASSIGNED_INBOUND_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                },
            });
            const result = getReturnTicketJson(req, res);
            expect(result).toEqual(expectedCarnetReturnTicket);
        });
    });

    describe('getPointToPointPeriodJson', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        it('creates appropriate matching JSON for a point to point period ticket', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MATCHING_ATTRIBUTE]: {
                        service,
                        userFareStages,
                        matchingFareZones: mockOutboundMatchingFaresZones,
                    },
                    [INBOUND_MATCHING_ATTRIBUTE]: {
                        inboundUserFareStages: userFareStages,
                        inboundMatchingFareZones: mockMatchingFaresZones,
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: undefined,
                    [POINT_TO_POINT_PRODUCT_ATTRIBUTE]: {
                        productName: 'My product',
                        productDuration: '7',
                        productDurationUnits: ExpiryUnit.WEEK,
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: {
                        productValidity: '24hr',
                        productEndTime: '',
                    },
                    [UNASSIGNED_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                    [UNASSIGNED_INBOUND_STOPS_ATTRIBUTE]: [
                        {
                            atcoCode: 'GHI',
                        },
                    ],
                },
            });
            const result = getPointToPointPeriodJson(req, res);
            expect(result).toEqual(expectedPointToPointPeriodTicket);
        });
    });

    describe('getGeoZoneTicketJson', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        const mockMultiOpSelectedOperators: Operator[] = [
            {
                nocCode: 'MCTR',
                name: 'Manchester Community Transport',
            },
            {
                nocCode: 'WBTR',
                name: "Warrington's Own Buses",
            },
            {
                nocCode: 'BLAC',
                name: 'Blackpool Transport',
            },
        ];

        const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];
        let batchGetStopsByAtcoCodeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));

            batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
        });

        it.each([
            ['period', expectedPeriodGeoZoneTicketWithMultipleProducts],
            ['multiOperator', expectedMultiOperatorGeoZoneTicketWithMultipleProducts],
        ])('should return a %s geoZoneTicket object', async (fareType, expectedJson) => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                session: {
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: fareType as TicketType },
                    [FARE_ZONE_ATTRIBUTE]: 'Green Lane Shops',
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.WEEK,
                                carnetDetails: undefined,
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Day Ticket',
                                productPrice: '2.50',
                                productDuration: '1',
                                productDurationUnits: ExpiryUnit.YEAR,
                                carnetDetails: undefined,
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: ExpiryUnit.MONTH,
                                carnetDetails: undefined,
                                productPriceId: '',
                                productNameId: '',
                            },
                        ],
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: {
                        productValidity: '24hr',
                        productEndTime: '',
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    ...(fareType === 'multiOperator' && {
                        [MULTIPLE_OPERATOR_ATTRIBUTE]: { selectedOperators: mockMultiOpSelectedOperators, id: 1 },
                    }),
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                },
            });
            batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve(zoneStops));
            const result = await getGeoZoneTicketJson(req, res);
            expect(result).toStrictEqual(expectedJson);
        });
    });

    describe('getPeriodMulipleServicesTicketJson', () => {
        it('should return a PeriodMultipleServicesTicket object', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                session: {
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServices' },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.WEEK,
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Day Ticket',
                                productPrice: '2.50',
                                productDuration: '1',
                                productDurationUnits: ExpiryUnit.YEAR,
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: ExpiryUnit.MONTH,
                                productPriceId: '',
                                productNameId: '',
                            },
                        ],
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: {
                        productValidity: 'endOfCalendarDay',
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                },
            });
            const result = getMultipleServicesTicketJson(req, res);
            expect(result).toEqual(expectedPeriodMultipleServicesTicketWithMultipleProducts);
        });

        it('should return a carnet PeriodMultipleServicesTicket object if the products are carnet', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                session: {
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServices' },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.WEEK,
                                productValidity: '24hr',
                                carnetDetails: {
                                    quantity: '10',
                                    expiryTime: '15',
                                    expiryUnit: CarnetExpiryUnit.WEEK,
                                },
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Day Ticket',
                                productPrice: '2.50',
                                productDuration: '1',
                                productDurationUnits: ExpiryUnit.YEAR,
                                productValidity: '24hr',
                                carnetDetails: {
                                    quantity: '15',
                                    expiryTime: '10',
                                    expiryUnit: CarnetExpiryUnit.MONTH,
                                },
                                productPriceId: '',
                                productNameId: '',
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: ExpiryUnit.MONTH,
                                productValidity: 'endOfCalendarDay',
                                carnetDetails: {
                                    quantity: '30',
                                    expiryTime: '10',
                                    expiryUnit: CarnetExpiryUnit.YEAR,
                                },
                                productPriceId: '',
                                productNameId: '',
                            },
                        ],
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [PERIOD_EXPIRY_ATTRIBUTE]: {
                        productValidity: 'endOfCalendarDay',
                    },
                },
            });
            const result = getMultipleServicesTicketJson(req, res);
            expect(result).toEqual(expectedCarnetPeriodMultipleServicesTicketWithMultipleProducts);
        });

        it('should return a MultiOperatorMultipleServicesTicket object if the ticket is multipleOperators', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                session: {
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'multiOperator' },
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServices' },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.WEEK,
                            },
                            {
                                productName: 'Day Ticket',
                                productPrice: '2.50',
                                productDuration: '1',
                                productDurationUnits: 'year',
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: ExpiryUnit.MONTH,
                            },
                        ] as MultiProduct[],
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: { productValidity: 'fareDayEnd', productEndTime: '1900' },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE]: [
                        {
                            nocCode: 'WBTR',
                            selectedServices: [
                                {
                                    lineName: '343',
                                    lineId: '3h3vsergesrhg',
                                    serviceCode: '11-444-_-y08-1',
                                    serviceDescription: 'Test Under Lyne - Glossop',
                                    startDate: '07/04/2020',
                                },
                                {
                                    lineName: '444',
                                    lineId: '3h3vtrhtherhed',
                                    serviceCode: 'NW_01_MCT_391_1',
                                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                                    startDate: '23/04/2019',
                                },
                                {
                                    lineName: '543',
                                    lineId: '3h3vb32ik',
                                    serviceCode: 'NW_04_MCTR_232_1',
                                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                                    startDate: '06/04/2020',
                                },
                            ],
                        },
                        {
                            nocCode: 'BLAC',
                            selectedServices: [
                                {
                                    lineName: '100',
                                    lineId: '3h3rthsrty56y5',
                                    serviceCode: '11-444-_-y08-1',
                                    serviceDescription: 'Test Under Lyne - Glossop',
                                    startDate: '07/04/2020',
                                },
                                {
                                    lineName: '101',
                                    lineId: '3h34t43deefsf',
                                    serviceCode: 'NW_01_MCT_391_1',
                                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                                    startDate: '23/04/2019',
                                },
                                {
                                    lineName: '102',
                                    lineId: '34tvwevdsvb32ik',
                                    serviceCode: 'NW_04_MCTR_232_1',
                                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                                    startDate: '06/04/2020',
                                },
                            ],
                        },
                        {
                            nocCode: 'LEDS',
                            selectedServices: [
                                {
                                    lineName: '63',
                                    lineId: '45t34gvfdx2ik',
                                    serviceCode: '11-444-_-y08-1',
                                    serviceDescription: 'Test Under Lyne - Glossop',
                                    startDate: '07/04/2020',
                                },
                                {
                                    lineName: '64',
                                    lineId: 'q45g4rgergik',
                                    serviceCode: 'NW_01_MCT_391_1',
                                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                                    startDate: '23/04/2019',
                                },
                                {
                                    lineName: '65',
                                    lineId: 'q34ttfwerfsxfc',
                                    serviceCode: 'NW_04_MCTR_232_1',
                                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                                    startDate: '06/04/2020',
                                },
                            ],
                        },
                    ],
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: mockFullTimeRestrictionAttribute,
                    [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                        selectedOperators: [{ name: 'Blackpool Transport', nocCode: 'BLAC' }],
                        id: 1,
                    },
                },
            });
            const result = getMultipleServicesTicketJson(req, res);
            expect(result).toStrictEqual(expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators);
        });
    });

    describe('Flat fares', () => {
        it('should return a FlatFareTicket object for multiple services', () => {
            const { req, res } = getMockRequestAndResponse({
                session: {
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Rider',
                                productPrice: '7',
                            },
                        ] as MultiProduct[],
                    },
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'flatFare' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Rider',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                },
            });
            const result = getMultipleServicesTicketJson(req, res);
            expect(result).toEqual(expectedFlatFareTicket);
        });

        it('should return a FlatFareTicket object for geo zone', async () => {
            const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];

            jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));
            jest.spyOn(auroradb, 'batchGetStopsByAtcoCode').mockImplementation(() => Promise.resolve(zoneStops));

            const { req, res } = getMockRequestAndResponse({
                session: {
                    [SERVICE_LIST_ATTRIBUTE]: undefined,
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Flat fare with geo zone',
                                productPrice: '7',
                            },
                        ] as MultiProduct[],
                    },
                    [FARE_ZONE_ATTRIBUTE]: 'my flat fare zone',
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'flatFare' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Flat fare with geo zone',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 3,
                                    name: 'Online (smart card)',
                                    description: '',
                                    purchaseLocations: ['online'],
                                    paymentMethods: ['directDebit', 'creditCard', 'debitCard'],
                                    ticketFormats: ['smartCard'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                },
            });
            const result = await getGeoZoneTicketJson(req, res);
            expect(result).toEqual(expectedFlatFareGeoZoneTicket);
        });

        it('should return a FlatFareTicket object for geo zone with exemptions', async () => {
            const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];

            jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));
            jest.spyOn(auroradb, 'batchGetStopsByAtcoCode').mockImplementation(() => Promise.resolve(zoneStops));

            const { req, res } = getMockRequestAndResponse({
                session: {
                    [SERVICE_LIST_ATTRIBUTE]: undefined,
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Flat fare with geo zone',
                                productPrice: '7',
                            },
                        ] as MultiProduct[],
                    },
                    [FARE_ZONE_ATTRIBUTE]: 'my flat fare zone',
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'flatFare' },
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Flat fare with geo zone',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 3,
                                    name: 'Online (smart card)',
                                    description: '',
                                    purchaseLocations: ['online'],
                                    paymentMethods: ['directDebit', 'creditCard', 'debitCard'],
                                    ticketFormats: ['smartCard'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [SERVICE_LIST_EXEMPTION_ATTRIBUTE]: {
                        selectedServices: [
                            {
                                lineName: '100',
                                lineId: '3h3rthsrty56y5',
                                serviceCode: '11-444-_-y08-1',
                                serviceDescription: 'Test Under Lyne - Glossop',
                                startDate: '07/04/2020',
                            },
                            {
                                lineName: '101',
                                lineId: '3h34t43deefsf',
                                serviceCode: 'NW_01_MCT_391_1',
                                serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                                startDate: '23/04/2019',
                            },
                            {
                                lineName: '102',
                                lineId: '34tvwevdsvb32ik',
                                serviceCode: 'NW_04_MCTR_232_1',
                                serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                                startDate: '06/04/2020',
                            },
                        ],
                    },
                },
            });
            const result = await getGeoZoneTicketJson(req, res);
            expect(result).toEqual(expectedFlatFareGeoZoneTicketWithExemptions);
        });
    });

    describe('getSchemeOperatorTicketJson', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        const mockMultiOpSelectedOperators: Operator[] = [
            {
                nocCode: 'MCTR',
                name: 'Manchester Community Transport',
            },
            {
                nocCode: 'WBTR',
                name: "Warrington's Own Buses",
            },
            {
                nocCode: 'BLAC',
                name: 'Blackpool Transport',
            },
        ];

        const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];
        let batchGetStopsByAtcoCodeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));

            batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
        });

        it('should return a SchemeOperatorTicket object', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: {
                        name: 'SCHEME_OPERATOR',
                        region: 'SCHEME_REGION',
                        nocCode: 'TESTSCHEME',
                        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'multiOperator' },
                    [FARE_ZONE_ATTRIBUTE]: 'Green Lane Shops',
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
                                productDurationUnits: ExpiryUnit.MONTH,
                                productValidity: '24hr',
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: 'year',
                                productValidity: 'endOfCalendarDay',
                            },
                        ] as MultiProduct[],
                    },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [MULTIPLE_OPERATOR_ATTRIBUTE]: { selectedOperators: mockMultiOpSelectedOperators },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: {
                        fullTimeRestrictions: [
                            {
                                day: 'monday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '',
                                    },
                                ],
                            },
                            {
                                day: 'tuesday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '1800',
                                    },
                                ],
                            },
                            {
                                day: 'bankHoliday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '1750',
                                    },
                                ],
                            },
                            {
                                day: 'friday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '',
                                    },
                                ],
                            },
                        ],
                        errors: [],
                        id: 2,
                    },
                },
            });
            batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve(zoneStops));
            const result = getSchemeOperatorTicketJson(req, res);
            expect(result).toEqual(expectedSchemeOperatorTicket('multiOperator'));
        });
    });

    describe('adjustSchemeOperatorTicketJson', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        const mockMultiOpSelectedOperators: Operator[] = [
            {
                nocCode: 'MCTR',
                name: 'Manchester Community Transport',
            },
            {
                nocCode: 'WBTR',
                name: "Warrington's Own Buses",
            },
            {
                nocCode: 'BLAC',
                name: 'Blackpool Transport',
            },
        ];

        const atcoCodes: string[] = ['13003305E', '13003622B', '13003655B'];
        let batchGetStopsByAtcoCodeSpy: jest.SpyInstance;

        beforeEach(() => {
            jest.spyOn(s3, 'getCsvZoneUploadData').mockImplementation(() => Promise.resolve(atcoCodes));

            batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
        });

        it('should adjust SchemeOperatorTicket json for a period geozone ticket', async () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: {
                        name: 'SCHEME_OPERATOR',
                        region: 'SCHEME_REGION',
                        nocCode: 'TESTSCHEME',
                        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [FARE_ZONE_ATTRIBUTE]: 'Green Lane Shops',
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'Weekly Ticket',
                                productPrice: '50',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.WEEK,
                            },
                            {
                                productName: 'Day Ticket',
                                productPrice: '2.50',
                                productDuration: '1',
                                productDurationUnits: ExpiryUnit.MONTH,
                            },
                            {
                                productName: 'Monthly Ticket',
                                productPrice: '200',
                                productDuration: '28',
                                productDurationUnits: 'year',
                            },
                        ] as MultiProduct[],
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: { productValidity: 'fareDayEnd', productEndTime: '1900' },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'Weekly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Day Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'Monthly Ticket',
                            salesOfferPackages: [
                                {
                                    id: 1,
                                    name: 'Onboard (cash)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    id: 2,
                                    name: 'Onboard (contactless)',
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [MULTIPLE_OPERATOR_ATTRIBUTE]: { selectedOperators: mockMultiOpSelectedOperators },
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'geoZone' },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: {
                        fullTimeRestrictions: [
                            {
                                day: 'monday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '',
                                    },
                                ],
                            },
                            {
                                day: 'tuesday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '1800',
                                    },
                                ],
                            },
                            {
                                day: 'bankHoliday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '1750',
                                    },
                                ],
                            },
                            {
                                day: 'friday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '',
                                    },
                                ],
                            },
                        ],
                        errors: [],
                    },
                },
            });
            batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve(zoneStops));
            const result = await adjustSchemeOperatorJson(req, res, expectedSchemeOperatorTicket('period'));
            expect(result).toEqual(expectedSchemeOperatorTicketAfterGeoZoneAdjustment);
        });
        const mockMultiOperatorServices = [
            {
                nocCode: 'WBTR',
                selectedServices: [
                    {
                        lineName: '343',
                        lineId: '3h3vsergesrhg',
                        serviceCode: '11-444-_-y08-1',
                        serviceDescription: 'Test Under Lyne - Glossop',
                        startDate: '07/04/2020',
                    },
                    {
                        lineName: '444',
                        lineId: '3h3vtrhtherhed',
                        serviceCode: 'NW_01_MCT_391_1',
                        serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                        startDate: '23/04/2019',
                    },
                    {
                        lineName: '543',
                        lineId: '3h3vb32ik',
                        serviceCode: 'NW_04_MCTR_232_1',
                        serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                        startDate: '06/04/2020',
                    },
                ],
            },
            {
                nocCode: 'BLAC',
                selectedServices: [
                    {
                        lineName: '100',
                        lineId: '3h3rthsrty56y5',
                        serviceCode: '11-444-_-y08-1',
                        serviceDescription: 'Test Under Lyne - Glossop',
                        startDate: '07/04/2020',
                    },
                    {
                        lineName: '101',
                        lineId: '3h34t43deefsf',
                        serviceCode: 'NW_01_MCT_391_1',
                        serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                        startDate: '23/04/2019',
                    },
                    {
                        lineName: '102',
                        lineId: '34tvwevdsvb32ik',
                        serviceCode: 'NW_04_MCTR_232_1',
                        serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                        startDate: '06/04/2020',
                    },
                ],
            },
            {
                nocCode: 'LEDS',
                selectedServices: [
                    {
                        lineName: '63',
                        lineId: '45t34gvfdx2ik',
                        serviceCode: '11-444-_-y08-1',
                        serviceDescription: 'Test Under Lyne - Glossop',
                        startDate: '07/04/2020',
                    },
                    {
                        lineName: '64',
                        lineId: 'q45g4rgergik',
                        serviceCode: 'NW_01_MCT_391_1',
                        serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                        startDate: '23/04/2019',
                    },
                    {
                        lineName: '65',
                        lineId: 'q34ttfwerfsxfc',
                        serviceCode: 'NW_04_MCTR_232_1',
                        serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                        startDate: '06/04/2020',
                    },
                ],
            },
        ];
        it('should adjust SchemeOperatorTicket json for a flat fare ticket', async () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: {
                        name: 'SCHEME_OPERATOR',
                        region: 'SCHEME_REGION',
                        nocCode: 'TESTSCHEME',
                        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'flatFare' },
                    [FARE_ZONE_ATTRIBUTE]: 'Green Lane Shops',
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'product one',
                            salesOfferPackages: [
                                {
                                    name: 'Onboard (cash)',
                                    id: 1,
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'product two',
                            salesOfferPackages: [
                                {
                                    name: 'Onboard (contactless)',
                                    id: 2,
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    isCapped: false,
                                },
                                {
                                    name: 'Online (smart card)',
                                    id: 3,
                                    description: '',
                                    purchaseLocations: ['online'],
                                    paymentMethods: ['directDebit', 'creditCard', 'debitCard'],
                                    ticketFormats: ['smartCard'],
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [MULTIPLE_OPERATOR_ATTRIBUTE]: { selectedOperators: mockMultiOpSelectedOperators },
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: {
                        fullTimeRestrictions: [
                            {
                                day: 'monday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '',
                                    },
                                ],
                            },
                            {
                                day: 'tuesday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '1800',
                                    },
                                ],
                            },
                            {
                                day: 'bankHoliday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '1750',
                                    },
                                ],
                            },
                            {
                                day: 'friday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '',
                                    },
                                ],
                            },
                        ],
                        errors: [],
                        id: 2,
                    },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'product one',
                                productPrice: '50',
                            },
                            {
                                productName: 'product two',
                                productPrice: '502',
                            },
                        ] as MultiProduct[],
                    },
                    [MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE]: mockMultiOperatorServices,
                },
            });
            const result = await adjustSchemeOperatorJson(req, res, expectedSchemeOperatorTicket('flatFare'));
            expect(result).toEqual(expectedSchemeOperatorAfterFlatFareAdjustmentTicketWithNocInServices);
        });
        it('should adjust SchemeOperatorTicket json for a multi service ticket', async () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: {
                        name: 'SCHEME_OPERATOR',
                        region: 'SCHEME_REGION',
                        nocCode: 'TESTSCHEME',
                        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
                    },
                    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: mockTimeRestriction,
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
                        {
                            productName: 'product one',
                            salesOfferPackages: [
                                {
                                    name: 'Onboard (cash)',
                                    id: 1,
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['cash'],
                                    ticketFormats: ['paperTicket'],
                                    price: '4.99',
                                    isCapped: false,
                                },
                            ],
                        },
                        {
                            productName: 'product two',
                            salesOfferPackages: [
                                {
                                    name: 'Onboard (contactless)',
                                    id: 2,
                                    description: '',
                                    purchaseLocations: ['onBoard'],
                                    paymentMethods: ['contactlessPaymentCard'],
                                    ticketFormats: ['paperTicket'],
                                    price: '5.99',
                                    isCapped: false,
                                },
                                {
                                    name: 'Online (smart card)',
                                    id: 3,
                                    description: '',
                                    purchaseLocations: ['online'],
                                    paymentMethods: ['directDebit', 'creditCard', 'debitCard'],
                                    ticketFormats: ['smartCard'],
                                    price: '6.99',
                                    isCapped: false,
                                },
                            ],
                        },
                    ],
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: '2020-12-17T09:30:46.0Z',
                        endDate: '2020-12-18T09:30:46.0Z',
                        dateInput: {
                            startDateDay: '17',
                            startDateMonth: '12',
                            startDateYear: '2020',
                            endDateDay: '18',
                            endDateMonth: '12',
                            endDateYear: '2020',
                        },
                    },
                    [MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE]: mockMultiOperatorServices,
                    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: {
                        fullTimeRestrictions: [
                            {
                                day: 'monday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '',
                                    },
                                ],
                            },
                            {
                                day: 'tuesday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '1800',
                                    },
                                ],
                            },
                            {
                                day: 'bankHoliday',
                                timeBands: [
                                    {
                                        startTime: '0900',
                                        endTime: '1750',
                                    },
                                ],
                            },
                            {
                                day: 'friday',
                                timeBands: [
                                    {
                                        startTime: '',
                                        endTime: '',
                                    },
                                ],
                            },
                        ],
                        errors: [],
                    },
                    [MULTIPLE_PRODUCT_ATTRIBUTE]: {
                        products: [
                            {
                                productName: 'product one',
                                productPrice: '5.00',
                                productDuration: '2',
                                productDurationUnits: ExpiryUnit.WEEK,
                            },
                            {
                                productName: 'product two',
                                productPrice: '5.02',
                                productDuration: '5',
                                productDurationUnits: ExpiryUnit.DAY,
                            },
                        ] as MultiProduct[],
                    },
                    [PERIOD_EXPIRY_ATTRIBUTE]: {
                        productValidity: '24hr',
                        productEndTime: '',
                    },
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServices' },
                },
            });
            const result = await adjustSchemeOperatorJson(req, res, expectedSchemeOperatorTicket('period'));
            expect(result).toEqual(expectedSchemeOperatorMultiServicesTicket);
        });
    });
});
