import { UNASSIGNED_STOPS_ATTRIBUTE } from '../../../src/constants/attributes';
import outboundMatching from '../../../src/pages/api/outboundMatching';
import {
    getMockRequestAndResponse,
    service,
    mockMatchingUserFareStages,
    selections,
    selectedOptionsWithAnUnassignedStop,
} from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { MatchingInfo, MatchingWithErrors } from '../../../src/interfaces/matchingInterface';
import { MATCHING_ATTRIBUTE } from '../../../src/constants/attributes';

describe('Outbound Matching API', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('correctly generates matching info, updates the MATCHING_ATTRIBUTE and then redirects to inboundMatching page is all is valid', () => {
        const expectedMatchingInfo: MatchingInfo = {
            service: expect.any(Object),
            userFareStages: expect.any(Object),
            matchingFareZones: expect.any(Object),
        };

        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        outboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, UNASSIGNED_STOPS_ATTRIBUTE, []);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/inboundMatching' });
    });

    it('adds the unassigned stops to the outbound session attribute', () => {
        const expectedMatchingInfo: MatchingInfo = {
            service: expect.any(Object),
            userFareStages: expect.any(Object),
            matchingFareZones: expect.any(Object),
        };

        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selectedOptionsWithAnUnassignedStop,
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });

        outboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingInfo);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, UNASSIGNED_STOPS_ATTRIBUTE, [
            {
                atcoCode: '2590B0207',
            },
        ]);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/inboundMatching' });
    });

    it('correctly generates matching error info, updates the MATCHING_ATTRIBUTE and then redirects to outboundMatching page when there are no assigned fare stages', () => {
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
        outboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingError);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/outboundMatching',
        });
    });

    it('correctly generates matching warning info, updates the MATCHING_ATTRIBUTE and then redirects to outboundMatching page when there are unassigned fare stages', () => {
        const expectedMatchingError: MatchingWithErrors = {
            warning: true,
            selectedFareStages: expect.any(Object),
        };

        const { req, res } = getMockRequestAndResponse({
            body: {
                option0:
                    '{"stopName":"Cresswood Avenue","naptanCode":"blpadpdg","atcoCode":"2590B0207","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"opp","street":"Anchorsholme Lane East"}',
                option1: [
                    'Acomb Green Lane',
                    '{"stop":{"stopName":"Yoden Way - Chapel Hill Road","naptanCode":"duratdmj","atcoCode":"13003521G","localityCode":"E0045956","localityName":"Peterlee","indicator":"W-bound","street":"Yodan Way","qualifierName":"","parentLocalityName":"IW Test"},"stage":"Acomb Green Lane"}',
                ],
                service: JSON.stringify(service),
                userfarestages: JSON.stringify(mockMatchingUserFareStages),
            },
            mockWriteHeadFn: writeHeadMock,
        });
        outboundMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingError);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/outboundMatching',
        });
    });

    it('redirects back to error page if no user data in body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...selections, service: JSON.stringify(service), userfarestages: '' },
            mockWriteHeadFn: writeHeadMock,
        });

        outboundMatching(req, res);
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

        outboundMatching(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });
});
