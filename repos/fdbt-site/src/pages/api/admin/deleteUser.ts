import { NextApiResponse } from 'next';
import { NextApiRequestWithSession } from '../../../interfaces';
import { redirectTo, redirectToError } from '../../../utils/apiUtils';
import { updateSessionAttribute } from '../../../utils/sessions';
import { ADMIN_DELETE_USER_ATTRIBUTE } from '../../../constants/attributes';
import { adminDeleteUser } from '../../../data/cognito';
import logger from '../../../utils/logger';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { username, email } = req.body;

        if (!username) {
            throw new Error('username was not provided');
        }

        try {
            await adminDeleteUser(username);
            updateSessionAttribute(req, ADMIN_DELETE_USER_ATTRIBUTE, { errors: [], success: email ?? username });
            redirectTo(res, '/admin/users');
        } catch (error) {
            logger.warn(error, { context: 'api.admin.deleteUser', message: 'failed to delete user' });
            updateSessionAttribute(req, ADMIN_DELETE_USER_ATTRIBUTE, {
                errors: [{ id: 'delete-user-button', errorMessage: 'There was a problem deleting the user' }],
            });
            redirectTo(res, `/admin/deleteUser?username=${encodeURIComponent(username)}`);
        }
    } catch (error) {
        redirectToError(res, 'there was an error deleting an admin user', 'api.admin.deleteUser', error);
    }
};
