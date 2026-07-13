/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { mockRequest, MockRes } from './mockHttp';
import { RawService } from '../../src/interfaces/dbTypes';
import {
    WithIds,
    PeriodGeoZoneTicket,
    PeriodMultipleServicesTicket,
    FlatFareGeoZoneTicket,
    WithBaseIds,
    BaseSchemeOperatorTicket,
    CarnetExpiryUnit,
    ExpiryUnit,
    FullTimeRestriction,
    MultiOperatorGeoZoneTicket,
    PointToPointPeriodTicket,
    ReturnTicket,
    SalesOfferPackage,
    SchemeOperatorFlatFareTicket,
    SchemeOperatorGeoZoneTicket,
    SingleTicket,
    Stop,
} from '../../src/interfaces/matchingJsonTypes';
import { COOKIES_POLICY_COOKIE, ID_TOKEN_COOKIE } from '../../src/constants';
import {
    DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    DURATION_VALID_ATTRIBUTE,
    FARE_STAGES_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    INPUT_METHOD_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    STAGE_NAMES_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../src/constants/attributes';
import {
    BasicService,
    ErrorInfo,
    FullTimeRestrictionAttribute,
    MultiProduct,
    MultiProductWithErrors,
    NextPageContextWithSession,
    RadioConditionalInputFieldset,
    RadioWithConditionalInputs,
    ServiceDB,
    TimeRestriction,
    UserFareStages,
    OperatorGroup,
    ProductToDisplay,
    ServiceToDisplay,
    MultiOperatorMultipleServicesTicket,
} from '../../src/interfaces';

import { MatchingFareZones } from '../../src/interfaces/matchingInterface';
import { SessionAttributeTypes } from '../../src/utils/sessions';
import { MultiOperatorProductExternal } from '../../src/pages/products/multiOperatorProductsExternal';

interface GetMockContextInput {
    session?: { [key: string]: any };
    cookies?: any;
    body?: any;
    url?: any;
    uuid?: any;
    mockWriteHeadFn?: jest.Mock<any, any>;
    mockEndFn?: jest.Mock<any, any>;
    isLoggedin?: boolean;
    query?: any;
    requestHeaders?: any;
}

interface GetMockRequestAndResponse {
    session?: Partial<SessionAttributeTypes>;
    cookieValues?: any;
    body?: any;
    uuid?: any;
    mockWriteHeadFn?: jest.Mock<any, any>;
    mockEndFn?: jest.Mock<any, any>;
    requestHeaders?: any;
    isLoggedin?: boolean;
    url?: any;
    query?: any;
}

export const getMockRequestAndResponse = ({
    cookieValues = {},
    body = null,
    uuid = {},
    mockWriteHeadFn = jest.fn(),
    mockEndFn = jest.fn(),
    requestHeaders = {},
    isLoggedin = true,
    url = null,
    session,
    query = null,
}: GetMockRequestAndResponse = {}): { req: any; res: any } => {
    const res = new MockRes();
    res.writeHead = mockWriteHeadFn;
    res.end = mockEndFn;
    const defaultUuid = '1e0459b3-082e-4e70-89db-96e8ae173e10';

    const {
        idToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjdXN0b206bm9jIjoiVEVTVCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImp0aSI6Ijg1MmQ1MTVlLTU5YWUtNDllZi1iMTA5LTI4YTRhNzk3YWFkNSIsImlhdCI6MTU5Mjk4NzMwNywiZXhwIjoxNTkyOTkwOTA3fQ.DFdxnpdhykDONOMeZMNeMUFpCHZ-hQ3UXczq_Qh0IAI',
        cookiePolicy = null,
    } = cookieValues;

    const { operatorUuid = defaultUuid } = uuid;

    const defaultSession = {
        [OPERATOR_ATTRIBUTE]: { name: 'test', nocCode: 'TEST', uuid: operatorUuid },
        [FARE_TYPE_ATTRIBUTE]: { fareType: 'single' },
        [SERVICE_ATTRIBUTE]: { service: 'X01#NW_05_BLAC_12A_1' },
        [INPUT_METHOD_ATTRIBUTE]: { inputMethod: 'csv' },
        [PASSENGER_TYPE_ATTRIBUTE]: { passengerType: 'Adult', id: 9 },
        [DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: { passengerType: 'Adult' },
        [DURATION_VALID_ATTRIBUTE]: { amount: '2', duration: 'day', errors: [] },
        [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'geoZone' },
        [FARE_STAGES_ATTRIBUTE]: { fareStages: '6' },
        [STAGE_NAMES_ATTRIBUTE]: ['Stage name one', 'Stage name two', 'Stage name three'],
        [SERVICE_LIST_ATTRIBUTE]: {
            selectedServices: [
                {
                    lineId: '3h3vb32ik',
                    lineName: '12A',
                    serviceCode: 'NW_05_BLAC_12A_1',
                    serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
                    startDate: '13/05/2020',
                },
                {
                    lineName: '6',
                    lineId: '3h3vb32ik',
                    serviceCode: 'NW_05_BLAC_6_1',
                    serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
                    startDate: '08/05/2020',
                },
                {
                    lineId: '3h3vb32ik',
                    lineName: '101',
                    serviceCode: 'NW_05_BLAC_101_1',
                    serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
                    startDate: '06/05/2020',
                },
            ],
        },
        [NUMBER_OF_PRODUCTS_ATTRIBUTE]: {
            numberOfProductsInput: '3',
        },
        [MULTIPLE_PRODUCT_ATTRIBUTE]: {
            products: [
                {
                    productName: 'Weekly Ticket',
                    productNameId: 'multiple-product-name-1',
                    productPrice: '50',
                    productPriceId: 'multiple-product-price-1',
                    productDuration: '5',
                    productDurationId: 'product-details-period-duration-quantity-1',
                    productValidity: '24hr',
                    productDurationUnits: ExpiryUnit.WEEK,
                },
                {
                    productName: 'Day Ticket',
                    productNameId: 'multiple-product-name-2',
                    productPrice: '2.50',
                    productPriceId: 'multiple-product-price-2',
                    productDuration: '1',
                    productDurationId: 'product-details-period-duration-quantity-2',
                    productValidity: '24hr',
                    productDurationUnits: ExpiryUnit.WEEK,
                },
                {
                    productName: 'Monthly Ticket',
                    productNameId: 'multiple-product-name-3',
                    productPrice: '200',
                    productPriceId: 'multiple-product-price-3',
                    productDuration: '28',
                    productDurationId: 'product-details-period-duration-quantity-3',
                    productValidity: '24hr',
                    productDurationUnits: ExpiryUnit.WEEK,
                },
            ],
        },
        [SALES_OFFER_PACKAGES_ATTRIBUTE]: [
            {
                id: 1,
                name: 'Onboard (cash)',
                description: '',
                purchaseLocations: ['onBoard'],
                paymentMethods: ['cash'],
                ticketFormats: ['paperTicket'],
            },
            {
                id: 2,
                name: 'Onboard (contactless)',
                description: '',
                purchaseLocations: ['onBoard'],
                paymentMethods: ['contactlessPaymentCard'],
                ticketFormats: ['paperTicket'],
            },
        ],
        destroy: (): void => {},
        ...session,
    };

    let cookieString = '';

    cookieString += isLoggedin ? `${ID_TOKEN_COOKIE}=${idToken};` : '';

    cookieString += cookiePolicy ? `${COOKIES_POLICY_COOKIE}=${encodeURI(JSON.stringify(cookiePolicy))}` : '';

    const req = mockRequest({
        connection: {
            encrypted: true,
        },
        url,
        headers: {
            host: 'localhost:5000',
            cookie: cookieString,
            origin: 'localhost:5000',
            ...requestHeaders,
        },
        cookies: cookieValues,
        session: { ...defaultSession },
    });

    if (body) {
        req.body = body;
    }
    if (query) {
        req.query = query;
    }

    return { req, res };
};

export const getMockContext = ({
    session,
    cookies = {},
    body = null,
    uuid = {},
    mockWriteHeadFn = jest.fn(),
    mockEndFn = jest.fn(),
    isLoggedin = true,
    url = null,
    query = '',
    requestHeaders = {},
}: GetMockContextInput = {}): NextPageContextWithSession => {
    const { req, res } = getMockRequestAndResponse({
        session,
        cookieValues: cookies,
        body,
        uuid,
        mockWriteHeadFn,
        mockEndFn,
        requestHeaders,
        isLoggedin,
        url,
    });

    const ctx: NextPageContextWithSession = {
        res,
        req,
        pathname: '',
        query,

        AppTree: () => React.createElement('div'),
    };

    return ctx;
};

export const mockSchemOpIdToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJjdXN0b206c2NoZW1lT3BlcmF0b3IiOiJTQ0hFTUVfT1BFUkFUT1IiLCJjdXN0b206c2NoZW1lUmVnaW9uQ29kZSI6IlNDSEVNRV9SRUdJT04iLCJjdXN0b206bm9jIjoiVEVTVFNDSEVNRSJ9.jaTbkwPmrf00_MnH1WMJmFfKWVjwr4U64N_HWy2Lojs';

// 'TEST|HELLO' for the NOC code
export const mockIdTokenMultiple =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJjdXN0b206c2NoZW1lT3BlcmF0b3IiOiJTQ0hFTUVfT1BFUkFUT1IiLCJjdXN0b206c2NoZW1lUmVnaW9uQ29kZSI6IlNDSEVNRV9SRUdJT04iLCJjdXN0b206bm9jIjoiVEVTVHxIRUxMTyJ9.O-E8cNzF8X0DVoUnKVKsg0ZSx88Yc3peOIpha7-BOWc';

export const mockMatchingFaresZones: MatchingFareZones = {
    'Acomb Green Lane': {
        name: 'Acomb Green Lane',
        stops: [
            {
                stopName: 'Yoden Way - Chapel Hill Road',
                naptanCode: 'duratdmj',
                atcoCode: '13003521G',
                localityCode: 'E0045956',
                parentLocalityName: '',
                localityName: 'Peterlee',
                indicator: 'W-bound',
                street: 'Yodan Way',
            },
        ],
        prices: [
            {
                price: '1.10',
                fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'],
            },
            {
                price: '1.70',
                fareZones: ['Cambridge Street (York)', 'Blossom Street', 'Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
    'Mattison Way': {
        name: 'Mattison Way',
        stops: [
            {
                stopName: 'Yoden Way',
                naptanCode: 'duratdmt',
                atcoCode: '13003522F',
                localityCode: 'E0010183',
                parentLocalityName: '',
                localityName: 'Horden',
                indicator: 'SW-bound',
                street: 'Yoden Way',
            },
        ],
        prices: [
            {
                price: '1.10',
                fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'],
            },
            {
                price: '1.70',
                fareZones: ['Cambridge Street (York)', 'Blossom Street', 'Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
    'Holl Bank/Beech Ave': {
        name: 'Holl Bank/Beech Ave',
        stops: [
            {
                stopName: 'Surtees Rd-Edenhill Rd',
                naptanCode: 'durapgdw',
                atcoCode: '13003219H',
                localityCode: 'E0045956',
                parentLocalityName: '',
                localityName: 'Peterlee',
                indicator: 'NW-bound',
                street: 'Surtees Road',
            },
        ],
        prices: [
            {
                price: '1.10',
                fareZones: ['Cambridge Street (York)', 'Blossom Street'],
            },
            {
                price: '1.70',
                fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
    'Blossom Street': {
        name: 'Blossom Street',
        stops: [
            {
                stopName: 'Bus Station',
                naptanCode: 'duratdma',
                atcoCode: '13003519H',
                localityCode: 'E0045956',
                parentLocalityName: '',
                localityName: 'Peterlee',
                indicator: 'H',
                street: 'Bede Way',
            },
        ],
        prices: [
            {
                price: '1.00',
                fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
    'Piccadilly (York)': {
        name: 'Piccadilly (York)',
        stops: [
            {
                stopName: 'Kell Road',
                naptanCode: 'duraptwp',
                atcoCode: '13003345D',
                localityCode: 'E0010183',
                parentLocalityName: '',
                localityName: 'Horden',
                indicator: 'SE-bound',
                street: 'Kell Road',
            },
        ],
        prices: [],
    },
};

export const mockOutboundMatchingFaresZones: MatchingFareZones = {
    'Acomb Green Lane': {
        name: 'Acomb Green Lane',
        stops: [
            {
                stopName: 'Yoden Way - Chapel Hill Road',
                naptanCode: 'duratdmj',
                atcoCode: '13003521G',
                localityCode: 'E0045956',
                parentLocalityName: '',
                localityName: 'Peterlee',
                indicator: 'W-bound',
                street: 'Yodan Way',
            },
        ],
        prices: [
            {
                price: '1.10',
                fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'],
            },
            {
                price: '1.70',
                fareZones: ['Cambridge Street (York)', 'Blossom Street', 'Rail Station (York)', 'Piccadilly (York)'],
            },
        ],
    },
};

export const mockRawService: RawService = {
    serviceDescription: '\n\t\t\t\tInterchange Stand B,Seaham - Estate (Hail and Ride) N/B,Westlea\n\t\t\t',
    operatorShortName: 'HCTY',
    lineName: '17',
    startDate: '2021-10-11T13:40:49+00:00',
    inboundDirectionDescription: 'this way',
    outboundDirectionDescription: 'another way',
    journeyPatterns: [
        {
            direction: 'outbound',
            orderedStopPoints: [
                {
                    stopPointRef: '13003921A',
                    commonName: 'Estate (Hail and Ride) N/B',
                },
                {
                    stopPointRef: '13003305E',
                    commonName: 'Westlea shops S/B',
                },
                {
                    stopPointRef: '13003306B',
                    commonName: 'Mount Pleasant NE/B',
                },
                {
                    stopPointRef: '13003618B',
                    commonName: 'The Avenue/Essex Crescent NE/B',
                },
                {
                    stopPointRef: '13003622B',
                    commonName: 'The Avenue Shops NE/B',
                },
                {
                    stopPointRef: '13003923B',
                    commonName: 'Kingston Avenue Hail and Ride NE/B',
                },
                {
                    stopPointRef: '13003939H',
                    commonName: 'Laurel Avenue NW/B',
                },
                { stopPointRef: '13003625C', commonName: 'Park E/B' },
                {
                    stopPointRef: '13003612D',
                    commonName: 'New Strangford Road SE/B',
                },
                {
                    stopPointRef: '13003611B',
                    commonName: 'New Tempest Road (York House) NE/B',
                },
                {
                    stopPointRef: '13003609E',
                    commonName: 'Vane Terrace/Castlereagh S/B',
                },
                {
                    stopPointRef: '13003661E',
                    commonName: 'Sophia Street S/B',
                },
                {
                    stopPointRef: '13003949C',
                    commonName: 'Viceroy Street E/B',
                },
                {
                    stopPointRef: '13003635B',
                    commonName: 'Adolphus Place NE/B',
                },
                {
                    stopPointRef: '13003655B',
                    commonName: 'Interchange Stand B',
                },
            ],
        },
        {
            direction: 'inbound',
            orderedStopPoints: [
                {
                    stopPointRef: '13003655B',
                    commonName: 'Interchange Stand B',
                },
                {
                    stopPointRef: '13003654G',
                    commonName: 'North Railway Street W/B',
                },
                {
                    stopPointRef: '13003609A',
                    commonName: 'Vane Terrace/Castlereagh N/B',
                },
                {
                    stopPointRef: '13003611F',
                    commonName: 'New Tempest Road (York House) SW/B',
                },
                {
                    stopPointRef: '13003612H',
                    commonName: 'New Strangford Road NW/B',
                },
                { stopPointRef: '13003625G', commonName: 'Park W/B' },
                {
                    stopPointRef: '13003939D',
                    commonName: 'Laurel Avenue SE/B',
                },
                {
                    stopPointRef: '13003923F',
                    commonName: 'Kingston Avenue Hail and Ride SW/B',
                },
                {
                    stopPointRef: '13003622F',
                    commonName: 'The Avenue Shops SW/B',
                },
                { stopPointRef: '13003621F', commonName: 'The Lawns SW/B' },
                {
                    stopPointRef: '13003618F',
                    commonName: 'The Avenue/Essex Crescent SW/B',
                },
                {
                    stopPointRef: '13003306A',
                    commonName: 'Mount Pleasant N/B',
                },
                {
                    stopPointRef: '13003305A',
                    commonName: 'Westlea shops N/B',
                },
                {
                    stopPointRef: '13003921A',
                    commonName: 'Estate (Hail and Ride) N/B',
                },
            ],
        },
    ],
    lineId: 'q2gv2ve',
};

export const mockRawServiceWithDuplicates: RawService = {
    serviceDescription: '\n\t\t\t\tInterchange Stand B,Seaham - Estate (Hail and Ride) N/B,Westlea\n\t\t\t',
    operatorShortName: 'HCTY',
    lineName: '17',
    startDate: '2021-10-11T13:40:49+00:00',
    inboundDirectionDescription: 'this way',
    outboundDirectionDescription: 'another way',
    journeyPatterns: [
        {
            direction: 'outbound',
            orderedStopPoints: [
                {
                    stopPointRef: 'A',
                    commonName: 'Estate (Hail and Ride) N/B',
                },
                {
                    stopPointRef: 'B',
                    commonName: 'Westlea shops S/B',
                },
                {
                    stopPointRef: 'C',
                    commonName: 'Mount Pleasant NE/B',
                },
                {
                    stopPointRef: 'D',
                    commonName: 'The Avenue/Essex Crescent NE/B',
                },
                {
                    stopPointRef: 'E',
                    commonName: 'The Avenue Shops NE/B',
                },
                {
                    stopPointRef: 'F',
                    commonName: 'Kingston Avenue Hail and Ride NE/B',
                },
                {
                    stopPointRef: 'G',
                    commonName: 'Laurel Avenue NW/B',
                },
                { stopPointRef: 'H', commonName: 'Park E/B' },
                {
                    stopPointRef: 'I',
                    commonName: 'New Strangford Road SE/B',
                },
                {
                    stopPointRef: 'J',
                    commonName: 'New Tempest Road (York House) NE/B',
                },
                {
                    stopPointRef: 'K',
                    commonName: 'Vane Terrace/Castlereagh S/B',
                },
                {
                    stopPointRef: 'L',
                    commonName: 'Sophia Street S/B',
                },
                {
                    stopPointRef: 'M',
                    commonName: 'Viceroy Street E/B',
                },
                {
                    stopPointRef: 'N',
                    commonName: 'Adolphus Place NE/B',
                },
                {
                    stopPointRef: 'O',
                    commonName: 'Interchange Stand B',
                },
            ],
        },
        {
            direction: 'outbound',
            orderedStopPoints: [
                {
                    stopPointRef: 'A',
                    commonName: 'Interchange Stand B',
                },
                {
                    stopPointRef: 'B',
                    commonName: 'North Railway Street W/B',
                },
                {
                    stopPointRef: '1',
                    commonName: 'Vane Terrace/Castlereagh N/B',
                },
                {
                    stopPointRef: '2',
                    commonName: 'New Tempest Road (York House) SW/B',
                },
                {
                    stopPointRef: '3',
                    commonName: 'New Strangford Road NW/B',
                },
                { stopPointRef: '4', commonName: 'Park W/B' },
                {
                    stopPointRef: '5',
                    commonName: 'Laurel Avenue SE/B',
                },
                {
                    stopPointRef: '6',
                    commonName: 'Kingston Avenue Hail and Ride SW/B',
                },
                {
                    stopPointRef: '7',
                    commonName: 'The Avenue Shops SW/B',
                },
                { stopPointRef: '8', commonName: 'The Lawns SW/B' },
                {
                    stopPointRef: '9',
                    commonName: 'The Avenue/Essex Crescent SW/B',
                },
                {
                    stopPointRef: '10',
                    commonName: 'Mount Pleasant N/B',
                },
                {
                    stopPointRef: '11',
                    commonName: 'Westlea shops N/B',
                },
                {
                    stopPointRef: 'O',
                    commonName: 'Estate (Hail and Ride) N/B',
                },
            ],
        },
        {
            direction: 'inbound',
            orderedStopPoints: [
                {
                    stopPointRef: '13003655B',
                    commonName: 'Interchange Stand B',
                },
                {
                    stopPointRef: '13003654G',
                    commonName: 'North Railway Street W/B',
                },
                {
                    stopPointRef: '13003999F',
                    commonName: 'New Tempest Road (York House) SW/B',
                },
                {
                    stopPointRef: '13003111A',
                    commonName: 'Vane Terrace/Castlereagh N/B',
                },
                {
                    stopPointRef: '13003612H',
                    commonName: 'New Strangford Road NW/B',
                },
                { stopPointRef: '13003625G', commonName: 'Park W/B' },
                {
                    stopPointRef: '13003939D',
                    commonName: 'Laurel Avenue SE/B',
                },
                {
                    stopPointRef: '13003921A',
                    commonName: 'Estate (Hail and Ride) N/B',
                },
            ],
        },
    ],
    lineId: 'q2gv2ve',
};

export const userFareStages: UserFareStages = {
    fareStages: [
        {
            stageName: 'Acomb Green Lane',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'],
                },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            stageName: 'Mattison Way',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'],
                },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            stageName: 'Nursery Drive',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Holl Bank/Beech Ave', 'Cambridge Street (York)', 'Blossom Street'],
                },
                {
                    price: '1.70',
                    fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Holl Bank/Beech Ave',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Cambridge Street (York)', 'Blossom Street'],
                },
                {
                    price: '1.70',
                    fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Cambridge Street (York)',
            prices: [
                {
                    price: '1.00',
                    fareZones: ['Blossom Street', 'Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Blossom Street',
            prices: [
                {
                    price: '1.00',
                    fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Rail Station (York)',
            prices: [{ price: '1.00', fareZones: ['Piccadilly (York)'] }],
        },
        { stageName: 'Piccadilly (York)', prices: [] },
    ],
};

export const fareStageNames: string[] = ['Acomb Green Lane', 'Mattison Way', 'Nursery Drive'];

export const zoneStops: Stop[] = [
    {
        stopName: 'Westlea shops',
        naptanCode: 'durapmja',
        atcoCode: '13003305E',
        localityCode: 'N0077347',
        localityName: 'New Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'S-bound',
        street: 'B1285 Stockton Road',
    },
    {
        stopName: 'The Avenue Shops',
        naptanCode: 'duratgtm',
        atcoCode: '13003622B',
        localityCode: 'E0010170',
        localityName: 'Deneside',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'The Avenue',
    },
    {
        stopName: 'Interchange Stand B',
        naptanCode: 'duratjwd',
        atcoCode: '13003655B',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'B',
        street: 'South Crescent',
    },
    {
        stopName: 'Adolphus Place',
        naptanCode: 'duratjga',
        atcoCode: '13003635B',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'South Terrace',
    },
    {
        stopName: 'The Avenue - Essex Crescent',
        naptanCode: 'duratgpt',
        atcoCode: '13003618B',
        localityCode: 'E0010170',
        localityName: 'Deneside',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'The Avenue',
    },
    {
        stopName: 'New Strangford Road',
        naptanCode: 'duratgma',
        atcoCode: '13003612D',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'SE-bound',
        street: 'New Stranford Road',
    },
    {
        stopName: 'New Tempest Road - York House',
        naptanCode: 'duratgjt',
        atcoCode: '13003611B',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'Tempest Road',
    },
    {
        stopName: 'Mount Pleasant',
        naptanCode: 'durapmjg',
        atcoCode: '13003306B',
        localityCode: 'N0077347',
        localityName: 'New Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'The Avenue',
    },
    {
        stopName: 'Viceroy Street',
        naptanCode: 'durgawmt',
        atcoCode: '13003949C',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'E-bound',
        street: 'Viceroy street',
    },
    {
        stopName: 'Vane Terrace - Castlereagh',
        naptanCode: 'duratgdt',
        atcoCode: '13003609E',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'S-bound',
        street: 'Vane Terrace',
    },
    {
        stopName: 'Estate Hail and Ride',
        naptanCode: 'durgawjp',
        atcoCode: '13003921A',
        localityCode: 'N0077347',
        localityName: 'New Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'N-bound',
        street: 'Windermere Road',
    },
    {
        stopName: 'Kingston Avenue',
        naptanCode: 'durawagw',
        atcoCode: '13003923B',
        localityCode: 'E0010170',
        localityName: 'Deneside',
        parentLocalityName: 'IW Test',
        indicator: 'NE-bound',
        street: 'Kingston Avenue',
    },
    {
        stopName: 'Park',
        naptanCode: 'duratgwg',
        atcoCode: '13003625C',
        localityCode: 'E0010170',
        localityName: 'Deneside',
        parentLocalityName: 'IW Test',
        indicator: 'E-bound',
        street: 'The Avenue',
    },
    {
        stopName: 'Laurel Avenue',
        naptanCode: 'durawamp',
        atcoCode: '13003939H',
        localityCode: 'E0010170',
        localityName: 'Deneside',
        parentLocalityName: 'IW Test',
        indicator: 'NW-bound',
        street: 'Laurel Avenue',
    },
    {
        stopName: 'Sophia Street',
        naptanCode: 'durgapwp',
        atcoCode: '13003661E',
        localityCode: 'E0045957',
        localityName: 'Seaham',
        parentLocalityName: 'IW Test',
        indicator: 'S-bound',
        street: 'Sophia Street',
    },
];

export const selectedFareStages: string[][] = [
    [
        'Acomb Green Lane',
        '{"stopName":"Sophia Street","naptanCode":"durgapwp","atcoCode":"13003661E","localityCode":"E0045957","localityName":"Seaham","parentLocalityName":"IW Test","indicator":"S-bound","street":"Sophia Street"}',
    ],
    [
        'Acomb Green Lane',
        '{"stopName":"Park","naptanCode":"duratgwg","atcoCode":"13003625C","localityCode":"E0010170","localityName":"Deneside","parentLocalityName":"IW Test","indicator":"E-bound","street":"The Avenue"}',
    ],
    [
        'Holl Bank/Beech Ave',
        '{"stopName":"Vane Terrace - Castlereagh","naptanCode":"duratgdt","atcoCode":"13003609E","localityCode":"E0045957","localityName":"Seaham","parentLocalityName":"IW Test","indicator":"S-bound","street":"Vane Terrace"}',
    ],
    [
        'Holl Bank/Beech Ave',
        '{"stopName":"New Tempest Road - York House","naptanCode":"duratgjt","atcoCode":"13003611B","localityCode":"E0045957","localityName":"Seaham","parentLocalityName":"IW Test","indicator":"NE-bound","street":"Tempest Road"}',
    ],
];

// Maps a stop's atcoCode to the assigned fare zone name, as expected by EditFareStageMatching
export const editSelectedFareStages: Record<string, string> = {
    '13003305E': 'Acomb Green Lane',
    '13003622B': 'Mattison Way',
    '13003611B': 'Nursery Drive',
};

export const service: BasicService = {
    lineName: '215',
    nocCode: 'DCCL',
    operatorShortName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    lineId: 'q2gv2ve',
};

export const mockService: ServiceDB = {
    serviceDescription: '\n\t\t\t\tInterchange Stand B,Seaham - Estate (Hail and Ride) N/B,Westlea\n\t\t\t',
    operatorShortName: 'HCTY',
    lineName: '17',
    startDate: '2021-10-11T13:40:49+00:00',
    journeyPatterns: [
        {
            startPoint: { Display: 'Estate (Hail and Ride) N/B', Id: '13003921A' },
            endPoint: { Display: 'Interchange Stand B', Id: '13003655B' },
            stopList: [
                '13003921A',
                '13003305E',
                '13003306B',
                '13003618B',
                '13003622B',
                '13003923B',
                '13003939H',
                '13003625C',
                '13003612D',
                '13003611B',
                '13003609E',
                '13003661E',
                '13003949C',
                '13003635B',
                '13003655B',
            ],
        },
        {
            startPoint: { Display: 'Interchange Stand B', Id: '13003655B' },
            endPoint: { Display: 'Estate (Hail and Ride) N/B', Id: '13003921A' },
            stopList: [
                '13003655B',
                '13003654G',
                '13003609A',
                '13003611F',
                '13003612H',
                '13003625G',
                '13003939D',
                '13003923F',
                '13003622F',
                '13003621F',
                '13003618F',
                '13003306A',
                '13003305A',
                '13003921A',
            ],
        },
    ],
    lineId: 'q2gv2ve',
};

export const mockMatchingUserFareStages: UserFareStages = {
    fareStages: [
        {
            stageName: 'Acomb Green Lane',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'],
                },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            stageName: 'Mattison Way',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'],
                },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            stageName: 'Holl Bank/Beech Ave',
            prices: [
                {
                    price: '1.10',
                    fareZones: ['Cambridge Street (York)', 'Blossom Street'],
                },
                {
                    price: '1.70',
                    fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Blossom Street',
            prices: [
                {
                    price: '1.00',
                    fareZones: ['Rail Station (York)', 'Piccadilly (York)'],
                },
            ],
        },
        {
            stageName: 'Piccadilly (York)',
            prices: [],
        },
    ],
};

export const expectedSalesOfferPackageArray: SalesOfferPackage[] = [
    {
        id: 1,
        name: 'Onboard (cash)',
        description: 'Purchasable on board the bus, with cash, as a paper ticket.',
        purchaseLocations: ['onBoard'],
        paymentMethods: ['cash'],
        ticketFormats: ['paperTicket'],
        isCapped: false,
    },
    {
        id: 2,
        name: 'Onboard (contactless)',
        description: 'Purchasable on board the bus, with a contactless card or device, as a paper ticket.',
        purchaseLocations: ['onBoard'],
        paymentMethods: ['contactlessPaymentCard'],
        ticketFormats: ['paperTicket'],
        isCapped: false,
    },
    {
        id: 3,
        name: 'Capped Onboard',
        description: 'Purchasable on board the bus, with a debit card, as a smart card.',
        purchaseLocations: ['onBoard'],
        paymentMethods: ['debitCard'],
        ticketFormats: ['smartCard'],
        isCapped: true,
    },
    {
        id: 4,
        name: 'Capped Mobile',
        description: 'Purchasable via the mobile device, with a contactless card or device, as a paper ticket.',
        purchaseLocations: ['mobileDevice'],
        paymentMethods: ['mobilePhone'],
        ticketFormats: ['mobileApp'],
        isCapped: true,
    },
];

export const expectedProductDetailsArray = [
    {
        productName: 'Product',
        productPrice: '2.99',
        productDuration: '1 day',
        productValidity: '24hr',
        salesOfferPackages: [
            {
                id: 1,
                price: undefined,
            },
            {
                id: 2,
                price: undefined,
            },
        ],
    },
    {
        productName: 'Product Two',
        productPrice: '7.99',
        productDuration: '7 days',
        productValidity: '24hr',
        salesOfferPackages: [
            {
                id: 2,
                price: undefined,
            },
        ],
    },
];

export const mockTimeRestriction: TimeRestriction = {
    validDays: ['monday', 'bankHoliday'],
};

const mockFullTimeRestriction: FullTimeRestriction[] = [
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
];

export const expectedSingleTicket: WithIds<SingleTicket> = {
    type: 'single',
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    journeyDirection: 'inbound',
    passengerType: { id: 9 },
    operatorName: 'DCC',
    termTime: true,
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2024-12-18T09:30:46.0Z',
    },
    products: [
        {
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
    fareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    localityName: 'Horden',
                    parentLocalityName: '',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    localityName: 'Horden',
                    parentLocalityName: '',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    unassignedStops: {
        singleUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedCarnetSingleTicket: WithIds<SingleTicket> = {
    type: 'single',
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    journeyDirection: 'inbound',
    passengerType: { id: 9 },
    operatorName: 'DCC',
    termTime: true,
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Test Product',
            carnetDetails: {
                expiryTime: '10',
                expiryUnit: CarnetExpiryUnit.DAY,
                quantity: '5',
            },
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ] as unknown as WithIds<SingleTicket>['products'],
    fareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    localityName: 'Horden',
                    parentLocalityName: '',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    localityName: 'Horden',
                    parentLocalityName: '',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    unassignedStops: {
        singleUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedNonCircularReturnTicket: WithIds<ReturnTicket> = {
    type: 'return',
    passengerType: { id: 9 },
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
    inboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    outboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    naptanCode: 'duratdmj',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
    ],
    unassignedStops: {
        inboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
        outboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedReturnTicketWithAdditionalService: WithIds<ReturnTicket> = {
    type: 'return',
    passengerType: { id: 9 },
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    additionalServices: [
        {
            lineName: '12A',
            lineId: '3h3vb32ik',
            serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
            serviceId: 1,
        },
    ],
    products: [
        {
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
    inboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    outboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    naptanCode: 'duratdmj',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
    ],
    unassignedStops: {
        inboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
        outboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedPointToPointPeriodTicket: WithIds<PointToPointPeriodTicket> = {
    type: 'period',
    passengerType: { id: 9 },
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            productName: 'My product',
            productDuration: '7 weeks',
            productValidity: '24hr',
        },
    ] as WithIds<PointToPointPeriodTicket>['products'],
    inboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    outboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    naptanCode: 'duratdmj',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
    ],
    unassignedStops: {
        inboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
        outboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
    termTime: false,
};

export const expectedCircularReturnTicket: WithIds<ReturnTicket> = {
    type: 'return',
    lineName: '215',
    lineId: 'q2gv2ve',
    passengerType: { id: 9 },
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
    inboundFareZones: [],
    outboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    parentLocalityName: '',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    localityName: 'Peterlee',
                    parentLocalityName: '',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    unassignedStops: {
        inboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
        outboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedCarnetReturnTicket: WithIds<ReturnTicket> = {
    type: 'return',
    passengerType: { id: 9 },
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Test Return Product',
            carnetDetails: {
                quantity: '10',
                expiryTime: '',
                expiryUnit: CarnetExpiryUnit.NO_EXPIRY,
            },
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ] as unknown as WithIds<SingleTicket>['products'],
    inboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    naptanCode: 'duratdmj',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Mattison Way',
            stops: [
                {
                    stopName: 'Yoden Way',
                    naptanCode: 'duratdmt',
                    atcoCode: '13003522F',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SW-bound',
                    street: 'Yoden Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
        {
            name: 'Holl Bank/Beech Ave',
            stops: [
                {
                    stopName: 'Surtees Rd-Edenhill Rd',
                    naptanCode: 'durapgdw',
                    atcoCode: '13003219H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'NW-bound',
                    street: 'Surtees Road',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Cambridge Street (York)', 'Blossom Street'] },
                { price: '1.70', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] },
            ],
        },
        {
            name: 'Blossom Street',
            stops: [
                {
                    stopName: 'Bus Station',
                    naptanCode: 'duratdma',
                    atcoCode: '13003519H',
                    localityCode: 'E0045956',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'H',
                    street: 'Bede Way',
                    qualifierName: '',
                },
            ],
            prices: [{ price: '1.00', fareZones: ['Rail Station (York)', 'Piccadilly (York)'] }],
        },
        {
            name: 'Piccadilly (York)',
            stops: [
                {
                    stopName: 'Kell Road',
                    naptanCode: 'duraptwp',
                    atcoCode: '13003345D',
                    localityCode: 'E0010183',
                    parentLocalityName: '',
                    localityName: 'Horden',
                    indicator: 'SE-bound',
                    street: 'Kell Road',
                    qualifierName: '',
                },
            ],
            prices: [],
        },
    ],
    outboundFareZones: [
        {
            name: 'Acomb Green Lane',
            stops: [
                {
                    stopName: 'Yoden Way - Chapel Hill Road',
                    atcoCode: '13003521G',
                    localityCode: 'E0045956',
                    naptanCode: 'duratdmj',
                    parentLocalityName: '',
                    localityName: 'Peterlee',
                    indicator: 'W-bound',
                    street: 'Yodan Way',
                    qualifierName: '',
                },
            ],
            prices: [
                { price: '1.10', fareZones: ['Mattison Way', 'Nursery Drive', 'Holl Bank/Beech Ave'] },
                {
                    price: '1.70',
                    fareZones: [
                        'Cambridge Street (York)',
                        'Blossom Street',
                        'Rail Station (York)',
                        'Piccadilly (York)',
                    ],
                },
            ],
        },
    ],
    unassignedStops: {
        inboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
        outboundUnassignedStops: [
            {
                atcoCode: 'GHI',
            },
        ],
    },
};

export const expectedPeriodGeoZoneTicketWithMultipleProducts: WithIds<PeriodGeoZoneTicket> = {
    operatorName: 'test',
    type: 'period',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    zoneName: 'Green Lane Shops',
    stops: zoneStops,
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Ticket',
            productPrice: '50',
            productDuration: '5 weeks',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Day Ticket',
            productPrice: '2.50',
            productDuration: '1 year',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Monthly Ticket',
            productPrice: '200',
            productDuration: '28 months',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
    ],
};

export const expectedMultiOperatorGeoZoneTicketWithMultipleProducts: WithIds<MultiOperatorGeoZoneTicket> = {
    operatorName: 'test',
    type: 'multiOperator',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    zoneName: 'Green Lane Shops',
    stops: zoneStops,
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Ticket',
            productPrice: '50',
            productDuration: '5 weeks',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Day Ticket',
            productPrice: '2.50',
            productDuration: '1 year',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Monthly Ticket',
            productPrice: '200',
            productDuration: '28 months',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
    ],
    additionalNocs: ['MCTR', 'WBTR', 'BLAC'],
    operatorGroupId: 1,
};

export const expectedMultiOperatorExtGeoZoneTicketWithMultipleProducts: WithIds<MultiOperatorGeoZoneTicket> = {
    operatorName: 'test',
    type: 'multiOperatorExt',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    zoneName: 'Green Lane Shops',
    stops: zoneStops,
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Ticket',
            productPrice: '50',
            productDuration: '5 weeks',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Day Ticket',
            productPrice: '2.50',
            productDuration: '1 year',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Monthly Ticket',
            productPrice: '200',
            productDuration: '28 months',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
    ],
    additionalNocs: ['MCTR', 'WBTR', 'BLAC'],
    operatorGroupId: 1,
};

export const expectedPeriodMultipleServicesTicketWithMultipleProducts: WithIds<PeriodMultipleServicesTicket> = {
    operatorName: 'test',
    type: 'period',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    passengerType: { id: 9 },
    termTime: false,
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Ticket',
            productPrice: '50',
            productDuration: '5 weeks',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Day Ticket',
            productPrice: '2.50',
            productDuration: '1 year',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'Monthly Ticket',
            productPrice: '200',
            productDuration: '28 months',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
    ],
    selectedServices: [
        {
            lineName: '12A',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_12A_1',
            startDate: '13/05/2020',
            serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
        },
        {
            lineName: '6',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_6_1',
            startDate: '08/05/2020',
            serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
        },
        {
            lineName: '101',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_101_1',
            startDate: '06/05/2020',
            serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
        },
    ],
};

export const expectedCarnetPeriodMultipleServicesTicketWithMultipleProducts: WithIds<PeriodMultipleServicesTicket> = {
    operatorName: 'test',
    type: 'period',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    passengerType: { id: 9 },
    termTime: false,
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Ticket',
            productPrice: '50',
            productDuration: '5 weeks',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: {
                quantity: '10',
                expiryTime: '15',
                expiryUnit: CarnetExpiryUnit.WEEK,
            },
        },
        {
            productName: 'Day Ticket',
            productPrice: '2.50',
            productDuration: '1 year',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: {
                quantity: '15',
                expiryTime: '10',
                expiryUnit: CarnetExpiryUnit.MONTH,
            },
        },
        {
            productName: 'Monthly Ticket',
            productPrice: '200',
            productDuration: '28 months',
            productValidity: 'endOfCalendarDay',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
            carnetDetails: {
                quantity: '30',
                expiryTime: '10',
                expiryUnit: CarnetExpiryUnit.YEAR,
            },
        },
    ],
    selectedServices: [
        {
            lineName: '12A',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_12A_1',
            startDate: '13/05/2020',
            serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
        },
        {
            lineName: '6',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_6_1',
            startDate: '08/05/2020',
            serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
        },
        {
            lineName: '101',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_101_1',
            startDate: '06/05/2020',
            serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
        },
    ],
};

export const expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators: WithIds<MultiOperatorMultipleServicesTicket> =
    {
        operatorName: 'test',
        type: 'multiOperator',
        nocCode: 'TEST',
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        email: 'test@example.com',
        passengerType: { id: 9 },
        termTime: false,
        timeRestriction: { id: 2 },
        ticketPeriod: {
            startDate: '2020-12-17T09:30:46.0Z',
            endDate: '2020-12-18T09:30:46.0Z',
        },
        operatorGroupId: 1,
        products: [
            {
                productName: 'Weekly Ticket',
                productPrice: '50',
                productDuration: '5 weeks',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
            {
                productName: 'Day Ticket',
                productPrice: '2.50',
                productDuration: '1 year',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
            {
                productName: 'Monthly Ticket',
                productPrice: '200',
                productDuration: '28 months',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
        ],
        selectedServices: [
            {
                lineName: '12A',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_12A_1',
                startDate: '13/05/2020',
                serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
            },
            {
                lineName: '6',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_6_1',
                startDate: '08/05/2020',
                serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
            },
            {
                lineName: '101',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_101_1',
                startDate: '06/05/2020',
                serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
            },
        ],
        additionalOperators: [
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
    };

export const expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperatorsExt: WithIds<MultiOperatorMultipleServicesTicket> =
    {
        operatorName: 'test',
        type: 'multiOperatorExt',
        nocCode: 'TEST',
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        email: 'test@example.com',
        passengerType: { id: 9 },
        termTime: false,
        timeRestriction: { id: 2 },
        ticketPeriod: {
            startDate: '2020-12-17T09:30:46.0Z',
            endDate: '2020-12-18T09:30:46.0Z',
        },
        operatorGroupId: 1,
        products: [
            {
                productName: 'Weekly Ticket',
                productPrice: '50',
                productDuration: '5 weeks',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
            {
                productName: 'Day Ticket',
                productPrice: '2.50',
                productDuration: '1 year',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
            {
                productName: 'Monthly Ticket',
                productPrice: '200',
                productDuration: '28 months',
                productValidity: 'fareDayEnd',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
                carnetDetails: undefined,
            },
        ],
        selectedServices: [
            {
                lineName: '12A',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_12A_1',
                startDate: '13/05/2020',
                serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
            },
            {
                lineName: '6',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_6_1',
                startDate: '08/05/2020',
                serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
            },
            {
                lineName: '101',
                lineId: '3h3vb32ik',
                serviceCode: 'NW_05_BLAC_101_1',
                startDate: '06/05/2020',
                serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
            },
        ],
        additionalOperators: [
            {
                nocCode: 'WBTR',
                selectedServices: [],
            },
            {
                nocCode: 'BLAC',
                selectedServices: [],
            },
            {
                nocCode: 'TESTSCHEME',
                selectedServices: [],
            },
        ],
    };

export const expectedFlatFareTicket = {
    operatorName: 'test',
    passengerType: { id: 9 },
    type: 'flatFare',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    termTime: false,
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Weekly Rider',
            productPrice: '7',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
    selectedServices: [
        {
            lineName: '12A',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_12A_1',
            startDate: '13/05/2020',
            serviceDescription: 'Infinity Works, Leeds - Infinity Works, Manchester',
        },
        {
            lineName: '6',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_6_1',
            startDate: '08/05/2020',
            serviceDescription: 'Infinity Works, Edinburgh - Infinity Works, London',
        },
        {
            lineName: '101',
            lineId: '3h3vb32ik',
            serviceCode: 'NW_05_BLAC_101_1',
            startDate: '06/05/2020',
            serviceDescription: 'Infinity Works, Boston - Infinity Works, Berlin',
        },
    ],
};

export const expectedFlatFareGeoZoneTicket: WithIds<FlatFareGeoZoneTicket> = {
    operatorName: 'test',
    passengerType: { id: 9 },
    type: 'flatFare',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    zoneName: 'my flat fare zone',
    stops: zoneStops,
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Flat fare with geo zone',
            productPrice: '7',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 3,
                    price: undefined,
                },
            ],
        },
    ],
};

export const expectedFlatFareGeoZoneTicketWithExemptions: WithIds<FlatFareGeoZoneTicket> = {
    operatorName: 'test',
    passengerType: { id: 9 },
    type: 'flatFare',
    nocCode: 'TEST',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    zoneName: 'my flat fare zone',
    stops: zoneStops,
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'Flat fare with geo zone',
            productPrice: '7',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 3,
                    price: undefined,
                },
            ],
        },
    ],
    exemptedServices: [
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
};

export const expectedSchemeOperatorTicket = (
    type: BaseSchemeOperatorTicket['type'],
): WithBaseIds<BaseSchemeOperatorTicket> => {
    return {
        schemeOperatorName: 'SCHEME_OPERATOR',
        schemeOperatorRegionCode: 'SCHEME_REGION',
        type,
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        email: 'test@example.com',
        passengerType: { id: 9 },
        timeRestriction: { id: 2 },
        ticketPeriod: {
            startDate: '2020-12-17T09:30:46.0Z',
            endDate: '2020-12-18T09:30:46.0Z',
        },
    };
};

export const expectedSchemeOperatorAfterFlatFareAdjustmentTicket: WithIds<SchemeOperatorFlatFareTicket> = {
    schemeOperatorName: expect.any(String),
    schemeOperatorRegionCode: expect.any(String),
    type: 'flatFare',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'product one',
            productPrice: '50',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'product two',
            productPrice: '502',
            salesOfferPackages: [
                {
                    id: 2,
                    price: undefined,
                },
                {
                    id: 3,
                    price: undefined,
                },
            ],
            carnetDetails: undefined,
        },
    ],
    additionalOperators: [
        {
            nocCode: 'WBTR',
            selectedServices: [
                {
                    lineId: '3h3vsergesrhg',
                    lineName: '343',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h3vtrhtherhed',
                    lineName: '444',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '3h3vb32ik',
                    lineName: '543',
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
                    lineId: '3h3rthsrty56y5',
                    lineName: '100',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h34t43deefsf',
                    lineName: '101',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '34tvwevdsvb32ik',
                    lineName: '102',
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
                    lineId: '45t34gvfdx2ik',
                    lineName: '63',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: 'q45g4rgergik',
                    lineName: '64',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: 'q34ttfwerfsxfc',
                    lineName: '65',
                    serviceCode: 'NW_04_MCTR_232_1',
                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                    startDate: '06/04/2020',
                },
            ],
        },
    ],
};

export const expectedSchemeOperatorAfterFlatFareAdjustmentTicketWithNocInServices = {
    ...expectedSchemeOperatorAfterFlatFareAdjustmentTicket,
    additionalOperators: [
        {
            nocCode: 'WBTR',
            selectedServices: [
                {
                    lineId: '3h3vsergesrhg',
                    lineName: '343',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h3vtrhtherhed',
                    lineName: '444',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '3h3vb32ik',
                    lineName: '543',
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
                    lineId: '3h3rthsrty56y5',
                    lineName: '100',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h34t43deefsf',
                    lineName: '101',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '34tvwevdsvb32ik',
                    lineName: '102',
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
                    lineId: '45t34gvfdx2ik',
                    lineName: '63',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: 'q45g4rgergik',
                    lineName: '64',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: 'q34ttfwerfsxfc',
                    lineName: '65',
                    serviceCode: 'NW_04_MCTR_232_1',
                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                    startDate: '06/04/2020',
                },
            ],
        },
    ],
};

export const expectedSchemeOperatorMultiServicesTicket = {
    schemeOperatorName: 'SCHEME_OPERATOR',
    schemeOperatorRegionCode: 'SCHEME_REGION',
    type: 'period',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    products: [
        {
            productName: 'product one',
            productPrice: '5.00',
            productDuration: '2 weeks',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 1,
                    price: '4.99',
                },
            ],
            carnetDetails: undefined,
        },
        {
            productName: 'product two',
            productPrice: '5.02',
            productDuration: '5 days',
            productValidity: '24hr',
            salesOfferPackages: [
                {
                    id: 2,
                    price: '5.99',
                },
                {
                    id: 3,
                    price: '6.99',
                },
            ],
            carnetDetails: undefined,
        },
    ],
    additionalOperators: [
        {
            nocCode: 'WBTR',
            selectedServices: [
                {
                    lineId: '3h3vsergesrhg',
                    lineName: '343',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h3vtrhtherhed',
                    lineName: '444',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '3h3vb32ik',
                    lineName: '543',
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
                    lineId: '3h3rthsrty56y5',
                    lineName: '100',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: '3h34t43deefsf',
                    lineName: '101',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: '34tvwevdsvb32ik',
                    lineName: '102',
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
                    lineId: '45t34gvfdx2ik',
                    lineName: '63',
                    serviceCode: '11-444-_-y08-1',
                    serviceDescription: 'Test Under Lyne - Glossop',
                    startDate: '07/04/2020',
                },
                {
                    lineId: 'q45g4rgergik',
                    lineName: '64',
                    serviceCode: 'NW_01_MCT_391_1',
                    serviceDescription: 'Macclesfield - Bollington - Poynton - Stockport',
                    startDate: '23/04/2019',
                },
                {
                    lineId: 'q34ttfwerfsxfc',
                    lineName: '65',
                    serviceCode: 'NW_04_MCTR_232_1',
                    serviceDescription: 'Ashton - Hurst Cross - Broadoak Circular',
                    startDate: '06/04/2020',
                },
            ],
        },
    ],
};

export const expectedSchemeOperatorTicketAfterGeoZoneAdjustment: WithIds<SchemeOperatorGeoZoneTicket> = {
    schemeOperatorName: expect.any(String),
    schemeOperatorRegionCode: expect.any(String),
    additionalNocs: ['MCTR', 'WBTR', 'BLAC'],
    type: 'period',
    uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
    email: 'test@example.com',
    passengerType: { id: 9 },
    timeRestriction: { id: 2 },
    ticketPeriod: {
        startDate: '2020-12-17T09:30:46.0Z',
        endDate: '2020-12-18T09:30:46.0Z',
    },
    zoneName: 'Green Lane Shops',
    stops: [
        {
            atcoCode: '13003305E',
            indicator: 'S-bound',
            localityCode: 'N0077347',
            localityName: 'New Seaham',
            naptanCode: 'durapmja',
            parentLocalityName: 'IW Test',
            stopName: 'Westlea shops',
            street: 'B1285 Stockton Road',
        },
        {
            atcoCode: '13003622B',
            indicator: 'NE-bound',
            localityCode: 'E0010170',
            localityName: 'Deneside',
            naptanCode: 'duratgtm',
            parentLocalityName: 'IW Test',
            stopName: 'The Avenue Shops',
            street: 'The Avenue',
        },
        {
            atcoCode: '13003655B',
            indicator: 'B',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'duratjwd',
            parentLocalityName: 'IW Test',
            stopName: 'Interchange Stand B',
            street: 'South Crescent',
        },
        {
            atcoCode: '13003635B',
            indicator: 'NE-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'duratjga',
            parentLocalityName: 'IW Test',
            stopName: 'Adolphus Place',
            street: 'South Terrace',
        },
        {
            atcoCode: '13003618B',
            indicator: 'NE-bound',
            localityCode: 'E0010170',
            localityName: 'Deneside',
            naptanCode: 'duratgpt',
            parentLocalityName: 'IW Test',
            stopName: 'The Avenue - Essex Crescent',
            street: 'The Avenue',
        },
        {
            atcoCode: '13003612D',
            indicator: 'SE-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'duratgma',
            parentLocalityName: 'IW Test',
            stopName: 'New Strangford Road',
            street: 'New Stranford Road',
        },
        {
            atcoCode: '13003611B',
            indicator: 'NE-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'duratgjt',
            parentLocalityName: 'IW Test',
            stopName: 'New Tempest Road - York House',
            street: 'Tempest Road',
        },
        {
            atcoCode: '13003306B',
            indicator: 'NE-bound',
            localityCode: 'N0077347',
            localityName: 'New Seaham',
            naptanCode: 'durapmjg',
            parentLocalityName: 'IW Test',
            stopName: 'Mount Pleasant',
            street: 'The Avenue',
        },
        {
            atcoCode: '13003949C',
            indicator: 'E-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'durgawmt',
            parentLocalityName: 'IW Test',
            stopName: 'Viceroy Street',
            street: 'Viceroy street',
        },
        {
            atcoCode: '13003609E',
            indicator: 'S-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'duratgdt',
            parentLocalityName: 'IW Test',
            stopName: 'Vane Terrace - Castlereagh',
            street: 'Vane Terrace',
        },
        {
            atcoCode: '13003921A',
            indicator: 'N-bound',
            localityCode: 'N0077347',
            localityName: 'New Seaham',
            naptanCode: 'durgawjp',
            parentLocalityName: 'IW Test',
            stopName: 'Estate Hail and Ride',
            street: 'Windermere Road',
        },
        {
            atcoCode: '13003923B',
            indicator: 'NE-bound',
            localityCode: 'E0010170',
            localityName: 'Deneside',
            naptanCode: 'durawagw',
            parentLocalityName: 'IW Test',
            stopName: 'Kingston Avenue',
            street: 'Kingston Avenue',
        },
        {
            atcoCode: '13003625C',
            indicator: 'E-bound',
            localityCode: 'E0010170',
            localityName: 'Deneside',
            naptanCode: 'duratgwg',
            parentLocalityName: 'IW Test',
            stopName: 'Park',
            street: 'The Avenue',
        },
        {
            atcoCode: '13003939H',
            indicator: 'NW-bound',
            localityCode: 'E0010170',
            localityName: 'Deneside',
            naptanCode: 'durawamp',
            parentLocalityName: 'IW Test',
            stopName: 'Laurel Avenue',
            street: 'Laurel Avenue',
        },
        {
            atcoCode: '13003661E',
            indicator: 'S-bound',
            localityCode: 'E0045957',
            localityName: 'Seaham',
            naptanCode: 'durgapwp',
            parentLocalityName: 'IW Test',
            stopName: 'Sophia Street',
            street: 'Sophia Street',
        },
    ],
    products: [
        {
            carnetDetails: undefined,
            productDuration: '5 weeks',
            productName: 'Weekly Ticket',
            productPrice: '50',
            productValidity: 'fareDayEnd',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
        {
            carnetDetails: undefined,
            productDuration: '1 month',
            productName: 'Day Ticket',
            productPrice: '2.50',
            productValidity: 'fareDayEnd',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
        {
            carnetDetails: undefined,
            productDuration: '28 years',
            productName: 'Monthly Ticket',
            productPrice: '200',
            productValidity: 'fareDayEnd',
            salesOfferPackages: [
                {
                    id: 1,
                    price: undefined,
                },
                {
                    id: 2,
                    price: undefined,
                },
            ],
        },
    ],
};

export const multipleProducts: MultiProduct[] = [
    {
        productName: 'Best ticket',
        productNameId: 'product-name-1',
        productPrice: '3.50',
        productPriceId: 'product-price-1',
        productDuration: '66',
        productDurationId: 'product-duration-1',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'Super ticket',
        productNameId: 'product-name-2',
        productPrice: '3.50',
        productPriceId: 'product-price-2',
        productDuration: '7',
        productDurationId: 'product-duration-2',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'Super Duper ticket',
        productNameId: 'product-name-3',
        productPrice: '3.50',
        productPriceId: 'product-price-3',
        productDuration: '7',
        productDurationId: 'product-duration-3',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-3',
    },
];

export const multipleProductsWithErrors: MultiProductWithErrors[] = [
    {
        productName: 'Valid Product',
        productNameId: 'multiple-product-name-0',
        productPrice: '100',
        productPriceId: 'multiple-product-price-0',
        productDuration: '66',
        productDurationId: 'product-details-period-duration-quantity-0',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-details-period-duration-unit-0',
    },
    {
        productName: 'Invalid Price',
        productNameId: 'multiple-product-name-0',
        productPrice: 'ifancueuUBY',
        productPriceId: 'multiple-product-price-0',
        productPriceError: 'This must be a valid price in pounds and pence',
        productDuration: '66',
        productDurationId: 'product-details-period-duration-quantity-0',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-details-period-duration-unit-0',
    },
    {
        productName: 'Invalid Duration',
        productNameId: 'multiple-product-name-0',
        productPrice: '100',
        productPriceId: 'multiple-product-price-0',
        productDuration: '-66',
        productDurationId: 'product-details-period-duration-quantity-0',
        productDurationError: 'Product duration cannot be zero or a negative number',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-details-period-duration-unit-0',
    },
];

export const invalidDurationProducts: MultiProduct[] = [
    {
        productName: 'valid duration',
        productNameId: 'multiple-product-name-input-0',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '66',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'zero duration',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '0',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'negative duration',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '-1',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'empty duration',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'non-numeric duration',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: 'ddd',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
];

export const invalidDurationTypeProducts: MultiProduct[] = [
    {
        productName: 'valid duration type',
        productNameId: 'multiple-product-name-input-0',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '66',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'no duration type',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '0',
        productDurationId: '.',
        productDurationUnits: undefined,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'valid duration',
        productNameId: 'multiple-product-name-input-0',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '66',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
];

export const invalidPriceProducts: MultiProduct[] = [
    {
        productName: 'valid price',
        productNameId: '.',
        productPrice: '4.50',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'empty price',
        productNameId: '.',
        productPrice: '',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'negative price',
        productNameId: '.',
        productPrice: '-3.00',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'non-numeric / invalid price',
        productNameId: '.',
        productPrice: '3.g6',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
];

export const invalidNameProducts: MultiProduct[] = [
    {
        productName: 'Super Saver Bus Ticket',
        productNameId: 'valid name',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: '',
        productNameId: 'empty name',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'S',
        productNameId: 'Too short name',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName:
            'Super Saver Bus Ticket for the cheapest you have ever seen and no other bus service will compare to this one, or your money back',
        productNameId: 'Too Long name',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
];

export const duplicateNameProducts: MultiProduct[] = [
    {
        productName: 'Super Saver Bus Ticket',
        productNameId: 'v.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'Super Saver Bus Ticket',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
    {
        productName: 'Super Saver Bus Ticket',
        productNameId: '.',
        productPrice: '.',
        productPriceId: '.',
        productDuration: '.',
        productDurationId: '.',
        productDurationUnits: ExpiryUnit.WEEK,
        productDurationUnitsId: 'product-duration-units-1',
    },
];

export const mockProductRadioErrors: ErrorInfo[] = [
    {
        errorMessage: 'Choose one of the options below',
        id: 'start-date',
    },
];

export const conditionalRadioWithTextInput: RadioWithConditionalInputs = {
    id: 'text-input',
    name: 'textInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'text-input-conditional',
    inputHint: { id: 'text-input-hint', content: 'Hint.' },
    inputType: 'text',
    inputs: [
        {
            id: 'text',
            name: 'text',
            label: 'Text',
            defaultValue: 'Default text',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithEmptyTextInput: RadioWithConditionalInputs = {
    id: 'text-input',
    name: 'textInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'text-input-conditional',
    inputHint: { id: 'text-input-hint', content: 'Hint.' },
    inputType: 'text',
    inputs: [
        {
            id: 'text',
            name: 'text',
            label: 'Text',
            defaultValue: '',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithTextWithUnitsInput: RadioWithConditionalInputs = {
    id: 'text-units-input',
    name: 'textUnitsInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'text-units-input-conditional',
    inputHint: { id: 'text-units-input-hint', content: 'Hint.' },
    inputType: 'textWithUnits',
    inputs: [
        {
            id: 'text',
            name: 'text',
            label: 'Text',
            defaultValue: '',
        },
        {
            id: 'units',
            name: 'units',
            label: 'Units',
            defaultValue: '10',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithEmptyTextWithUnitsInput: RadioWithConditionalInputs = {
    id: 'text-units-input',
    name: 'textUnitsInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'text-units-input-conditional',
    inputHint: { id: 'text-units-input-hint', content: 'Hint.' },
    inputType: 'textWithUnits',
    inputs: [
        {
            id: 'text',
            name: 'text',
            label: 'Text',
            defaultValue: '',
        },
        {
            id: 'units',
            name: 'units',
            label: 'Units',
            defaultValue: '',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithDateInput: RadioWithConditionalInputs = {
    id: 'date-input',
    name: 'dateInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'date-input-conditional',
    inputHint: { id: 'date-input-hint', content: 'Hint.' },
    inputType: 'date',
    inputs: [
        {
            id: 'date',
            name: 'date',
            label: 'Date',
            defaultValue: '12#12#2020',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithEmptyDateInput: RadioWithConditionalInputs = {
    id: 'date-input',
    name: 'dateInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'date-input-conditional',
    inputHint: { id: 'date-input-hint', content: 'Hint.' },
    inputType: 'date',
    inputs: [
        {
            id: 'date',
            name: 'date',
            label: 'Date',
            defaultValue: '##',
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithCheckedCheckboxInput: RadioWithConditionalInputs = {
    id: 'checkbox-input',
    name: 'checkboxInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'checkbox-input-conditional',
    inputHint: { id: 'checkbox-input-hint', content: 'Hint.' },
    inputType: 'checkbox',
    inputs: [
        {
            id: 'checkbox',
            name: 'checkbox',
            label: 'Checkbox',
            defaultChecked: true,
        },
    ],
    inputErrors: [],
};

export const conditionalRadioWithUncheckedCheckboxInput: RadioWithConditionalInputs = {
    id: 'checkbox-input',
    name: 'checkboxInput',
    value: 'Yes',
    label: 'Yes',
    dataAriaControls: 'checkbox-input-conditional',
    inputHint: { id: 'checkbox-input-hint', content: 'Hint.' },
    inputType: 'checkbox',
    inputs: [
        {
            id: 'checkbox',
            name: 'checkbox',
            label: 'Checkbox',
            defaultChecked: false,
        },
    ],
    inputErrors: [],
};

export const mockProductDateInformationFieldsets: RadioConditionalInputFieldset = {
    heading: {
        id: 'product-dates-information',
        content: 'Is there a start or end date for your product(s)?',
        hidden: true,
    },
    radios: [
        {
            id: 'product-dates-required',
            name: 'productDates',
            value: 'Yes',
            dataAriaControls: 'product-dates-required-conditional',
            label: 'Yes',
            inputHint: {
                id: '',
                content: '',
            },
            inputType: 'date',
            inputs: [
                {
                    id: 'start-date',
                    name: 'startDate',
                    label: 'Start Date',
                    defaultValue: '##',
                },
                {
                    id: 'end-date',
                    name: 'endDate',
                    label: 'End Date',
                    defaultValue: '##',
                },
            ],
            inputErrors: [],
        },
        {
            id: 'product-dates-information-not-required',
            name: 'productDates',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockProductDateInformationFieldsetsWithInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'product-dates-information',
        content: 'Is there a start or end date for your product(s)?',
        hidden: true,
    },
    radios: [
        {
            id: 'product-dates-required',
            name: 'productDates',
            value: 'Yes',
            dataAriaControls: 'product-dates-required-conditional',
            label: 'Yes',
            inputHint: {
                id: '',
                content: '',
            },
            inputType: 'date',
            inputs: [
                {
                    id: 'start-date',
                    name: 'startDate',
                    label: 'Start Date',
                    defaultValue: '#12#2020',
                },
                {
                    id: 'end-date',
                    name: 'endDate',
                    label: 'End Date',
                    defaultValue: '#12#2020',
                },
            ],
            inputErrors: [
                {
                    id: 'start-date-day',
                    errorMessage: 'Start date must be a real date',
                },
                {
                    id: 'end-date-day',
                    errorMessage: 'End date must be a real date',
                },
            ],
        },
        {
            id: 'product-dates-information-not-required',
            name: 'productDates',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockProductDateInformationFieldsetsWithErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'product-dates-information',
        content: 'Is there a start or end date for your product(s)?',
        hidden: true,
    },
    radios: [
        {
            id: 'product-dates-required',
            name: 'productDates',
            value: 'Yes',
            dataAriaControls: 'product-dates-required-conditional',
            label: 'Yes',
            inputHint: {
                id: '',
                content: '',
            },
            inputType: 'date',
            inputs: [
                {
                    id: 'start-date-day',
                    name: 'startDate',
                    label: 'Start Date',
                },
                {
                    id: 'end-date-day',
                    name: 'endDate',
                    label: 'End Date',
                },
            ],
            inputErrors: [],
        },
        {
            id: 'product-dates-information-not-required',
            name: 'productDates',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [
        {
            id: 'start-date',
            errorMessage: 'Choose one of the options below',
        },
    ],
};

export const mockPeriodValidityFieldset: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',
            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'End of service day',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'Enter an end time for your service day',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'capProductEndTime',
                    label: 'End time',
                    defaultValue: '',
                },
            ],
            inputErrors: [],
        },
    ],
    radioError: [],
};

export const mockSelectPeriodValidityFieldset: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',
            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'Fare day end',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'You can update your fare day end in operator settings',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'productEndTime',
                    label: 'End time',
                    defaultValue: '',
                    disabled: true,
                },
            ],
            inputErrors: [],
        },
    ],
    radioError: [],
};

export const mockPeriodValidityFieldsetWithErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',

            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'End of service day',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'Enter an end time for your service day',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'capProductEndTime',
                    label: 'End time',
                    defaultValue: '',
                },
            ],
            inputErrors: [],
        },
    ],
    radioError: [
        {
            errorMessage: 'Choose one of the validity options',
            id: 'period-end-calendar',
        },
    ],
};

export const mockSelectPeriodValidityFieldsetWithErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',

            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'Fare day end',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'You can update your fare day end in operator settings',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'productEndTime',
                    label: 'End time',
                    defaultValue: '',
                    disabled: true,
                },
            ],
            inputErrors: [],
        },
    ],
    radioError: [
        {
            errorMessage: 'Choose one of the validity options',
            id: 'period-end-calendar',
        },
    ],
};

export const mockPeriodValidityFieldsetWithInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',

            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'End of service day',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'Enter an end time for your service day',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'capProductEndTime',
                    label: 'End time',
                    defaultValue: '',
                },
            ],
            inputErrors: [
                {
                    errorMessage: 'Specify an end time for service day',
                    id: 'product-end-time',
                },
            ],
        },
    ],
    radioError: [],
};

export const mockSelectPeriodValidityFieldsetWithInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'period-validity',
        content: expect.any(String),
        hidden: true,
    },
    radios: [
        {
            id: 'period-end-calendar',
            name: 'periodValid',
            value: 'endOfCalendarDay',
            label: ' At the end of a calendar day',
            radioButtonHint: {
                id: 'period-end-calendar-hint',
                content: 'For example, a ticket purchased at 3pm would be valid until midnight on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-twenty-four-hours',
            name: 'periodValid',
            value: '24hr',
            label: 'At the end of a 24 hour period from purchase',
            radioButtonHint: {
                id: 'period-twenty-four-hours-hint',
                content: 'For example, a ticket purchased at 3pm will be valid until 3pm on its day of expiry',
            },
            defaultChecked: false,
        },
        {
            id: 'period-end-of-service',
            name: 'periodValid',
            value: 'fareDayEnd',

            disableAutoSelect: true,
            dataAriaControls: 'period-validity-end-of-service-required-conditional',
            label: 'Fare day end',
            radioButtonHint: {
                id: 'period-end-of-service-hint',
                content:
                    'For example, a ticket purchased at 3pm would be valid until the end of your service day on its day of expiry',
            },
            defaultChecked: false,
            inputHint: {
                id: 'product-end-time-hint',
                content: 'You can update your fare day end in operator settings',
                hidden: true,
            },
            inputType: 'text',
            inputs: [
                {
                    id: 'product-end-time',
                    name: 'productEndTime',
                    label: 'End time',
                    defaultValue: '',
                    disabled: true,
                },
            ],
            inputErrors: [
                {
                    errorMessage: 'Specify an end time for service day',
                    id: 'product-end-time',
                },
            ],
        },
    ],
    radioError: [],
};

export const mockDefinePassengerTypeFieldsets: RadioConditionalInputFieldset[] = [
    {
        heading: {
            id: 'define-passenger-age-range',
            content: expect.any(String),
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'Yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                },
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        name: 'ageRangeMin',
                        label: 'Minimum Age (if applicable)',
                        defaultValue: '',
                    },
                    {
                        id: 'age-range-max',
                        name: 'ageRangeMax',
                        label: 'Maximum Age (if applicable)',
                        defaultValue: '',
                    },
                ],
                inputErrors: [],
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: [],
    },
    {
        heading: {
            id: 'define-passenger-proof',
            content: expect.any(String),
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'Yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select the applicable proof document(s).',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'membership-card',
                        name: 'proofDocuments',
                        label: 'Membership Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'student-card',
                        name: 'proofDocuments',
                        label: 'Student Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'identity-document',
                        name: 'proofDocuments',
                        label: 'Identity Document',
                        defaultChecked: false,
                    },
                ],
                inputErrors: [],
            },
            { id: 'proof-not-required', name: 'proof', value: 'No', label: 'No' },
        ],
        radioError: [],
    },
];

export const mockDefinePassengerTypeFieldsetsWithRadioErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            id: 'define-passenger-age-range',
            content: 'Do child passengers have an age range?',
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'Yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                },
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        name: 'ageRangeMin',
                        label: 'Minimum Age (if applicable)',
                        defaultValue: '',
                    },
                    {
                        id: 'age-range-max',
                        name: 'ageRangeMax',
                        label: 'Maximum Age (if applicable)',
                        defaultValue: '',
                    },
                ],
                inputErrors: [],
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: [
            {
                errorMessage: 'Choose one of the options below',
                id: 'age-range-required',
            },
        ],
    },
    {
        heading: {
            id: 'define-passenger-proof',
            content: 'Do child passengers require a proof document?',
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'Yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select the applicable proof document(s).',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'membership-card',
                        name: 'proofDocuments',
                        label: 'Membership Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'student-card',
                        name: 'proofDocuments',
                        label: 'Student Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'identity-document',
                        name: 'proofDocuments',
                        label: 'Identity Document',
                        defaultChecked: false,
                    },
                ],
                inputErrors: [],
            },
            { id: 'proof-not-required', name: 'proof', value: 'No', label: 'No' },
        ],
        radioError: [
            {
                errorMessage: 'Choose one of the options below',
                id: 'proof-required',
            },
        ],
    },
];

export const mockCombinedErrorInfoForRadioErrors: ErrorInfo[] = [
    {
        errorMessage: 'Choose one of the options below',
        id: 'define-passenger-age-range',
    },
    {
        errorMessage: 'Choose one of the options below',
        id: 'define-passenger-proof',
    },
];

export const mockDefinePassengerTypeFieldsetsWithInputErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            id: 'define-passenger-age-range',
            content: 'Do child passengers have an age range?',
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'Yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                },
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        name: 'ageRangeMin',
                        label: 'Minimum Age (if applicable)',
                        defaultValue: '',
                    },
                    {
                        id: 'age-range-max',
                        name: 'ageRangeMax',
                        label: 'Maximum Age (if applicable)',
                        defaultValue: '',
                    },
                ],
                inputErrors: [
                    {
                        errorMessage: 'Enter a minimum or maximum age',
                        id: 'age-range-min',
                    },
                    {
                        errorMessage: 'Enter a minimum or maximum age',
                        id: 'age-range-max',
                    },
                ],
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: [],
    },
    {
        heading: {
            id: 'define-passenger-proof',
            content: 'Do child passengers require a proof document?',
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'Yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select the applicable proof document(s).',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'membership-card',
                        name: 'proofDocuments',
                        label: 'Membership Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'student-card',
                        name: 'proofDocuments',
                        label: 'Student Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'identity-document',
                        name: 'proofDocuments',
                        label: 'Identity Document',
                        defaultChecked: false,
                    },
                ],
                inputErrors: [
                    {
                        errorMessage: 'Select at least one proof document',
                        id: 'membership-card',
                    },
                ],
            },
            { id: 'proof-not-required', name: 'proof', value: 'No', label: 'No' },
        ],
        radioError: [],
    },
];

