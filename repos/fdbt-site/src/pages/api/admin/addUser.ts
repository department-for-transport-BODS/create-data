import { NextApiResponse } from 'next';
import { ErrorInfo, NextApiRequestWithSession } from '../../../interfaces';
import { checkEmailValid, redirectTo, redirectToError } from '../../../utils/apiUtils';
import { updateSessionAttribute } from '../../../utils/sessions';
import { ADMIN_ADD_USER_ATTRIBUTE } from '../../../constants/attributes';
import { adminCreateUser } from '../../../data/cognito';
import { cognitoFormatNocs } from '../../../utils/adminUsers';
import logger from '../../../utils/logger';

const setErrorsAndRedirect = (req: NextApiRequestWithSession, res: NextApiResponse, errors: ErrorInfo[]): void => {
    updateSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE, { errors });
    redirectTo(res, '/admin/addUser');
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { email, nocs } = req.body;
        const errors: ErrorInfo[] = [];

        if (!email || !checkEmailValid(email)) {
            errors.push({ id: 'email', errorMessage: 'Enter an email address in the correct format' });
        }

        if (!nocs) {
            errors.push({ id: 'nocs', errorMessage: 'Enter at least one National Operator Code (NOC)' });
        }

        if (errors.length > 0) {
            setErrorsAndRedirect(req, res, errors);
            return;
        }

        try {
            await adminCreateUser(email, cognitoFormatNocs(nocs));
            updateSessionAttribute(req, ADMIN_ADD_USER_ATTRIBUTE, { errors: [], success: email });
            redirectTo(res, '/admin/addUser');
        } catch (error) {
            logger.warn(error, { context: 'api.admin.addUser', message: 'failed to create user' });

            const errorMessage = error?.message?.includes('UsernameExistsException')
                ? 'A user with this email address already exists'
                : 'There was a problem creating the user';

            setErrorsAndRedirect(req, res, [{ id: 'email', errorMessage }]);
        }
    } catch (error) {
        redirectToError(res, 'there was an error adding an admin user', 'api.admin.addUser', error);
    }
};
