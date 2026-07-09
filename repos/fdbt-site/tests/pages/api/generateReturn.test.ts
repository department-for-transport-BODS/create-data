import {
    expectedCarnetReturnTicket,
    expectedFlatFareTicket,
    expectedSingleTicket,
    getMockRequestAndResponse,
    mockRawService,
} from '../../testData/mockData';
import generateReturn, { findTicketsToMakeReturn } from '../../../src/pages/api/generateReturn';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as index from '../../../src/utils/apiUtils/index';
import {
    getProductById,
    getProductIdByMatchingJsonLink,
    getServiceByIdAndDataSource,
} from '../../../src/data/auroradb';
import { getProductsMatchingJson } from '../../../src/data/s3';
import { TicketWithIds } from '../../../src/interfaces/matchingJsonTypes';

jest.mock('../../../src/utils/apiUtils/index');
jest.mock('../../../src/utils/apiUtils/userData');

const expectedGeneratedReturn = {
    type: 'return',
    passengerType: { id: 9 },
    lineName: '215',
    lineId: 'q2gv2ve',
    nocCode: 'DCCL',
    operatorName: 'DCC',
    serviceDescription: 'Worthing - Seaham - Crawley',
    email: 'test@example.com',
    uuid: expect.any(String),
    timeRestriction: { id: 2 },
    ticketPeriod: { startDate: '2020-12-17T09:30:46.0Z', endDate: '2024-12-18T09:30:46.0Z' },
    products: [{ salesOfferPackages: [{ id: 1 }, { id: 2 }] }],
    inboundFareZones: [
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
    outboundFareZones: [
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
    returnPeriodValidity: { amount: '1', typeOfDuration: 'day' },
    unassignedStops: { inboundUnassignedStops: [], outboundUnassignedStops: [] },
};

jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/data/s3');

describe('generateReturn', () => {
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
    const collectInfoForMatchingTicketsSpy = jest.spyOn(userData, 'collectInfoForMatchingTickets');
    collectInfoForMatchingTicketsSpy.mockImplementationOnce(() =>
        Promise.resolve({
            directionToFind: 'outbound',
            tickets: [
                {
                    ...expectedSingleTicket,
                    journeyDirection: 'outbound',
                },
            ],
            originalTicket: expectedSingleTicket,
        }),
    );
    const redirectToErrorSpy = jest.spyOn(index, 'redirectToError');

    it('should error if a query param is missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: { lineId: '2', productId: '1', serviceId: '3' },
            mockWriteHeadFn: writeHeadMock,
        });

        await generateReturn(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem generating a return.',
            'api.generateReturn',
            new Error('Generate return API called with incorrect parameters.'),
        );
    });

    it('should redirect back with generateReturn=false query param if service only has 1 direction', async () => {
        const mockServiceWithOneDirection = {
            ...mockRawService,
            journeyPatterns: [mockRawService.journeyPatterns[0]],
        };
        (getServiceByIdAndDataSource as jest.Mock).mockResolvedValueOnce(mockServiceWithOneDirection);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: { lineId: '2', productId: '1', serviceId: '3', passengerTypeId: '4' },
            mockWriteHeadFn: writeHeadMock,
        });

        await generateReturn(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=3&generateReturn=false',
        });
    });

    it('should create a return if there are two singles which are compatible', async () => {
        (getServiceByIdAndDataSource as jest.Mock).mockResolvedValueOnce(mockRawService);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: { lineId: '2', productId: '1', serviceId: '3', passengerTypeId: '9' },
            mockWriteHeadFn: writeHeadMock,
        });

        await generateReturn(req, res);

        expect(insertDataToProductsBucketAndProductsTableSpy).toHaveBeenCalledWith(
            expectedGeneratedReturn,
            noc,
            expect.any(String),
            {
                req,
                res,
            },
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=3',
        });
    });
});

describe('findTicketsToMakeReturn', () => {
    const singleTicket = expectedSingleTicket;
    it('returns an empty array if the ticket compared is expired', () => {
        const ticket = {
            ...singleTicket,
            ticketPeriod: {
                startDate: '2020-12-17T09:30:46.0Z',
                endDate: '2020-12-18T09:30:46.0Z',
            },
        };
        const result = findTicketsToMakeReturn(2, 'outbound', [ticket], singleTicket);
        expect(result).toEqual([]);
    });

    it('returns an empty array if the ticket compared is not a single', () => {
        const result = findTicketsToMakeReturn(2, 'outbound', [expectedFlatFareTicket as TicketWithIds], singleTicket);
        expect(result).toEqual([]);
    });

    it('returns an empty array if the ticket compared does not share the same passenger type', () => {
        const ticket = {
            ...singleTicket,
            passengerType: { id: 8 },
        };
        const result = findTicketsToMakeReturn(2, 'outbound', [ticket], singleTicket);
        expect(result).toEqual([]);
    });

    it('returns an empty array if the ticket compared does not have the direction that is being sought', () => {
        const ticket = {
            ...singleTicket,
            journeyDirection: 'inbound',
        };
        const result = findTicketsToMakeReturn(2, 'outbound', [ticket], singleTicket);
        expect(result).toEqual([]);
    });
});
