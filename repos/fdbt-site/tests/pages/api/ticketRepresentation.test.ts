import ticketRepresentation from '../../../src/pages/api/ticketRepresentation';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { FLAT_FARE_RETURN_ATTRIBUTE, TICKET_REPRESENTATION_ATTRIBUTE } from '../../../src/constants/attributes';

describe('ticketRepresentation', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /ticketRepresentation when no input method is selected', () => {
        const { req, res } = getMockRequestAndResponse({ body: null, mockWriteHeadFn: writeHeadMock });
        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/ticketRepresentation',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, TICKET_REPRESENTATION_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose a type of ticket representation', id: 'geo-zone' }],
        });
    });

    it('should return 302 redirect to /ticketRepresentation when an incorrect input method is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ticketType: 'blah' },
            mockWriteHeadFn: writeHeadMock,
        });
        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/ticketRepresentation',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, TICKET_REPRESENTATION_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose a type of ticket representation', id: 'geo-zone' }],
        });
    });

    it('should return 302 redirect to /csvZoneUpload when the user selects a geo zone', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'geoZone' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/csvZoneUpload',
        });
    });

    it('should return 302 redirect to /serviceList when the user selects a flat fare return', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'multipleServicesReturn' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/serviceList',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, TICKET_REPRESENTATION_ATTRIBUTE, {
            name: 'multipleServices',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FLAT_FARE_RETURN_ATTRIBUTE, true);
    });

    it('should return 302 redirect to /csvZoneUpload when the user selects hybrid', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'hybrid' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/csvZoneUpload',
        });
    });

    it('should return 302 redirect to /serviceList when the user selects the service selection option', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'multipleServices' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/serviceList',
        });
    });

    it('should return 302 redirect to /serviceList when the user selects the service selection multipleServicesPricedByDistance  option', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'multipleServicesPricedByDistance' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/serviceList',
        });
    });

    it('should return 302 redirect to /service when the user selects the pointToPointPeriod option', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'pointToPointPeriod' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/service',
        });
    });

    it('should return 302 redirect to /csvZoneUpload when the user selects a geoZoneFlatFareMultiOperator option', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'geoZoneFlatFareMultiOperator' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/csvZoneUpload',
        });
    });

    it('should return 302 redirect to /serviceList when user selects a multipleServicesFlatFareMultiOperator option', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { ticketType: 'multipleServicesFlatFareMultiOperator' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        ticketRepresentation(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/serviceList',
        });
    });
});