export const mockPassengerTypeInputErrors: ErrorInfo[] = [
    {
        errorMessage: 'Enter a minimum or maximum age',
        id: 'define-passenger-age-range',
    },
    {
        errorMessage: 'Enter a minimum or maximum age',
        id: 'define-passenger-age-range',
    },
    {
        errorMessage: 'Select at least one proof document',
        id: 'define-passenger-proof',
    },
];

export const mockAdultServerSideProps: RadioConditionalInputFieldset[] = [
    {
        heading: { content: 'Do adult passengers have an age range?', id: 'define-passenger-age-range' },
        radioError: [],
        radios: [
            {
                dataAriaControls: 'age-range-required-conditional',
                inputHint: {
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                    id: 'define-passenger-age-range-hint',
                },
                id: 'age-range-required',
                inputErrors: [],
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        label: 'Minimum Age (if applicable)',
                        name: 'ageRangeMin',
                        defaultValue: '',
                    },
                    {
                        id: 'age-range-max',
                        label: 'Maximum Age (if applicable)',
                        name: 'ageRangeMax',
                        defaultValue: '',
                    },
                ],
                label: 'Yes',
                name: 'ageRange',
                value: 'Yes',
            },
            { id: 'age-range-not-required', label: 'No', name: 'ageRange', value: 'No' },
        ],
    },
];

