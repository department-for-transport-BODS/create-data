import resendInvite from '../../../../src/pages/api/admin/resendInvite';
import { getMockRequestAndResponse } from '../../../testData/mockData';
import * as cognito from '../../../../src/data/cognito';
import { ADMIN_RESEND_INVITE_ATTRIBUTE } from '../../../../src/constants/attributes';
import { getSessionAttribute } from '../../../../src/utils/sessions';

describe('api admin resendInvite', () => {
    const adminDeleteUserSpy = jest.spyOn(cognito, 'adminDeleteUser');
    const adminCreateUserSpy = jest.spyOn(cognito, 'adminCreateUser');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should recreate the user and redirect back with a success message', async () => {
        adminDeleteUserSpy.mockResolvedValueOnce();
        adminCreateUserSpy.mockResolvedValueOnce();
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', email: 'user@example.com', nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(adminDeleteUserSpy).toHaveBeenCalledWith('user@example.com');
        expect(adminCreateUserSpy).toHaveBeenCalledWith('user@example.com', 'NOC1');
        expect(getSessionAttribute(req, ADMIN_RESEND_INVITE_ATTRIBUTE)).toEqual({
            errors: [],
            success: 'user@example.com',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/admin/resendInvite?username=user%40example.com',
        });
    });

    it('should redirect to the error page when required fields are missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com' },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/error' });
    });

    it('should redirect back with an error when recreation fails', async () => {
        adminDeleteUserSpy.mockRejectedValueOnce(new Error('Failed to delete user: boom'));
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', email: 'user@example.com', nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await resendInvite(req, res);

        expect(getSessionAttribute(req, ADMIN_RESEND_INVITE_ATTRIBUTE)?.errors).toHaveLength(1);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/admin/resendInvite?username=user%40example.com',
        });
    });
});
