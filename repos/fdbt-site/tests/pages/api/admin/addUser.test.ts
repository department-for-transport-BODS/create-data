import addUser from '../../../../src/pages/api/admin/addUser';
import { getMockRequestAndResponse } from '../../../testData/mockData';
import * as cognito from '../../../../src/data/cognito';
import { ADMIN_ADD_USER_ATTRIBUTE } from '../../../../src/constants/attributes';
import { getSessionAttribute } from '../../../../src/utils/sessions';

describe('api admin addUser', () => {
    const adminCreateUserSpy = jest.spyOn(cognito, 'adminCreateUser');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should create the user and redirect back to addUser with a success message', async () => {
        adminCreateUserSpy.mockResolvedValueOnce();
        const { req, res } = getMockRequestAndResponse({
            body: { email: 'new@example.com', nocs: 'NOC1,NOC2' },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(adminCreateUserSpy).toHaveBeenCalledWith('new@example.com', 'NOC1|NOC2');
        expect(getSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE)).toEqual({
            errors: [],
            success: 'new@example.com',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/admin/addUser' });
    });

    it('should redirect with errors when the email is invalid', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { email: 'not-an-email', nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(adminCreateUserSpy).not.toHaveBeenCalled();
        expect(getSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE)?.errors).toHaveLength(1);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/admin/addUser' });
    });

    it('should redirect with errors when nocs are missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { email: 'new@example.com', nocs: '' },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(adminCreateUserSpy).not.toHaveBeenCalled();
        expect(getSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE)?.errors).toHaveLength(1);
    });

    it('should redirect with an error when user creation fails', async () => {
        adminCreateUserSpy.mockRejectedValueOnce(new Error('Failed to create user: boom'));
        const { req, res } = getMockRequestAndResponse({
            body: { email: 'new@example.com', nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await addUser(req, res);

        expect(getSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE)?.errors).toHaveLength(1);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/admin/addUser' });
    });
});