export const mockDefinePassengerTypeFieldsetsWithRadioAndInputErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            id: 'define-passenger-age-range',
            content: expect.any(String),
        },
        radios: [
            {
                id: 'age-range-required',
                name: 'ageRange',
                value: 'Yes',
                dataAriaControls: 'age-range-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-age-range-hint',
                    content: 'Enter a minimum and/or maximum age for this passenger type.',
                },
                inputType: 'text',
                inputs: [
                    {
                        id: 'age-range-min',
                        name: 'ageRangeMin',
                        label: 'Minimum Age (if applicable)',
                        defaultValue: '',
                    },
                    {
                        id: 'age-range-max',
                        name: 'ageRangeMax',
                        label: 'Maximum Age (if applicable)',
                        defaultValue: '',
                    },
                ],
                inputErrors: [
                    {
                        errorMessage: 'Enter a minimum or maximum age',
                        id: 'age-range-min',
                    },
                    {
                        errorMessage: 'Enter a minimum or maximum age',
                        id: 'age-range-max',
                    },
                ],
            },
            {
                id: 'age-range-not-required',
                name: 'ageRange',
                value: 'No',
                label: 'No',
            },
        ],
        radioError: [],
    },
    {
        heading: {
            id: 'define-passenger-proof',
            content: expect.any(String),
        },
        radios: [
            {
                id: 'proof-required',
                name: 'proof',
                value: 'Yes',
                dataAriaControls: 'proof-required-conditional',
                label: 'Yes',
                inputHint: {
                    id: 'define-passenger-proof-hint',
                    content: 'Select the applicable proof document(s).',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'membership-card',
                        name: 'proofDocuments',
                        label: 'Membership Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'student-card',
                        name: 'proofDocuments',
                        label: 'Student Card',
                        defaultChecked: false,
                    },
                    {
                        id: 'identity-document',
                        name: 'proofDocuments',
                        label: 'Identity Document',
                        defaultChecked: false,
                    },
                ],
                inputErrors: [],
            },
            { id: 'proof-not-required', name: 'proof', value: 'No', label: 'No' },
        ],
        radioError: [],
    },
];

