import editUser from '../../../../src/pages/api/admin/editUser';
import { getMockRequestAndResponse } from '../../../testData/mockData';
import * as cognito from '../../../../src/data/cognito';
import { ADMIN_EDIT_USER_ATTRIBUTE } from '../../../../src/constants/attributes';
import { getSessionAttribute } from '../../../../src/utils/sessions';

describe('api admin editUser', () => {
    const updateUserAttributesSpy = jest.spyOn(cognito, 'updateUserAttributes');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should update the user and redirect back to editUser with a success message', async () => {
        updateUserAttributesSpy.mockResolvedValueOnce();
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', nocs: 'NOC1,NOC2' },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(updateUserAttributesSpy).toHaveBeenCalledWith('user@example.com', [
            { Name: 'custom:noc', Value: 'NOC1|NOC2' },
        ]);
        expect(getSessionAttribute(req, ADMIN_EDIT_USER_ATTRIBUTE)).toEqual({
            errors: [],
            success: 'user@example.com',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/admin/editUser?username=user%40example.com',
        });
    });

    it('should redirect with errors when nocs are missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', nocs: '' },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(updateUserAttributesSpy).not.toHaveBeenCalled();
        expect(getSessionAttribute(req, ADMIN_EDIT_USER_ATTRIBUTE)?.errors).toHaveLength(1);
    });

    it('should redirect to the error page when username is missing', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: { nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/error' });
    });

    it('should redirect with an error when the update fails', async () => {
        updateUserAttributesSpy.mockRejectedValueOnce(new Error('Failed to update user attributes: boom'));
        const { req, res } = getMockRequestAndResponse({
            body: { username: 'user@example.com', nocs: 'NOC1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await editUser(req, res);

        expect(getSessionAttribute(req, ADMIN_EDIT_USER_ATTRIBUTE)?.errors).toHaveLength(1);
    });
});
