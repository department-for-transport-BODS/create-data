import changePassword from '../../../src/pages/api/changePassword';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as apiUtils from '../../../src/utils/apiUtils';
import { USER_ATTRIBUTE } from '../../../src/constants/attributes';
import * as auth from '../../../src/data/cognito';
import * as sessions from '../../../src/utils/sessions';

jest.mock('../../../src/data/cognito');
jest.mock('../../../src/utils/apiUtils');
jest.mock('../../../src/utils/sessions');

describe('changePassword', () => {
    const updateUserPasswordSpy = jest.spyOn(auth, 'updateUserPassword');
    const initiateAuthSpy = jest.spyOn(auth, 'initiateAuth');

    const getAttributeSpy = jest.spyOn(apiUtils, 'getAttributeFromIdToken');
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    beforeEach(() => {
        updateUserPasswordSpy.mockImplementation(() => Promise.resolve());
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();

    it('should set the USER_ATTRIBUTE and redirect to /passwordUpdated when password update is successful', async () => {
        getAttributeSpy.mockImplementation(() => 'fake.address@email.com');
        initiateAuthSpy.mockImplementation(() => Promise.resolve({ AuthenticationResult: {} }));
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                oldPassword: 'iLoveBuses',
                newPassword: 'iReallyLoveBuses1!',
                confirmNewPassword: 'iReallyLoveBuses1!',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await changePassword(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, {
            redirectFrom: '/changePassword',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/passwordUpdated',
        });
    });

    it('should redirect to the error page when the ID_TOKEN_COOKIE is missing the username attribute', async () => {
        getAttributeSpy.mockImplementation(() => null);
        initiateAuthSpy.mockImplementation(() => Promise.resolve({ AuthenticationResult: {} }));
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await changePassword(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });

    it.each([
        [
            'the user enters nothing',
            { oldPassword: '', newPassword: '', confirmNewPassword: '' },
            [
                { id: 'old-password', errorMessage: 'Enter your current password' },
                { id: 'new-password', errorMessage: 'Enter a new password' },
            ],
            1,
        ],
        [
            'the user enters an incorrect old password',
            { oldPassword: 'iLoveBuses', newPassword: 'iReallyLoveBuses1!', confirmNewPassword: 'iReallyLoveBuses1!' },
            [{ id: 'old-password', errorMessage: 'Your old password is incorrect' }],
            0,
        ],
        [
            'the user enters no new password',
            { oldPassword: 'iLoveBuses', newPassword: '', confirmNewPassword: '' },
            [{ id: 'new-password', errorMessage: 'Enter a new password' }],
            1,
        ],
        [
            "the 'new-password' input is too short",
            { oldPassword: 'iLoveBuses', newPassword: 'Short1!', confirmNewPassword: 'Short1!' },
            [{ id: 'new-password', errorMessage: 'Password must be at least 8 characters long' }],
            1,
        ],
        [
            "the 'new-password' and 'confirm-new-password' inputs do no match",
            { oldPassword: 'iLoveBuses', newPassword: 'iReallyLoveBuses1!', confirmNewPassword: 'iQuiteLikeBuses1!' },
            [{ id: 'new-password', errorMessage: 'Passwords do not match' }],
            1,
        ],
        [
            "the 'new-password' does not have a special character",
            { oldPassword: 'iLoveBuses', newPassword: 'iReallyLoveBuses1', confirmNewPassword: 'iQuiteLikeBuses1' },
            [{ id: 'new-password', errorMessage: 'Password must contain at least one special character' }],
            1,
        ],
        [
            "the 'new-password' does not contain a number",
            { oldPassword: 'iLoveBuses', newPassword: 'iReallyLoveBuses!', confirmNewPassword: 'iReallyLoveBuses!' },
            [{ id: 'new-password', errorMessage: 'Password must contain at least one number' }],
            1,
        ],
        [
            "the 'new-password' does not contain an uppercase letter",
            { oldPassword: 'iLoveBuses', newPassword: 'ireallylovebuses1!', confirmNewPassword: 'ireallylovebuses1!' },
            [{ id: 'new-password', errorMessage: 'Password must contain at least one uppercase letter' }],
            1,
        ],
        [
            "the 'new-password' does not contain an lowercase letter",
            { oldPassword: 'iLoveBuses', newPassword: 'IREALLYLOVEBUSES1!', confirmNewPassword: 'IREALLYLOVEBUSES1!' },
            [{ id: 'new-password', errorMessage: 'Password must contain at least one lowercase letter' }],
            1,
        ],
        [
            "the 'new-password' does not contain conform to multiple aspects of password policy",
            { oldPassword: 'iLoveBuses', newPassword: 'ireallylovebuses', confirmNewPassword: 'ireallylovebuses' },
            [
                {
                    id: 'new-password',
                    errorMessage:
                        'Password must contain at least one uppercase letter, contain at least one number, and contain at least one special character',
                },
            ],
            1,
        ],
    ])('should set an error and redirect back to the page when %s', async (_case, input, inputChecks, authResponse) => {
        getAttributeSpy.mockImplementation(() => 'fake.address@email.com');
        initiateAuthSpy.mockImplementation(() => {
            if (authResponse === 0) {
                throw new Error();
            }
            return Promise.resolve({ AuthenticationResult: {} });
        });

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: input,
            mockWriteHeadFn: writeHeadMock,
        });
        await changePassword(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, { errors: inputChecks });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/changePassword',
        });
    });
});