export const mockDefineTimeRestrictionsFieldsets: RadioConditionalInputFieldset[] = [
    {
        heading: {
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
            id: 'define-valid-days',
        },
        radioError: [],
        radios: [
            {
                id: 'valid-days-required',
                name: 'timeRestrictionChoice',
                value: 'Yes',
                dataAriaControls: 'valid-days-required-conditional',
                label: 'Yes - define new time restriction',
                inputHint: {
                    id: 'define-valid-days-inputHint',
                    content: 'Select the days of the week the ticket is valid for',
                },
                inputType: 'checkbox',
                inputs: [
                    {
                        id: 'monday',
                        name: 'validDays',
                        label: 'Monday',
                        defaultChecked: false,
                    },
                    {
                        id: 'tuesday',
                        name: 'validDays',
                        label: 'Tuesday',
                        defaultChecked: false,
                    },
                    {
                        id: 'wednesday',
                        name: 'validDays',
                        label: 'Wednesday',
                        defaultChecked: false,
                    },
                    {
                        id: 'thursday',
                        name: 'validDays',
                        label: 'Thursday',
                        defaultChecked: false,
                    },
                    {
                        id: 'friday',
                        name: 'validDays',
                        label: 'Friday',
                        defaultChecked: false,
                    },
                    {
                        id: 'saturday',
                        name: 'validDays',
                        label: 'Saturday',
                        defaultChecked: false,
                    },
                    {
                        id: 'sunday',
                        name: 'validDays',
                        label: 'Sunday',
                        defaultChecked: false,
                    },
                    {
                        id: 'bankHoliday',
                        name: 'validDays',
                        label: 'Bank holiday',
                        defaultChecked: false,
                    },
                ],
                inputErrors: [],
            },

            {
                id: 'premade-time-restriction-yes',
                name: 'timeRestrictionChoice',
                value: 'Premade',
                label: 'Yes - reuse a saved time restriction',
                inputHint: {
                    id: 'choose-time-restriction-hint',
                    content: 'Select a saved time restriction to use',
                },
                inputType: 'dropdown',
                dataAriaControls: 'premade-time-restriction',
                inputs: [
                    {
                        id: 'premade-time-restriction-0',
                        name: 'Test Time restriction',
                        label: 'Test Time restriction',
                    },
                ],
                inputErrors: [],
                selectIdentifier: 'timeRestriction',
            },
            {
                id: 'valid-days-not-required',
                name: 'timeRestrictionChoice',
                value: 'No',
                label: 'No',
            },
        ],
    },
];

