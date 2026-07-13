import { AdminInitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import * as auth from '../../../src/data/cognito';
import login from '../../../src/pages/api/login';
import * as auroradb from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { OPERATOR_ATTRIBUTE } from '../../../src/constants/attributes';

const mockBaseOpAuthResponse: AdminInitiateAuthCommandOutput = {
    $metadata: {},
    AuthenticationResult: {
        IdToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b206bm9jIjoiVEVTVCJ9.yblgxuiLnAHzUUf9d8rH975xO8N62aqR8gUszkw6cHc',
        RefreshToken: 'eyJj',
    },
};

const mockSchemeOpAuthResponse: AdminInitiateAuthCommandOutput = {
    $metadata: {},
    AuthenticationResult: {
        IdToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b206c2NoZW1lT3BlcmF0b3IiOiJTQ0hFTUVfT1BFUkFUT1IiLCJjdXN0b206c2NoZW1lUmVnaW9uQ29kZSI6IlNDSEVNRV9SRUdJT04iLCJjdXN0b206bm9jIjoiVEVTVFNDSEVNRSJ9.NZEY2oD25-Y-wcaYLQMlXozGkhjI4hXxAXxkrOICXvA',
        RefreshToken: 'eyJj',
    },
};

describe('login', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    const getOperatorNameByNocCodeSpy = jest.spyOn(auroradb, 'getOperatorNameByNocCode');
    const authSignInSpy = jest.spyOn(auth, 'initiateAuth');

    beforeEach(() => {
        getOperatorNameByNocCodeSpy.mockImplementation(() => Promise.resolve('DCCL'));
        authSignInSpy.mockImplementation(() => Promise.resolve(mockBaseOpAuthResponse));
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();

    const cases = [
        [
            'incorrectly formatted email address',
            { email: 'testtfncom', password: 'abcdefghi' },
            {
                errors: [
                    {
                        id: 'email',
                        errorMessage: 'Enter an email address in the correct format, like name@example.com',
                    },
                ],
                email: 'testtfncom',
            },
        ],
        [
            'password is empty',
            { email: 'test@test.com', password: '' },
            {
                errors: [
                    {
                        id: 'password',
                        errorMessage: 'Enter a password',
                    },
                ],
                email: 'test@test.com',
            },
        ],
    ];

    test.each(cases)('given %p, sets the correct error attribute', async (_, testData, expectedAttributeValue) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: testData,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, expectedAttributeValue);
    });

    it('should redirect when successfully signed in as an ordinary operator', async () => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockBaseOpAuthResponse));
        const mockOperatorAttribute = {
            name: 'DCCL',
            nocCode: 'TEST',
        };
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'abcdefghi',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefghi');
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, mockOperatorAttribute);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/home',
        });
    });

    it('should redirect when successfully signed in as a scheme operator', async () => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockSchemeOpAuthResponse));
        const mockOperatorAttribute = {
            name: 'SCHEME_OPERATOR',
            region: 'SCHEME_REGION',
            nocCode: 'TESTSCHEME',
        };
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'abcdefghi',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefghi');
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, mockOperatorAttribute);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/home',
        });
    });

    it('should error when the sign in fails', async () => {
        authSignInSpy.mockImplementation(() => {
            throw new Error();
        });

        const mockOperatorAttributeValue = {
            errors: [
                {
                    id: 'login',
                    errorMessage: 'The email address and/or password are not correct.',
                },
            ],
        };

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'abcdefghi',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await login(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, mockOperatorAttributeValue);
    });
});
