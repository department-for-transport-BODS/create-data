import {
    getMockRequestAndResponse,
    expectedSingleTicket,
    expectedReturnTicketWithAdditionalService,
    expectedFlatFareTicket,
} from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
    DIRECTION_ATTRIBUTE,
} from '../../../src/constants/attributes';
import editFareStageMatching from '../../../src/pages/api/editFareStageMatching';
import * as index from '../../../src/utils/apiUtils/index';
import { EditFareStageMatchingWithErrors } from '../../../src/interfaces';
import * as userData from '../../../src/utils/apiUtils/userData';
import { TicketWithIds } from '../../../src/interfaces/matchingJsonTypes';

const selections = {
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

describe('Edit fare stage matching API', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const redirectToErrorSpy = jest.spyOn(index, 'redirectToError');
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('generates the error if no ticket in session', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editFareStageMatching(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem mapping the fare stage for edit ticket',
            'api.editFareStageMatching',
            new Error('Ticket invalid or not found'),
        );
    });

    it('generates the error for ticket other than single, return or point-to-point-period ticket', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedFlatFareTicket as TicketWithIds,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editFareStageMatching(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem mapping the fare stage for edit ticket',
            'api.editFareStageMatching',
            new Error('Ticket invalid or not found'),
        );
    });

    it('correctly generates matching error info, updates the EDIT_FARE_STAGE_MATCHING_ATTRIBUTE and then redirects to page when there are unassigned fare stages', async () => {
        const expectedMatchingError: EditFareStageMatchingWithErrors = {
            errors: [
                {
                    errorMessage: 'One or more fare stages have not been assigned, assign each fare stage to a stop',
                    id: 'option-0',
                },
            ],
            selectedFareStages: {},
            warning: false,
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                option0:
                    '{"stopName":"Cresswood Avenue","naptanCode":"blpadpdg","atcoCode":"2590B0207","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"opp","street":"Anchorsholme Lane East"}',
                option1:
                    '{"stopName":"North Drive","naptanCode":"blpagjmj","atcoCode":"2590B0487","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"adj","street":"North Drive"}',
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editFareStageMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
            expectedMatchingError,
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/editFareStageMatching',
        });
    });

    it('correctly generates matching error info, updates the EDIT_FARE_STAGE_MATCHING_ATTRIBUTE and then redirects to page with warning when there are unassigned fare stages', async () => {
        const expectedMatchingError: EditFareStageMatchingWithErrors = {
            warning: true,
            selectedFareStages: expect.any(Object),
            errors: [],
        };
        const { req, res } = getMockRequestAndResponse({
            body: {
                option0:
                    '{"stopName":"Cresswood Avenue","naptanCode":"blpadpdg","atcoCode":"2590B0207","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"opp","street":"Anchorsholme Lane East"}',
                option1:
                    '{"stopName":"North Drive","naptanCode":"blpagjmj","atcoCode":"2590B0487","localityCode":"E0035271","localityName":"Anchorsholme","parentLocalityName":"Cleveleys","indicator":"adj","street":"North Drive"}',
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await editFareStageMatching(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
            expectedMatchingError,
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/editFareStageMatching',
        });
    });

    it('update correctly for the single ticket', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editFareStageMatching(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });
    });

    it('update correctly for the return/point-to-point-period ticket for outbound direction and redirect to editFareStageMatching page', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editFareStageMatching(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/editFareStageMatching',
        });
    });

    it('update correctly for the return/point-to-point-period ticket for inbound direction and redirect to productDetails page', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ...selections,
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
                [DIRECTION_ATTRIBUTE]: {
                    direction: 'inbound',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await editFareStageMatching(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });
    });
});
