import jwksClient from 'jwks-rsa';
import { verify, sign, decode, VerifyOptions, JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import { Request, Response, NextFunction, Express } from 'express';
import {
    ID_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    DISABLE_AUTH_COOKIE,
    COOKIE_PREFERENCES_COOKIE,
    COOKIES_POLICY_COOKIE,
    oneYearInSeconds,
} from '../../src/constants';
import { OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { CognitoIdToken, CookiePolicy } from '../../src/interfaces';
import { globalSignOut, initiateRefreshAuth } from '../../src/data/cognito';
import logger from '../../src/utils/logger';
import {
    setCookieOnResponseObject,
    deleteCookieOnResponseObject,
    parseCookiesFromRequest,
} from '../../src/utils/apiUtils';

const signOutUser = async (username: string | null, req: Request, res: Response): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject('connect.sid', req, res);

    if (req?.session) {
        req.session[OPERATOR_ATTRIBUTE] = undefined;
    }
};

const cognitoUri = `https://cognito-idp.eu-west-2.amazonaws.com/${process.env.FDBT_USER_POOL_ID}`;

const jwks = jwksClient({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${cognitoUri}/.well-known/jwks.json`,
});

const getKey = (header: JwtHeader, callback: SigningKeyCallback): void => {
    jwks.getSigningKey(header.kid ?? '', (err, key) => {
        const signingKey = key?.getPublicKey();
        callback(err ?? null, signingKey);
    });
};

const verifyOptions: VerifyOptions = {
    audience: process.env.FDBT_USER_POOL_CLIENT_ID,
    issuer: cognitoUri,
    algorithms: ['RS256'],
};

export const setDisableAuthParameters = (server: Express): void => {
    server.use((req, res, next) => {
        const isDevelopment = process.env.NODE_ENV === 'development';
        const disableAuthQuery = req.query.disableAuth as string;
        const parsedCookies = parseCookiesFromRequest(req);

        if ((isDevelopment || process.env.ALLOW_DISABLE_AUTH === '1') && disableAuthQuery) {
            const disableAuthCookie = parsedCookies[DISABLE_AUTH_COOKIE];

            if (!disableAuthCookie || disableAuthCookie === 'false') {
                const cookiePolicy: CookiePolicy = { essential: true, usage: true };

                setCookieOnResponseObject(COOKIE_PREFERENCES_COOKIE, 'true', req, res, oneYearInSeconds, false);
                setCookieOnResponseObject(
                    COOKIES_POLICY_COOKIE,
                    JSON.stringify(cookiePolicy),
                    req,
                    res,
                    oneYearInSeconds,
                    false,
                );
                setCookieOnResponseObject(DISABLE_AUTH_COOKIE, 'true', req, res);

                if (disableAuthQuery === 'scheme') {
                    const jwtToken = sign(
                        {
                            'custom:noc': 'TESTSE',
                            'custom:schemeOperator': 'Test Scheme Op',
                            'custom:schemeRegionCode': 'SE',
                            'custom:multiOpEmailEnabled': false,
                            email: 'test@example.com',
                        },
                        'test',
                    );

                    setCookieOnResponseObject(ID_TOKEN_COOKIE, jwtToken, req, res);
                    if (req?.session) {
                        req.session[OPERATOR_ATTRIBUTE] = {
                            name: 'Test Scheme Op',
                            region: 'SE',
                            nocCode: 'TESTSE',
                        };
                    }
                } else {
                    const nocs: string[] = disableAuthQuery.split('_');
                    const jwtToken = sign(
                        {
                            'custom:noc': nocs.join('|'),
                            'custom:multiOpEmailEnabled': false,
                            email: 'test@example.com',
                        },
                        'test',
                    );

                    setCookieOnResponseObject(ID_TOKEN_COOKIE, jwtToken, req, res);

                    if (req?.session && nocs.length === 1) {
                        req.session[OPERATOR_ATTRIBUTE] = {
                            name: 'Test Operator',
                            nocCode: nocs[0],
                        };
                    }
                }

                res.redirect('/home');
            }
        }

        next();
    });
};

export default (req: Request, res: Response, next: NextFunction): void => {
    const logoutAndRedirect = (username: string | null = null): void => {
        signOutUser(username, req, res)
            .then(() => res.redirect('/login'))
            .catch((error) => {
                logger.error(error, {
                    context: 'server.middleware.authentication',
                    message: 'failed to sign out user',
                });
                res.redirect('/login');
            });
    };

    const parsedCookies = parseCookiesFromRequest(req);
    const disableAuthCookie = parsedCookies[DISABLE_AUTH_COOKIE];

    if (
        (process.env.NODE_ENV === 'development' || process.env.ALLOW_DISABLE_AUTH === '1') &&
        (disableAuthCookie === 'true' || req.query.disableAuth)
    ) {
        next();
        return;
    }

    const idToken = parsedCookies[ID_TOKEN_COOKIE] ?? null;

    if (!idToken) {
        res.redirect('/login');
        return;
    }

    verify(idToken, getKey, verifyOptions, (err) => {
        if (err) {
            const decodedToken = decode(idToken) as CognitoIdToken;
            const username = decodedToken?.['cognito:username'] ?? null;

            if (err.name === 'TokenExpiredError') {
                const refreshToken = parsedCookies[REFRESH_TOKEN_COOKIE] ?? null;

                if (refreshToken) {
                    logger.info('', {
                        context: 'server.middleware.authentication',
                        message: 'ID Token expired, attempting refresh',
                    });

                    initiateRefreshAuth(username, refreshToken)
                        .then((data) => {
                            if (data.AuthenticationResult?.IdToken) {
                                setCookieOnResponseObject(ID_TOKEN_COOKIE, data.AuthenticationResult.IdToken, req, res);
                                logger.info('', {
                                    context: 'server.middleware.authentication',
                                    message: 'successfully refreshed ID Token',
                                });

                                next();

                                return;
                            }

                            logoutAndRedirect(username);
                        })
                        .catch((error) => {
                            logger.warn(error, {
                                context: 'server.middleware.authentication',
                                message: 'failed to refresh ID token',
                            });
                            logoutAndRedirect(username);
                        });

                    return;
                }
            }

            logger.warn('', {
                context: 'server.middleware.authentication',
                message: 'ID Token invalid, clearing user session',
            });
            logoutAndRedirect(username);

            return;
        }

        next();
    });
};
