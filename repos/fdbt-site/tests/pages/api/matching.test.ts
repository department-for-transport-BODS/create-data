import matching from '../../../src/pages/api/matching';
import { getMockRequestAndResponse, service, mockMatchingUserFareStages } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { MatchingInfo, MatchingWithErrors } from '../../../src/interfaces/matchingInterface';
import { MATCHING_ATTRIBUTE, FARE_TYPE_ATTRIBUTE, UNASSIGNED_STOPS_ATTRIBUTE } from '../../../src/constants/attributes';

jest.mock('../../../src/utils/sessions');

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

describe('Matching API', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('generates matching info, updates the MATCHING_ATTRIBUTE and redirects to /ticketConfirmation if all is valid, when fare type is anything but return', () => {
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
        matching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/ticketConfirmation' });
    });

    it('generates matching info, updates the MATCHING_ATTRIBUTE and redirects to /returnValidity if all is valid, when fare type is return', () => {
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
            session: {
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'return',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        matching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/returnValidity' });
    });

    it('adds the unassigned stops to the unassigned stops session attribute', () => {
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
            session: {
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'return',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        matching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingInfo);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, UNASSIGNED_STOPS_ATTRIBUTE, [
            {
                atcoCode: '2590B0207',
            },
        ]);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/returnValidity' });
    });

    it('correctly generates matching error info, updates the MATCHING_ATTRIBUTE and then redirects to matching page when there are unassigned fare stages', () => {
        const expectedMatchingError: MatchingWithErrors = {
            error: 'One or more fare stages have not been assigned, assign each fare stage to a stop',
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
        matching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MATCHING_ATTRIBUTE, expectedMatchingError);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/matching',
        });
    });

    it('redirects to error page if no userfarestages data in body', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { ...selections, service: JSON.stringify(service), userfarestages: '' },

            mockWriteHeadFn: writeHeadMock,
        });

        matching(req, res);
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

        matching(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });
});
