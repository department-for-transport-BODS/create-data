import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    RETURN_SERVICE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as auroradb from '../../../src/data/auroradb';
import returnService from '../../../src/pages/api/returnService';
import * as index from '../../../src/utils/apiUtils/index';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as sessions from '../../../src/utils/sessions';
import * as utils from '../../../src/utils';
import {

jest.mock('../../../src/utils/apiUtils/index');
jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/utils');
jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/utils/sessions');
    expectedReturnTicketWithAdditionalService,
    expectedSingleTicket,
    getMockRequestAndResponse,
    mockRawService,
} from '../../testData/mockData';

describe('returnService', () => {
    const redirectToErrorSpy = jest.spyOn(index, 'redirectToError');
    jest.spyOn(auroradb, 'getServiceByIdAndDataSource').mockResolvedValue(mockRawService);
    jest.spyOn(utils, 'getAndValidateNoc').mockReturnValue('mynoc');
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    it('should return 302 redirect to /returnService with an error in the session when there is no serviceId for the additional service in the request', async () => {
        const writeHeadMock = jest.fn();
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {},
            body: {
                selectedServiceId: 1,
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await returnService(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/returnService?selectedServiceId=1',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_SERVICE_ATTRIBUTE, {
            lineName: '',
            lineId: '',
            nocCode: '',
            operatorShortName: '',
            serviceDescription: '',
            errors: [{ id: 'returnService', errorMessage: 'Choose a service from the options' }],
        });
    });

    it('should return 302 redirect to /error when the ticket is not in the session', async () => {
        const writeHeadMock = jest.fn();

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {},
            body: {
                serviceId: 2,
                selectedServiceId: 1,
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await returnService(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem selecting the additional return service:',
            'api.returnService',
            new Error('Could not find the ticket for which the service needs to be added.'),
        );
    });

    it('should return 302 redirect to /error when the ticket being edited is not a return ticket', async () => {
        const writeHeadMock = jest.fn();

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            query: {},
            body: {
                serviceId: 2,
                selectedServiceId: 1,
            },
            uuid: {},
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

        await returnService(req, res);

        expect(redirectToErrorSpy).toHaveBeenCalledWith(
            res,
            'There was a problem selecting the additional return service:',
            'api.returnService',
            new Error('Could not find the ticket for which the service needs to be added.'),
        );
    });

    it('should return 302 redirect to /productDetails when a user gives a valid input', async () => {
        const writeHeadMock = jest.fn();
        const { req, res } = getMockRequestAndResponse({
            body: { selectedServiceId: 1, serviceId: 4 },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
        });
        await returnService(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedReturnTicketWithAdditionalService,
                additionalServices: [
                    {
                        lineId: 'q2gv2ve',
                        lineName: '17',
                        serviceDescription:
                            '\n\t\t\t\tInterchange Stand B,Seaham - Estate (Hail and Ride) N/B,Westlea\n\t\t\t',
                        serviceId: 4,
                    },
                ],
            },
            'matchingJsonLink',
        );

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_SERVICE_ATTRIBUTE, undefined);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });
    });
});