export const mockDefineTimeRestrictionsFieldsetsWithoutPremade: RadioConditionalInputFieldset[] = [
    {
        heading: {
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
            id: 'define-valid-days',
        },
        radioError: [],
        radios: [
            {
                dataAriaControls: 'valid-days-required-conditional',
                inputHint: {
                    content: 'Select the days of the week the ticket is valid for',
                    id: 'define-valid-days-inputHint',
                },
                id: 'valid-days-required',
                inputErrors: [],
                inputType: 'checkbox',
                inputs: [
                    { id: 'monday', label: 'Monday', name: 'validDays', defaultChecked: false },
                    { id: 'tuesday', label: 'Tuesday', name: 'validDays', defaultChecked: false },
                    { id: 'wednesday', label: 'Wednesday', name: 'validDays', defaultChecked: false },
                    { id: 'thursday', label: 'Thursday', name: 'validDays', defaultChecked: false },
                    { id: 'friday', label: 'Friday', name: 'validDays', defaultChecked: false },
                    { id: 'saturday', label: 'Saturday', name: 'validDays', defaultChecked: false },
                    { id: 'sunday', label: 'Sunday', name: 'validDays', defaultChecked: false },
                    { id: 'bankHoliday', label: 'Bank holiday', name: 'validDays', defaultChecked: false },
                ],
                label: 'Yes',
                name: 'timeRestrictionChoice',
                value: 'Yes',
            },
            { id: 'valid-days-not-required', label: 'No', name: 'timeRestrictionChoice', value: 'No' },
        ],
    },
];

