import { TXC_SOURCE_ATTRIBUTE } from './../../../src/constants/attributes';
import { getMockRequestAndResponse } from '../../testData/mockData';
import fareType from '../../../src/pages/api/fareType';
import * as sessions from '../../../src/utils/sessions';
import * as aurora from '../../../src/data/auroradb';
import { FARE_TYPE_ATTRIBUTE, CARNET_FARE_TYPE_ATTRIBUTE } from '../../../src/constants/attributes';
import { ErrorInfo } from '../../../src/interfaces';

const services = [
    {
        id: 11,
        lineName: '123',
        lineId: '3h3vb32ik',
        startDate: '05/02/2020',
        description: 'IW Bus Service 123',
        serviceCode: 'NW_05_BLAC_123_1',
        origin: 'Manchester',
        destination: 'Leeds',
        dataSource: 'tnds',
        endDate: null,
    },
    {
        id: 12,
        lineName: 'X1',
        lineId: '3h3vb32ik',
        startDate: '06/02/2020',
        description: 'Big Blue Bus Service X1',
        serviceCode: 'NW_05_BLAC_X1_1',
        origin: 'Bolton',
        destination: 'Wigan',
        dataSource: 'bods',
        endDate: '26/02/2020',
    },
    {
        id: 13,
        lineName: 'Infinity Line',
        lineId: '3h3vb32ik',
        startDate: '07/02/2020',
        description: 'This is some kind of bus service',
        serviceCode: 'WY_13_IWBT_07_1',
        origin: 'Manchester',
        destination: 'York',
        dataSource: 'tnds',
        endDate: null,
    },
];

describe('fareType', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const checkForServicesSpy = jest.spyOn(aurora, 'getAllServicesByNocCode');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /definePassengerType when schoolService is selected', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'schoolService' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            fareType: req.body.fareType,
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /passengerType when any option other than schoolService is selected', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'single' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            fareType: req.body.fareType,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /fareType with errors when no option is selected', async () => {
        const mockError: ErrorInfo[] = [
            { id: 'radio-option-single', errorMessage: 'Choose a fare type from the options' },
        ];
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, {
            errors: mockError,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/fareType',
        });
    });

    it('should return 302 redirect to /carnetFareType when carnet is selected, set carnet to true, and clear the fareType attribute', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'carnet' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CARNET_FARE_TYPE_ATTRIBUTE, true);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, undefined);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/carnetFareType',
        });
    });

    it('should return 302 redirect to /passengerType when carnetPeriod is selected, set carnet to true, and set the fareType attribute to period', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'carnetPeriod' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CARNET_FARE_TYPE_ATTRIBUTE, true);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, { fareType: 'period' });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /passengerType when carnet is selected, set carnet to true, and set the fareType attribute to flatFare', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'carnetFlatFare' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CARNET_FARE_TYPE_ATTRIBUTE, true);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_TYPE_ATTRIBUTE, { fareType: 'flatFare' });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });

    it('should return 302 redirect to /noServices when the db call returns no services', async () => {
        checkForServicesSpy.mockResolvedValue([]);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'carnetFlatFare' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledTimes(0);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/noServices',
        });
    });

    it('should update the txc attribute when some services are returned', async () => {
        checkForServicesSpy.mockResolvedValue(services);
        const { req, res } = getMockRequestAndResponse({
            body: { fareType: 'carnetFlatFare' },
            mockWriteHeadFn: writeHeadMock,
        });
        await fareType(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, TXC_SOURCE_ATTRIBUTE, {
            source: 'bods',
            hasBods: true,
            hasTnds: false,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPassengerType',
        });
    });
});
