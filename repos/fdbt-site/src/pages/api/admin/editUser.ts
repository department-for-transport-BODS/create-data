import { NextApiResponse } from 'next';
import { ErrorInfo, NextApiRequestWithSession } from '../../../interfaces';
import { redirectTo, redirectToError } from '../../../utils/apiUtils';
import { updateSessionAttribute } from '../../../utils/sessions';
import { ADMIN_EDIT_USER_ATTRIBUTE } from '../../../constants/attributes';
import { updateUserAttributes } from '../../../data/cognito';
import { cognitoFormatNocs } from '../../../utils/adminUsers';
import logger from '../../../utils/logger';

const setErrorsAndRedirect = (req: NextApiRequestWithSession, res: NextApiResponse, errors: ErrorInfo[]): void => {
    updateSessionAttribute(req, ADMIN_EDIT_USER_ATTRIBUTE, { errors });
    redirectTo(res, `/admin/editUser?username=${encodeURIComponent(req.body?.username ?? '')}`);
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { username, nocs } = req.body;

        if (!username) {
            throw new Error('username was not provided');
        }

        if (!nocs) {
            setErrorsAndRedirect(req, res, [
                { id: 'nocs', errorMessage: 'Enter at least one National Operator Code (NOC)' },
            ]);
            return;
        }

        try {
            await updateUserAttributes(username, [{ Name: 'custom:noc', Value: cognitoFormatNocs(nocs) }]);
            updateSessionAttribute(req, ADMIN_EDIT_USER_ATTRIBUTE, { errors: [], success: username });
            redirectTo(res, `/admin/editUser?username=${encodeURIComponent(username)}`);
        } catch (error) {
            logger.warn(error, { context: 'api.admin.editUser', message: 'failed to update user' });
            setErrorsAndRedirect(req, res, [{ id: 'nocs', errorMessage: 'There was a problem editing the user' }]);
        }
    } catch (error) {
        redirectToError(res, 'there was an error editing an admin user', 'api.admin.editUser', error);
    }
};