export const mockDefineTimeRestrictionsFieldsetsWithRadioErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
            id: 'define-valid-days',
        },
        radioError: [{ errorMessage: 'Choose one of the options below', id: 'valid-days-required' }],
        radios: [
            {
                dataAriaControls: 'valid-days-required-conditional',
                inputHint: {
                    content: 'Select the days of the week the ticket is valid for',
                    id: 'define-valid-days-inputHint',
                },
                id: 'valid-days-required',
                inputErrors: [],
                inputType: 'checkbox',
                inputs: [
                    { id: 'monday', label: 'Monday', name: 'validDays', defaultChecked: false },
                    { id: 'tuesday', label: 'Tuesday', name: 'validDays', defaultChecked: false },
                    { id: 'wednesday', label: 'Wednesday', name: 'validDays', defaultChecked: false },
                    { id: 'thursday', label: 'Thursday', name: 'validDays', defaultChecked: false },
                    { id: 'friday', label: 'Friday', name: 'validDays', defaultChecked: false },
                    { id: 'saturday', label: 'Saturday', name: 'validDays', defaultChecked: false },
                    { id: 'sunday', label: 'Sunday', name: 'validDays', defaultChecked: false },
                    { id: 'bankHoliday', label: 'Bank holiday', name: 'validDays', defaultChecked: false },
                ],
                label: 'Yes',
                name: 'timeRestrictionChoice',
                value: 'Yes',
            },
            { id: 'valid-days-not-required', label: 'No', name: 'timeRestrictionChoice', value: 'No' },
        ],
    },
];

export const mockTimeRestrictionsRadioErrors: ErrorInfo[] = [
    { errorMessage: 'Choose one of the options below', id: 'valid-days-required' },
];

export const mockDefineTimeRestrictionsFieldsetsWithInputErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
            id: 'define-valid-days',
        },
        radioError: [],
        radios: [
            {
                dataAriaControls: 'valid-days-required-conditional',
                inputHint: {
                    content: 'Select the days of the week the ticket is valid for',
                    id: 'define-valid-days-inputHint',
                },
                id: 'valid-days-required',
                inputErrors: [{ errorMessage: 'Select at least one day', id: 'monday' }],
                inputType: 'checkbox',
                inputs: [
                    { id: 'monday', label: 'Monday', name: 'validDays', defaultChecked: true },
                    { id: 'tuesday', label: 'Tuesday', name: 'validDays', defaultChecked: true },
                    { id: 'wednesday', label: 'Wednesday', name: 'validDays', defaultChecked: false },
                    { id: 'thursday', label: 'Thursday', name: 'validDays', defaultChecked: false },
                    { id: 'friday', label: 'Friday', name: 'validDays', defaultChecked: false },
                    { id: 'saturday', label: 'Saturday', name: 'validDays', defaultChecked: false },
                    { id: 'sunday', label: 'Sunday', name: 'validDays', defaultChecked: false },
                    { id: 'bankHoliday', label: 'Bank holiday', name: 'validDays', defaultChecked: false },
                ],
                label: 'Yes',
                name: 'timeRestrictionChoice',
                value: 'Yes',
            },
            { id: 'valid-days-not-required', label: 'No', name: 'timeRestrictionChoice', value: 'No' },
        ],
    },
];

