import {
    FARE_TYPE_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
} from './../../../src/constants/attributes';
import inboundMatching from '../../../src/pages/api/inboundMatching';
import { getMockRequestAndResponse, service, mockMatchingUserFareStages } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { InboundMatchingInfo, MatchingWithErrors } from '../../../src/interfaces/matchingInterface';
import { INBOUND_MATCHING_ATTRIBUTE, UNASSIGNED_INBOUND_STOPS_ATTRIBUTE } from '../../../src/constants/attributes';
import { selections, selectedOptionsWithAnUnassignedStop } from './matching.test';

jest.mock('../../../src/utils/sessions');

describe('Inbound Matching API', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    const writeHeadMock = jest.fn();
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('correctly generates matching info, updates the INBOUND_MATCHING_ATTRIBUTE and then redirects to returnValidity page is all is valid', () => {
        const expectedMatchingInfo: InboundMatchingInfo = {
            inboundUserFareStages: expect.any(Object),
            inboundMatchingFareZones: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: {
                        lineName: '',
                        lineId: '',
                        nocCode: '',
                        operatorShortName: '',
                        serviceDescription: '',
                    },
                    userFareStages: {
                        fareStages: [
                            {
                                stageName: '',
                                prices: [
                                    {
                                        price: '',
                                        fareZones: [],
                                    },
                                ],
                            },
                        ],
                    },
                    matchingFareZones: {
                        thing: {
                            name: '',
                            stops: [],
                            prices: [],
                        },
                    },
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/returnValidity' });
    });

    it('correctly generates matching info, updates the INBOUND_MATCHING_ATTRIBUTE and then redirects to pointToPointPeriodProduct page for period ticket if all is valid', () => {
        const expectedMatchingInfo: InboundMatchingInfo = {
            inboundUserFareStages: expect.any(Object),
            inboundMatchingFareZones: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            session: {
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                [MATCHING_ATTRIBUTE]: {
                    service: {
                        lineName: '',
                        lineId: '',
                        nocCode: '',
                        operatorShortName: '',
                        serviceDescription: '',
                    },
                    userFareStages: {
                        fareStages: [
                            {
                                stageName: '',
                                prices: [
                                    {
                                        price: '',
                                        fareZones: [],
                                    },
                                ],
                            },
                        ],
                    },
                    matchingFareZones: {
                        thing: {
                            name: '',
                            stops: [],
                            prices: [],
                        },
                    },
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/pointToPointPeriodProduct' });
    });

    it('correctly generates matching info, updates the INBOUND_MATCHING_ATTRIBUTE and then redirects to pointToPointPeriodProduct page for school service ticket if all is valid', () => {
        const expectedMatchingInfo: InboundMatchingInfo = {
            inboundUserFareStages: expect.any(Object),
            inboundMatchingFareZones: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            session: {
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
                [MATCHING_ATTRIBUTE]: {
                    service: {
                        lineName: '',
                        lineId: '',
                        nocCode: '',
                        operatorShortName: '',
                        serviceDescription: '',
                    },
                    userFareStages: {
                        fareStages: [
                            {
                                stageName: '',
                                prices: [
                                    {
                                        price: '',
                                        fareZones: [],
                                    },
                                ],
                            },
                        ],
                    },
                    matchingFareZones: {
                        thing: {
                            name: '',
                            stops: [],
                            prices: [],
                        },
                    },
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/pointToPointPeriodProduct' });
    });

    it('adds the unassigned stops to the inbound session attribute', () => {
        const expectedMatchingInfo: InboundMatchingInfo = {
            inboundUserFareStages: expect.any(Object),
            inboundMatchingFareZones: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selectedOptionsWithAnUnassignedStop,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            session: {
                [MATCHING_ATTRIBUTE]: {
                    service: {
                        lineName: '',
                        lineId: '',
                        nocCode: '',
                        operatorShortName: '',
                        serviceDescription: '',
                    },
                    userFareStages: {
                        fareStages: [
                            {
                                stageName: '',
                                prices: [
                                    {
                                        price: '',
                                        fareZones: [],
                                    },
                                ],
                            },
                        ],
                    },
                    matchingFareZones: {
                        thing: {
                            name: '',
                            stops: [],
                            prices: [],
                        },
                    },
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, UNASSIGNED_INBOUND_STOPS_ATTRIBUTE, [
            {
                atcoCode: '2590B0207',
            },
        ]);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/returnValidity' });
    });

    it('correctly generates matching error info, updates the INBOUND_MATCHING_ATTRIBUTE and then redirects to inboundMatching page when there no assigned fare stages', () => {
        const expectedMatchingError: MatchingWithErrors = {
            error: 'No fare stages have been assigned, assign each fare stage to a stop',
            selectedFareStages: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                option0:
                    '{"stopName":"Cresswood Avenue","naptanCode":"blpadpdg","atcoCode":"2590B0207","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"opp","street":"Anchorsholme Lane East"}',
                option1:
                    '{"stopName":"North Drive","naptanCode":"blpagjmj","atcoCode":"2590B0487","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"adj","street":"North Drive"}',
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingError);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/inboundMatching',
        });
    });

    it('correctly generates matching warning info, updates the INBOUND_MATCHING_ATTRIBUTE and then redirects to inboundMatching page when there are unassigned fare stages', () => {
        const expectedMatchingError: MatchingWithErrors = {
            warning: true,
            selectedFareStages: expect.any(Object),
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                option0:
                    '{"stopName":"North Drive","naptanCode":"blpagjmj","atcoCode":"2590B0487","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"adj","street":"North Drive"}',
                option1: [
                    'Acomb Green Lane',
                    '{"stop":{"stopName":"Yoden Way - Chapel Hill Road","naptanCode":"duratdmj","atcoCode":"13003521G","localityCode":"E0045956","localityName":"Peterlee","indicator":"W-bound","street":"Yodan Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Acomb Green Lane"}',
                ],
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });
        inboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INBOUND_MATCHING_ATTRIBUTE, expectedMatchingError);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/inboundMatching',
        });
    });

    it('redirects back to error page if no user data in body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...selections, service: JSON.stringify(service), userfarestages: '' },
            mockWriteHeadFn: writeHeadMock,
        });

        inboundMatching(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });

    it('redirects back to error page if no service info in body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
                service: '',
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        inboundMatching(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });
});
