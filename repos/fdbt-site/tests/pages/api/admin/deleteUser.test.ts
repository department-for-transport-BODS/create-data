import deleteUser from '../../../../src/pages/api/admin/deleteUser';
import { getMockRequestAndResponse } from '../../../testData/mockData';
import * as cognito from '../../../../src/data/cognito';
import { ADMIN_DELETE_USER_ATTRIBUTE } from '../../../../src/constants/attributes';
import { getSessionAttribute } from '../../../../src/utils/sessions';

describe('api admin deleteUser', () => {
    const adminDeleteUserSpy = jest.spyOn(cognito, 'adminDeleteUser');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should delete the user and redirect to the user list with a success message', async () => {
        adminDeleteUserSpy.mockResolvedValueOnce();
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', email: 'user@example.com' },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(adminDeleteUserSpy).toHaveBeenCalledWith('user@example.com');
        expect(getSessionAttribute(req, ADMIN_DELETE_USER_ATTRIBUTE)).toEqual({
            errors: [],
            success: 'user@example.com',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/admin/users' });
    });

    it('should redirect to the error page when username is missing', async () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });

        await deleteUser(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/error' });
    });

    it('should redirect back to deleteUser with an error when deletion fails', async () => {
        adminDeleteUserSpy.mockRejectedValueOnce(new Error('Failed to delete user: boom'));
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', email: 'user@example.com' },
            mockWriteHeadFn: writeHeadMock,
        });

        await deleteUser(req, res);

        expect(getSessionAttribute(req, ADMIN_DELETE_USER_ATTRIBUTE)?.errors).toHaveLength(1);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/admin/deleteUser?username=user%40example.com',
        });
    });
});