export const mockTimeRestrictionsInputErrors: ErrorInfo[] = [
    {
        id: 'start-time',
        errorMessage: 'Enter a start time in a valid 24 hour format between 0000 - 2300',
    },
    {
        id: 'end-time',
        errorMessage: 'Enter an end time in a valid 24 hour format between 0000 - 2300',
    },
    {
        id: 'monday',
        errorMessage: 'Select at least one day',
    },
];

export const mockDefineTimeRestrictionsFieldsetsWithRadioAndInputErrors: RadioConditionalInputFieldset[] = [
    {
        heading: {
            content: 'Is this ticket only valid on certain days or times?',
            hidden: true,
            id: 'define-valid-days',
        },
        radioError: [{ errorMessage: 'Choose one of the options below', id: 'valid-days-required' }],
        radios: [
            {
                dataAriaControls: 'valid-days-required-conditional',
                inputHint: {
                    content: 'Select the days of the week the ticket is valid for',
                    id: 'define-valid-days-inputHint',
                },
                id: 'valid-days-required',
                inputErrors: [],
                inputType: 'checkbox',
                inputs: [
                    { id: 'monday', label: 'Monday', name: 'validDays', defaultChecked: false },
                    { id: 'tuesday', label: 'Tuesday', name: 'validDays', defaultChecked: false },
                    { id: 'wednesday', label: 'Wednesday', name: 'validDays', defaultChecked: false },
                    { id: 'thursday', label: 'Thursday', name: 'validDays', defaultChecked: false },
                    { id: 'friday', label: 'Friday', name: 'validDays', defaultChecked: false },
                    { id: 'saturday', label: 'Saturday', name: 'validDays', defaultChecked: false },
                    { id: 'sunday', label: 'Sunday', name: 'validDays', defaultChecked: false },
                    { id: 'bankHoliday', label: 'Bank holiday', name: 'validDays', defaultChecked: false },
                ],
                label: 'Yes',
                name: 'timeRestrictionChoice',
                value: 'Yes',
            },
            { id: 'valid-days-not-required', label: 'No', name: 'timeRestrictionChoice', value: 'No' },
        ],
    },
];

export const mockTimeRestrictionsRadioAndInputErrors: ErrorInfo[] = [
    {
        id: 'valid-days-required',
        errorMessage: 'Choose one of the options below',
    },
    {
        id: 'start-time',
        errorMessage: 'Enter a start time in a valid 24 hour format between 0000 - 2300',
    },
    {
        id: 'end-time',
        errorMessage: 'Enter an end time in a valid 24 hour format between 0000 - 2300',
    },
];

