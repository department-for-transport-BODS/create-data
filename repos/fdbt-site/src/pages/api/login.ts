import { NextApiResponse } from 'next';
import { decodeJwt } from 'jose';
import { redirectTo, redirectToError, setCookieOnResponseObject, checkEmailValid } from '../../utils/apiUtils';
import { ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../constants';
import { OPERATOR_ATTRIBUTE } from '../../constants/attributes';
import { ErrorInfo, CognitoIdToken, NextApiRequestWithSession } from '../../interfaces';
import { getOperatorNameByNocCode } from '../../data/auroradb';
import { initiateAuth } from '../../data/cognito';
import logger from '../../utils/logger';
import { updateSessionAttribute } from '../../utils/sessions';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { email, password } = req.body;

        const errors: ErrorInfo[] = [];

        if (!checkEmailValid(email)) {
            errors.push({
                id: 'email',
                errorMessage: 'Enter an email address in the correct format, like name@example.com',
            });
        }

        if (!password) {
            errors.push({
                id: 'password',
                errorMessage: 'Enter a password',
            });
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { errors, email });
            redirectTo(res, '/login');

            return;
        }

        try {
            const authResponse = await initiateAuth(email, password);

            if (authResponse?.AuthenticationResult) {
                const idToken = authResponse.AuthenticationResult.IdToken as string;
                const refreshToken = authResponse.AuthenticationResult.RefreshToken as string;

                const decodedIdToken = decodeJwt(idToken) as CognitoIdToken;
                const nocCode = decodedIdToken['custom:noc'];
                const schemeOpName = decodedIdToken['custom:schemeOperator'];
                const schemeOpRegion = decodedIdToken['custom:schemeRegionCode'];

                if (nocCode && !schemeOpName && !schemeOpRegion) {
                    if (nocCode.split('|').length === 1) {
                        const operatorName = await getOperatorNameByNocCode(nocCode);
                        updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { name: operatorName, nocCode });
                    }
                } else if (schemeOpName && schemeOpRegion) {
                    updateSessionAttribute(req, OPERATOR_ATTRIBUTE, {
                        name: schemeOpName,
                        region: schemeOpRegion,
                        nocCode,
                    });
                } else if (!nocCode || (!schemeOpName && !schemeOpRegion)) {
                    throw new Error('Could not extract user info from their ID Token.');
                }

                setCookieOnResponseObject(ID_TOKEN_COOKIE, idToken, req, res);
                setCookieOnResponseObject(REFRESH_TOKEN_COOKIE, refreshToken, req, res);

                logger.info('', {
                    context: 'api.login',
                    message: 'login successful',
                    noc: nocCode,
                });
                redirectTo(res, '/home');
            } else {
                throw new Error('Auth response invalid');
            }
        } catch (error) {
            logger.warn(error, { context: 'api.login', message: 'login failed', stack: error.stack });

            errors.push({
                id: 'login',
                errorMessage: 'The email address and/or password are not correct.',
            });
            updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { errors });
            redirectTo(res, '/login');
        }
    } catch (error) {
        const message = 'There was a problem signing into your account';
        redirectToError(res, message, 'api.login', error);
    }
};
