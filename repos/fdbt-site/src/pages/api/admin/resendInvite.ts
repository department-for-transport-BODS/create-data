import { NextApiResponse } from 'next';
import { NextApiRequestWithSession } from '../../../interfaces';
import { redirectTo, redirectToError } from '../../../utils/apiUtils';
import { updateSessionAttribute } from '../../../utils/sessions';
import { ADMIN_RESEND_INVITE_ATTRIBUTE } from '../../../constants/attributes';
import { adminCreateUser, adminDeleteUser } from '../../../data/cognito';
import logger from '../../../utils/logger';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { username, email, nocs } = req.body;

        if (!username || !email || !nocs) {
            throw new Error('username, email and nocs must all be provided');
        }

        try {
            await adminDeleteUser(username);
            await adminCreateUser(email, nocs);
            updateSessionAttribute(req, ADMIN_RESEND_INVITE_ATTRIBUTE, { errors: [], success: email });
            redirectTo(res, `/admin/resendInvite?username=${encodeURIComponent(email)}`);
        } catch (error) {
            logger.warn(error, { context: 'api.admin.resendInvite', message: 'failed to resend invite' });
            updateSessionAttribute(req, ADMIN_RESEND_INVITE_ATTRIBUTE, {
                errors: [{ id: 'resend-invite-button', errorMessage: 'There was a problem resending the invite' }],
            });
            redirectTo(res, `/admin/resendInvite?username=${encodeURIComponent(username)}`);
        }
    } catch (error) {
        redirectToError(res, 'there was an error resending an invite', 'api.admin.resendInvite', error);
    }
};