export const mockReturnValidityFieldset: RadioConditionalInputFieldset = {
    heading: {
        id: 'define-return-validity',
        content: 'Is the return part of this ticket valid for more than one day?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            defaultChecked: false,
            label: 'Yes',
            inputHint: {
                id: 'define-return-validity-hint',
                content: 'Enter a number and select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Number',
                    defaultValue: '',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['day', 'week', 'month', 'year'],
                    defaultValue: '',
                },
            ],
            inputErrors: [],
        },
        {
            defaultChecked: true,
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockReturnValidityFieldsetWithTextInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'define-return-validity',
        content: 'Is the return part of this ticket valid for more than one day?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            defaultChecked: false,
            label: 'Yes',
            inputHint: {
                id: 'define-return-validity-hint',
                content: 'Enter a number and select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Number',
                    defaultValue: '',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['day', 'week', 'month', 'year'],
                    defaultValue: '',
                },
            ],
            inputErrors: [{ errorMessage: 'Enter a whole number greater than zero', id: 'return-validity-amount' }],
        },
        {
            defaultChecked: true,
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockReturnValidityFieldsetWithDropdownInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'define-return-validity',
        content: 'Is the return part of this ticket valid for more than one day?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            defaultChecked: false,
            label: 'Yes',
            inputHint: {
                id: 'define-return-validity-hint',
                content: 'Enter a number and select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Number',
                    defaultValue: '',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['day', 'week', 'month', 'year'],
                    defaultValue: '',
                },
            ],
            inputErrors: [
                { errorMessage: 'Choose one of the options from the dropdown list', id: 'return-validity-units' },
            ],
        },
        {
            defaultChecked: true,
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockReturnValidityFieldsetWithTextAndDropdownInputErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'define-return-validity',
        content: 'Is the return part of this ticket valid for more than one day?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            defaultChecked: false,
            label: 'Yes',
            inputHint: {
                id: 'define-return-validity-hint',
                content: 'Enter a number and select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Number',
                    defaultValue: '',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['day', 'week', 'month', 'year'],
                    defaultValue: '',
                },
            ],
            inputErrors: [
                { errorMessage: 'Enter a whole number greater than zero', id: 'return-validity-amount' },
                { errorMessage: 'Choose one of the options from the dropdown list', id: 'return-validity-units' },
            ],
        },
        {
            defaultChecked: true,
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockReturnValidityFieldsetWithRadioErrors: RadioConditionalInputFieldset = {
    heading: {
        id: 'define-return-validity',
        content: 'Is the return part of this ticket valid for more than one day?',
        hidden: true,
    },
    radios: [
        {
            id: 'return-validity-defined',
            name: 'validity',
            value: 'Yes',
            dataAriaControls: 'return-validity-defined-conditional',
            defaultChecked: false,
            label: 'Yes',
            inputHint: {
                id: 'define-return-validity-hint',
                content: 'Enter a number and select a duration from the dropdown',
            },
            inputType: 'textWithUnits',
            inputs: [
                {
                    id: 'return-validity-amount',
                    name: 'amount',
                    label: 'Number',
                    defaultValue: '',
                },
                {
                    id: 'return-validity-units',
                    name: 'duration',
                    label: 'Duration',
                    options: ['day', 'week', 'month', 'year'],
                    defaultValue: '',
                },
            ],
            inputErrors: [],
        },
        {
            defaultChecked: true,
            id: 'return-validity-not-defined',
            name: 'validity',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [{ errorMessage: 'Choose one of the options below', id: 'return-validity-defined' }],
};

export const mockFullTimeRestrictionAttribute: FullTimeRestrictionAttribute = {
    fullTimeRestrictions: mockFullTimeRestriction,
    errors: [],
    id: 2,
};

export const mockFieldSetForReuseOperatorGroup: RadioConditionalInputFieldset = {
    heading: {
        id: 'reuse-operator-group-heading',
        content: 'Do you want to reuse a saved operator group?',
        hidden: true,
    },
    radios: [
        {
            id: 'reuse-operator-group-yes',
            name: 'reuseGroupChoice',
            value: 'Yes',
            label: 'Yes',
            inputHint: {
                id: 'choose-time-restriction-hint',
                content: 'Select an operator group from the dropdown',
                hidden: true,
            },
            inputType: 'dropdown',
            dataAriaControls: 'reuse-operator-group',
            inputs: [{ id: 'operator-group-0', name: 'Best Ops', label: 'Best Ops' }],
            inputErrors: [],
            selectIdentifier: 'premadeOperatorGroup',
        },
        {
            id: 'reuse-operator-group-no',
            name: 'reuseGroupChoice',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockFieldSetForReuseOperatorGroupWithErrorsIfRadioNotSelected: RadioConditionalInputFieldset = {
    heading: {
        id: 'reuse-operator-group-heading',
        content: 'Do you want to reuse a saved operator group?',
        hidden: true,
    },
    radios: [
        {
            id: 'reuse-operator-group-yes',
            name: 'reuseGroupChoice',
            value: 'Yes',
            label: 'Yes',
            inputHint: {
                id: 'choose-time-restriction-hint',
                content: 'Select an operator group from the dropdown',
                hidden: true,
            },
            inputType: 'dropdown',
            dataAriaControls: 'reuse-operator-group',
            inputs: [{ id: 'operator-group-0', name: 'Best Ops', label: 'Best Ops' }],
            inputErrors: [],
            selectIdentifier: 'premadeOperatorGroup',
        },
        {
            id: 'reuse-operator-group-no',
            name: 'reuseGroupChoice',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [
        {
            errorMessage: 'Choose one of the options below',
            id: 'conditional-form-group',
        },
    ],
};

export const mockFieldSetForReuseOperatorGroupWithErrorsIfOptionNotSelected: RadioConditionalInputFieldset = {
    heading: {
        id: 'reuse-operator-group-heading',
        content: 'Do you want to reuse a saved operator group?',
        hidden: true,
    },
    radios: [
        {
            id: 'reuse-operator-group-yes',
            name: 'reuseGroupChoice',
            value: 'Yes',
            label: 'Yes',
            inputHint: {
                id: 'choose-time-restriction-hint',
                content: 'Select an operator group from the dropdown',
                hidden: true,
            },
            inputType: 'dropdown',
            dataAriaControls: 'reuse-operator-group',
            inputs: [{ id: 'operator-group-0', name: 'Best Ops', label: 'Best Ops' }],
            inputErrors: [
                {
                    errorMessage: 'Choose a premade operator group from the options below',
                    id: 'premadeOperatorGroup',
                },
            ],
            selectIdentifier: 'premadeOperatorGroup',
        },
        {
            id: 'reuse-operator-group-no',
            name: 'reuseGroupChoice',
            value: 'No',
            label: 'No',
        },
    ],
    radioError: [],
};

export const mockDataOperatorGroup: OperatorGroup = {
    id: 1,
    name: 'Regular Child',
    operators: [
        {
            name: 'First operator',
            nocCode: 'FOP',
        },
    ],
};

export const mockDataSplitOutProducts = [
    {
        carnet: undefined,
        email: 'test@example.com',
        nocCode: 'TEST',
        operatorName: 'test',
        passengerType: { id: 9 },
        products: [
            {
                carnetDetails: undefined,
                productDuration: '5 weeks',
                productName: 'Weekly Ticket',
                productPrice: '50',
                productValidity: '24hr',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
            },
        ],
        stops: [
            {
                atcoCode: '13003305E',
                indicator: 'S-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmja',
                parentLocalityName: 'IW Test',
                stopName: 'Westlea shops',
                street: 'B1285 Stockton Road',
            },
            {
                atcoCode: '13003622B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgtm',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue Shops',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003655B',
                indicator: 'B',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjwd',
                parentLocalityName: 'IW Test',
                stopName: 'Interchange Stand B',
                street: 'South Crescent',
            },
            {
                atcoCode: '13003635B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjga',
                parentLocalityName: 'IW Test',
                stopName: 'Adolphus Place',
                street: 'South Terrace',
            },
            {
                atcoCode: '13003618B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgpt',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue - Essex Crescent',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003612D',
                indicator: 'SE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgma',
                parentLocalityName: 'IW Test',
                stopName: 'New Strangford Road',
                street: 'New Stranford Road',
            },
            {
                atcoCode: '13003611B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgjt',
                parentLocalityName: 'IW Test',
                stopName: 'New Tempest Road - York House',
                street: 'Tempest Road',
            },
            {
                atcoCode: '13003306B',
                indicator: 'NE-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmjg',
                parentLocalityName: 'IW Test',
                stopName: 'Mount Pleasant',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003949C',
                indicator: 'E-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgawmt',
                parentLocalityName: 'IW Test',
                stopName: 'Viceroy Street',
                street: 'Viceroy street',
            },
            {
                atcoCode: '13003609E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgdt',
                parentLocalityName: 'IW Test',
                stopName: 'Vane Terrace - Castlereagh',
                street: 'Vane Terrace',
            },
            {
                atcoCode: '13003921A',
                indicator: 'N-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durgawjp',
                parentLocalityName: 'IW Test',
                stopName: 'Estate Hail and Ride',
                street: 'Windermere Road',
            },
            {
                atcoCode: '13003923B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawagw',
                parentLocalityName: 'IW Test',
                stopName: 'Kingston Avenue',
                street: 'Kingston Avenue',
            },
            {
                atcoCode: '13003625C',
                indicator: 'E-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgwg',
                parentLocalityName: 'IW Test',
                stopName: 'Park',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003939H',
                indicator: 'NW-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawamp',
                parentLocalityName: 'IW Test',
                stopName: 'Laurel Avenue',
                street: 'Laurel Avenue',
            },
            {
                atcoCode: '13003661E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgapwp',
                parentLocalityName: 'IW Test',
                stopName: 'Sophia Street',
                street: 'Sophia Street',
            },
        ],
        ticketPeriod: { endDate: '2020-12-18T09:30:46.0Z', startDate: '2020-12-17T09:30:46.0Z' },
        timeRestriction: { id: 2 },
        type: 'period',
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        zoneName: 'Green Lane Shops',
    },
    {
        carnet: undefined,
        email: 'test@example.com',
        nocCode: 'TEST',
        operatorName: 'test',
        passengerType: { id: 9 },
        products: [
            {
                carnetDetails: undefined,
                productDuration: '1 year',
                productName: 'Day Ticket',
                productPrice: '2.50',
                productValidity: '24hr',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
            },
        ],
        stops: [
            {
                atcoCode: '13003305E',
                indicator: 'S-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmja',
                parentLocalityName: 'IW Test',
                stopName: 'Westlea shops',
                street: 'B1285 Stockton Road',
            },
            {
                atcoCode: '13003622B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgtm',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue Shops',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003655B',
                indicator: 'B',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjwd',
                parentLocalityName: 'IW Test',
                stopName: 'Interchange Stand B',
                street: 'South Crescent',
            },
            {
                atcoCode: '13003635B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjga',
                parentLocalityName: 'IW Test',
                stopName: 'Adolphus Place',
                street: 'South Terrace',
            },
            {
                atcoCode: '13003618B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgpt',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue - Essex Crescent',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003612D',
                indicator: 'SE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgma',
                parentLocalityName: 'IW Test',
                stopName: 'New Strangford Road',
                street: 'New Stranford Road',
            },
            {
                atcoCode: '13003611B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgjt',
                parentLocalityName: 'IW Test',
                stopName: 'New Tempest Road - York House',
                street: 'Tempest Road',
            },
            {
                atcoCode: '13003306B',
                indicator: 'NE-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmjg',
                parentLocalityName: 'IW Test',
                stopName: 'Mount Pleasant',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003949C',
                indicator: 'E-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgawmt',
                parentLocalityName: 'IW Test',
                stopName: 'Viceroy Street',
                street: 'Viceroy street',
            },
            {
                atcoCode: '13003609E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgdt',
                parentLocalityName: 'IW Test',
                stopName: 'Vane Terrace - Castlereagh',
                street: 'Vane Terrace',
            },
            {
                atcoCode: '13003921A',
                indicator: 'N-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durgawjp',
                parentLocalityName: 'IW Test',
                stopName: 'Estate Hail and Ride',
                street: 'Windermere Road',
            },
            {
                atcoCode: '13003923B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawagw',
                parentLocalityName: 'IW Test',
                stopName: 'Kingston Avenue',
                street: 'Kingston Avenue',
            },
            {
                atcoCode: '13003625C',
                indicator: 'E-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgwg',
                parentLocalityName: 'IW Test',
                stopName: 'Park',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003939H',
                indicator: 'NW-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawamp',
                parentLocalityName: 'IW Test',
                stopName: 'Laurel Avenue',
                street: 'Laurel Avenue',
            },
            {
                atcoCode: '13003661E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgapwp',
                parentLocalityName: 'IW Test',
                stopName: 'Sophia Street',
                street: 'Sophia Street',
            },
        ],
        ticketPeriod: { endDate: '2020-12-18T09:30:46.0Z', startDate: '2020-12-17T09:30:46.0Z' },
        timeRestriction: { id: 2 },
        type: 'period',
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        zoneName: 'Green Lane Shops',
    },
    {
        carnet: undefined,
        email: 'test@example.com',
        nocCode: 'TEST',
        operatorName: 'test',
        passengerType: { id: 9 },
        products: [
            {
                carnetDetails: undefined,
                productDuration: '28 months',
                productName: 'Monthly Ticket',
                productPrice: '200',
                productValidity: '24hr',
                salesOfferPackages: [
                    {
                        id: 1,
                        price: undefined,
                    },
                    {
                        id: 2,
                        price: undefined,
                    },
                ],
            },
        ],
        stops: [
            {
                atcoCode: '13003305E',
                indicator: 'S-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmja',
                parentLocalityName: 'IW Test',
                stopName: 'Westlea shops',
                street: 'B1285 Stockton Road',
            },
            {
                atcoCode: '13003622B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgtm',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue Shops',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003655B',
                indicator: 'B',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjwd',
                parentLocalityName: 'IW Test',
                stopName: 'Interchange Stand B',
                street: 'South Crescent',
            },
            {
                atcoCode: '13003635B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratjga',
                parentLocalityName: 'IW Test',
                stopName: 'Adolphus Place',
                street: 'South Terrace',
            },
            {
                atcoCode: '13003618B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgpt',
                parentLocalityName: 'IW Test',
                stopName: 'The Avenue - Essex Crescent',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003612D',
                indicator: 'SE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgma',
                parentLocalityName: 'IW Test',
                stopName: 'New Strangford Road',
                street: 'New Stranford Road',
            },
            {
                atcoCode: '13003611B',
                indicator: 'NE-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgjt',
                parentLocalityName: 'IW Test',
                stopName: 'New Tempest Road - York House',
                street: 'Tempest Road',
            },
            {
                atcoCode: '13003306B',
                indicator: 'NE-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durapmjg',
                parentLocalityName: 'IW Test',
                stopName: 'Mount Pleasant',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003949C',
                indicator: 'E-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgawmt',
                parentLocalityName: 'IW Test',
                stopName: 'Viceroy Street',
                street: 'Viceroy street',
            },
            {
                atcoCode: '13003609E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'duratgdt',
                parentLocalityName: 'IW Test',
                stopName: 'Vane Terrace - Castlereagh',
                street: 'Vane Terrace',
            },
            {
                atcoCode: '13003921A',
                indicator: 'N-bound',
                localityCode: 'N0077347',
                localityName: 'New Seaham',
                naptanCode: 'durgawjp',
                parentLocalityName: 'IW Test',
                stopName: 'Estate Hail and Ride',
                street: 'Windermere Road',
            },
            {
                atcoCode: '13003923B',
                indicator: 'NE-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawagw',
                parentLocalityName: 'IW Test',
                stopName: 'Kingston Avenue',
                street: 'Kingston Avenue',
            },
            {
                atcoCode: '13003625C',
                indicator: 'E-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'duratgwg',
                parentLocalityName: 'IW Test',
                stopName: 'Park',
                street: 'The Avenue',
            },
            {
                atcoCode: '13003939H',
                indicator: 'NW-bound',
                localityCode: 'E0010170',
                localityName: 'Deneside',
                naptanCode: 'durawamp',
                parentLocalityName: 'IW Test',
                stopName: 'Laurel Avenue',
                street: 'Laurel Avenue',
            },
            {
                atcoCode: '13003661E',
                indicator: 'S-bound',
                localityCode: 'E0045957',
                localityName: 'Seaham',
                naptanCode: 'durgapwp',
                parentLocalityName: 'IW Test',
                stopName: 'Sophia Street',
                street: 'Sophia Street',
            },
        ],
        ticketPeriod: { endDate: '2020-12-18T09:30:46.0Z', startDate: '2020-12-17T09:30:46.0Z' },
        timeRestriction: { id: 2 },
        type: 'period',
        uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        zoneName: 'Green Lane Shops',
    },
];

export const mockServicesToDisplay: ServiceToDisplay[] = [
    {
        lineId: 'e2f23fq',
        origin: 'Town',
        destination: 'Football Stadium',
        lineName: '2a',
    },
    {
        lineId: '32rf2cvwe',
        origin: 'College',
        destination: 'Shops',
        lineName: '44',
    },
    {
        lineId: 'aweff3r323',
        origin: 'Leeds',
        destination: 'Bradford',
        lineName: '11b',
    },
];

export const mockPointToPointProducts: ProductToDisplay[] = [
    {
        id: 4,
        productName: 'Adult single',
        startDate: '01/02/2022',
        fareType: 'single',
        schoolTicket: false,
        serviceLineId: 'e2f23fq',
        direction: 'outbound',
    },
    {
        id: 5,
        productName: 'Student return',
        startDate: '02/02/2022',
        fareType: 'return',
        schoolTicket: false,
        serviceLineId: '32rf2cvwe',
        direction: 'inbound',
    },
    {
        id: 6,
        productName: 'Saver ticket',
        startDate: '02/02/2022',
        fareType: 'single',
        schoolTicket: false,
        serviceLineId: 'aweff3r323',
        direction: 'inbound',
    },
];

export const mockOtherProducts: ProductToDisplay[] = [
    {
        id: 1,
        productName: 'Best product',
        startDate: '01/02/2022',
        fareType: 'period',
        schoolTicket: false,
        serviceLineId: null,
        direction: null,
    },
    {
        id: 2,
        productName: 'Super product',
        startDate: '02/02/2022',
        fareType: 'flatFare',
        schoolTicket: false,
        serviceLineId: null,
        direction: null,
    },
    {
        id: 3,
        productName: 'Super product',
        startDate: '02/02/2022',
        fareType: 'multiOperator',
        schoolTicket: false,
        serviceLineId: null,
        direction: null,
    },
];

export const mockMultiOperatorExtProducts: Omit<MultiOperatorProductExternal, 'passengerType'>[] = [
    {
        id: 1,
        incomplete: false,
        productDescription: 'Best product',
        duration: '1 month',
        startDate: '01/02/2022',
        endDate: '01/03/2022',
    },
    {
        id: 2,
        incomplete: false,
        productDescription: 'Super product',
        duration: '1 week',
        startDate: '02/02/2022',
        endDate: '09/02/2022',
    },
    {
        id: 3,
        incomplete: false,
        productDescription: 'Saver product',
        duration: '1 year',
        startDate: '01/01/2022',
        endDate: '01/01/2023',
    },
];

export const mockMultiOperatorExternalPeriodServicesProduct: WithIds<MultiOperatorMultipleServicesTicket> = {
    additionalOperators: [
        {
            nocCode: 'TEST',
            selectedServices: [],
        },
        {
            nocCode: 'NWBT',
            selectedServices: [],
        },
    ],
    carnet: false,
    email: 'test@example.com',
    nocCode: 'BLAC',
    operatorGroupId: 1,
    operatorName: 'Test Operator',
    passengerType: {
        id: 3,
    },
    products: [
        {
            productName: 'MOBE-services-1',
            productPrice: '1.23',
            productDuration: '1 month',
            productValidity: '1 month',
            salesOfferPackages: [
                {
                    id: 1,
                    price: '1.23',
                },
            ],
        },
    ],
    selectedServices: [
        {
            lineId: '4YyoI0',
            lineName: '1',
            serviceCode: 'NW_05_BLAC_1_1',
            serviceDescription: 'FLEETWOOD - BLACKPOOL via Promenade',
            startDate: '01-01-2025',
        },
        {
            lineId: 'YpQjUw',
            lineName: '2',
            serviceCode: 'NW_05_BLAC_2_1',
            serviceDescription: 'POULTON - BLACKPOOL via Victoria Hospital Outpatients',
            startDate: '01-01-2025',
        },
        {
            lineId: 'vySmfewe0',
            lineName: '2C',
            serviceCode: 'NW_05_BLAC_2C_1',
            serviceDescription: 'KNOTT END - POULTON - BLACKPOOL',
            startDate: '01-01-2025',
        },
    ],
    termTime: false,
    ticketPeriod: {
        startDate: '2025-01-01T00:00:00.000Z',
    },
    type: 'multiOperatorExt',
    uuid: 'BLACc90fe5a8',
};

export const selections = {
    option0: [
        'Acomb Green Lane',
        '{"stop":{"stopName":"Yoden Way - Chapel Hill Road","naptanCode":"duratdmj","atcoCode":"13003521G","localityCode":"E0045956","localityName":"Peterlee","indicator":"W-bound","street":"Yodan Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Acomb Green Lane"}',
    ],
    option1: [
        'Mattison Way',
        '{"stop":{"stopName":"Yoden Way","naptanCode":"duratdmt","atcoCode":"13003522F","localityCode":"E0010183","localityName":"Horden","indicator":"SW-bound","street":"Yoden Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Mattison Way"}',
    ],
    option2: [
        'Holl Bank/Beech Ave',
        '{"stop":{"stopName":"Surtees Rd-Edenhill Rd","naptanCode":"durapgdw","atcoCode":"13003219H","localityCode":"E0045956","localityName":"Peterlee","indicator":"NW-bound","street":"Surtees Road","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Holl Bank/Beech Ave"}',
    ],
    option3: [
        'Blossom Street',
        '{"stop":{"stopName":"Bus Station","naptanCode":"duratdma","atcoCode":"13003519H","localityCode":"E0045956","localityName":"Peterlee","indicator":"H","street":"Bede Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Blossom Street"}',
    ],
    option4: [
        'Piccadilly (York)',
        '{"stop":{"stopName":"Kell Road","naptanCode":"duraptwp","atcoCode":"13003345D","localityCode":"E0010183","localityName":"Horden","indicator":"SE-bound","street":"Kell Road","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Piccadilly (York)"}',
    ],
};

export const selectedOptionsWithAnUnassignedStop = {
    option0: [
        'Acomb Green Lane',
        '{"stop":{"stopName":"Yoden Way - Chapel Hill Road","naptanCode":"duratdmj","atcoCode":"13003521G","localityCode":"E0045956","localityName":"Peterlee","indicator":"W-bound","street":"Yodan Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Acomb Green Lane"}',
    ],
    option1: [
        'Mattison Way',
        '{"stop":{"stopName":"Yoden Way","naptanCode":"duratdmt","atcoCode":"13003522F","localityCode":"E0010183","localityName":"Horden","indicator":"SW-bound","street":"Yoden Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Mattison Way"}',
    ],
    option2: [
        'Holl Bank/Beech Ave',
        '{"stop":{"stopName":"Surtees Rd-Edenhill Rd","naptanCode":"durapgdw","atcoCode":"13003219H","localityCode":"E0045956","localityName":"Peterlee","indicator":"NW-bound","street":"Surtees Road","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Holl Bank/Beech Ave"}',
    ],
    option3: [
        'Blossom Street',
        '{"stop":{"stopName":"Bus Station","naptanCode":"duratdma","atcoCode":"13003519H","localityCode":"E0045956","localityName":"Peterlee","indicator":"H","street":"Bede Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Blossom Street"}',
    ],
    option4: [
        'Piccadilly (York)',
        '{"stop":{"stopName":"Kell Road","naptanCode":"duraptwp","atcoCode":"13003345D","localityCode":"E0010183","localityName":"Horden","indicator":"SE-bound","street":"Kell Road","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Piccadilly (York)"}',
    ],
    option5:
        '{"stopName":"Cresswood Avenue","naptanCode":"blpadpdg","atcoCode":"2590B0207","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"opp","street":"Anchorsholme Lane East"}',
};
