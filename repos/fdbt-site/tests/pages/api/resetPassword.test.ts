import resetPassword from '../../../src/pages/api/resetPassword';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { USER_ATTRIBUTE } from '../../../src/constants/attributes';
import * as auth from '../../../src/data/cognito';
import * as sessions from '../../../src/utils/sessions';

jest.mock('../../../src/data/cognito');
jest.mock('../../../src/utils/sessions');

describe('resetPassword', () => {
    const forgotPasswordSubmitSpy = jest.spyOn(auth, 'confirmForgotPassword');
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    beforeEach(() => {
        forgotPasswordSubmitSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();
    const expiryDate = Math.abs(new Date(2020, 5, 30).getTime() / 1000);

    const cases = [
        [
            'password less than 8 characters',
            {
                username: 'test@test.com',
                password: 'Buses1!',
                confirmPassword: 'Buses1!',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [{ id: 'new-password', errorMessage: 'Password must be at least 8 characters long' }],
            },
        ],
        [
            'password is empty',
            {
                username: 'test@test.com',
                password: '',
                confirmPassword: 'abcdefghi',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [{ id: 'new-password', errorMessage: 'Enter a new password' }],
            },
        ],
        [
            'passwords fields do not match',
            {
                username: 'test@test.com',
                password: 'ILoveBuses1!',
                confirmPassword: 'abcdefghi',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [{ id: 'new-password', errorMessage: 'Passwords do not match' }],
            },
        ],
        [
            'password does not contain special character',
            {
                username: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1',
                confirmPassword: 'chromosoneTelepathyDinosaur1',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [
                    {
                        id: 'new-password',
                        errorMessage: 'Password must contain at least one special character',
                    },
                ],
            },
        ],
        [
            'password does not contain uppercase letter',
            {
                username: 'test@test.com',
                password: 'chromosonetelepathydinosaur1!',
                confirmPassword: 'chromosonetelepathydinosaur1!',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [
                    {
                        id: 'new-password',
                        errorMessage: 'Password must contain at least one uppercase letter',
                    },
                ],
            },
        ],
        [
            'password does not contain lowercase letter',
            {
                username: 'test@test.com',
                password: 'CHROMOSONETELEPATHYDINOSAUR1!',
                confirmPassword: 'CHROMOSONETELEPATHYDINOSAUR1!',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [
                    {
                        id: 'new-password',
                        errorMessage: 'Password must contain at least one lowercase letter',
                    },
                ],
            },
        ],
        [
            'password does not conform to multiple aspects of password policy',
            {
                username: 'test@test.com',
                password: 'chromosonetelepathydinosaur',
                confirmPassword: 'chromosonetelepathydinosaur',
                regKey: 'abcdefg',
                expiry: expiryDate,
            },
            {
                errors: [
                    {
                        id: 'new-password',
                        errorMessage:
                            'Password must contain at least one uppercase letter, contain at least one number, and contain at least one special character',
                    },
                ],
            },
        ],
    ];

    test.each(cases)('given %p, sets the correct error attribute', async (_case, testData, expectedAttributeValue) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: testData,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await resetPassword(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, expectedAttributeValue);
    });

    it('should redirect when successfully resetting password', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                username: 'test@test.com',
                password: 'ILoveBuses1!',
                confirmPassword: 'ILoveBuses1!',
                regKey: '123ABd$',
                expiry: expiryDate,
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await resetPassword(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, { redirectFrom: '/resetPassword' });
        expect(forgotPasswordSubmitSpy).toHaveBeenCalled();
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/passwordUpdated',
        });
    });

    it('should redirect if the password link has expired', async () => {
        forgotPasswordSubmitSpy.mockImplementation(() => {
            throw new Error('ExpiredCodeException');
        });

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                username: 'test@test.com',
                password: 'ILoveBuses1!',
                confirmPassword: 'ILoveBuses1!',
                regKey: '123ABd$',
                expiry: expiryDate,
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await resetPassword(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/resetLinkExpired',
        });
    });

    it('should error when the reset password fails', async () => {
        forgotPasswordSubmitSpy.mockImplementation(() => {
            throw new Error(`Failed to confirm forgotten password`);
        });

        const mockUserAttributeValue = {
            errors: [
                {
                    id: 'new-password',
                    errorMessage: 'There was a problem resetting your password.',
                },
            ],
        };

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                username: 'test@test.com',
                password: 'ILoveBuses1!',
                confirmPassword: 'ILoveBuses1!',
                regKey: '123ABd$',
                expiry: expiryDate,
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await resetPassword(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, mockUserAttributeValue);
    });
});
