import * as auth from '../../../src/data/cognito';
import * as session from '../../../src/utils/sessions';
import forgotPassword from '../../../src/pages/api/forgotPassword';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { FORGOT_PASSWORD_ATTRIBUTE } from '../../../src/constants/attributes';

const writeHeadMock = jest.fn();
const authSignInSpy = jest.spyOn(auth, 'forgotPassword');
authSignInSpy.mockImplementation(() => Promise.resolve());

describe('forgotPassword', () => {
    it('redirects the user to reset confirmation given a valid email address format', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });
        await forgotPassword(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/resetConfirmation',
        });
    });

    it('redirects the user to forgot password  given a invalid email address format', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });
        await forgotPassword(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/forgotPassword',
        });
    });

    it('should set the FORGOT_PASSWORD_ATTRIBUTE when redirecting', async () => {
        const updateSessionSpy = jest.spyOn(session, 'updateSessionAttribute');
        const mockBody = { email: 'test@email.com' };
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
        await forgotPassword(req, res);
        expect(updateSessionSpy).toHaveBeenCalledWith(req, FORGOT_PASSWORD_ATTRIBUTE, mockBody);
    });
});
