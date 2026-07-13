import { NextApiRequest, NextApiResponse } from 'next';
import zxcvbn from 'zxcvbn';
import { parseCookie, serialize } from 'cookie';
import { IncomingMessage, ServerResponse } from 'http';
import { decode } from 'jsonwebtoken';
import { DISABLE_AUTH_COOKIE, ID_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../constants';
import {
    CARNET_FARE_TYPE_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
} from '../../constants/attributes';
import {
    CognitoIdToken,
    ErrorInfo,
    FareType,
    FareTypeWithErrors,
    NextApiRequestWithSession,
    SchoolFareTypeAttribute,
} from '../../interfaces';
import { globalSignOut } from '../../data/cognito';
import logger from '../logger';
import { destroySession, getSessionAttribute } from '../sessions';
import { isFareType, isWithErrors } from '../../interfaces/typeGuards';
import { daysOfWeek } from '../../../src/constants';

const listFormat = new Intl.ListFormat('en');

const getCookieHeader = (req: IncomingMessage): string => {
    const cookieHeader = req.headers.cookie;

    if (Array.isArray(cookieHeader)) {
        return cookieHeader.join('; ');
    }

    return cookieHeader ?? '';
};

const getCookieValueFromRequest = (req: IncomingMessage, cookieName: string): string | undefined => {
    return parseCookie(getCookieHeader(req))[cookieName];
};

export const parseCookiesFromRequest = (req: IncomingMessage): Record<string, string | undefined> =>
    parseCookie(getCookieHeader(req));

const appendSetCookieHeader = (res: ServerResponse, serialisedCookie: string): void => {
    const existingSetCookieHeader = res.getHeader('Set-Cookie');
    const existingCookies = Array.isArray(existingSetCookieHeader)
        ? existingSetCookieHeader.map((value) => String(value))
        : existingSetCookieHeader
          ? [String(existingSetCookieHeader)]
          : [];

    res.setHeader('Set-Cookie', [...existingCookies, serialisedCookie]);
};

export const setCookieOnResponseObject = (
    cookieName: string,
    cookieValue: string,
    _req: unknown,
    res: ServerResponse,
    lifetime?: number,
    httpOnly = true,
): void => {
    appendSetCookieHeader(
        res,
        serialize(cookieName, cookieValue, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            maxAge: lifetime,
            httpOnly,
        }),
    );
};

export const deleteCookieOnResponseObject = (cookieName: string, _req: unknown, res: ServerResponse): void => {
    appendSetCookieHeader(
        res,
        serialize(cookieName, '', {
            expires: new Date(0),
            maxAge: 0,
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            httpOnly: true,
        }),
    );
};

export const unescapeAndDecodeCookie = (req: NextApiRequest, cookieToDecode: string): string => {
    return unescape(decodeURI(getCookieValueFromRequest(req, cookieToDecode) || ''));
};

export const getUuidFromSession = (req: NextApiRequestWithSession): string => {
    const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);

    return operatorAttribute?.uuid ?? '';
};

export const redirectTo = (res: NextApiResponse | ServerResponse, location: string): void => {
    res.writeHead(302, {
        Location: location,
    });
    res.end();
};

export const redirectToError = (
    res: NextApiResponse | ServerResponse,
    message: string,
    context: string,
    error: Error,
): void => {
    logger.error(message, { context, error: error.stack });
    redirectTo(res, '/error');
};

export const getIsCarnet = (req: NextApiRequestWithSession): boolean => {
    const isCarnet = getSessionAttribute(req, CARNET_FARE_TYPE_ATTRIBUTE);

    return isCarnet || false;
};

export const getFareTypeFromFromAttributes = (req: NextApiRequestWithSession): string => {
    const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);
    const schoolFareTypeAttribute = getSessionAttribute(req, SCHOOL_FARE_TYPE_ATTRIBUTE);

    if (
        !isFareType(fareTypeAttribute) ||
        (fareTypeAttribute.fareType === 'schoolService' && !schoolFareTypeAttribute)
    ) {
        throw new Error('Incorrect fare type session attributes found.');
    }

    return fareTypeAttribute.fareType === 'schoolService'
        ? (schoolFareTypeAttribute as SchoolFareTypeAttribute).schoolFareType
        : fareTypeAttribute.fareType;
};

export const redirectOnFareType = (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    const fareTypeAttribute = getSessionAttribute(req, FARE_TYPE_ATTRIBUTE);

    if (isFareType(fareTypeAttribute)) {
        switch (fareTypeAttribute.fareType) {
            case 'period':
            case 'multiOperator':
            case 'multiOperatorExt':
            case 'flatFare':
            case 'schoolService':
                redirectTo(res, '/ticketRepresentation');
                return;
            case 'single':
            case 'return':
                redirectTo(res, '/service');
                return;
            default:
                throw new Error('Did not receive an expected fareType.');
        }
    } else {
        throw new Error('Could not extract fareType from the fare type attribute.');
    }
};

export const checkEmailValid = (email: string): boolean => {
    const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    return emailRegex.test(email) && email !== '';
};

export const getAttributeFromIdToken = <T extends keyof CognitoIdToken>(
    req: NextApiRequest,
    _res: NextApiResponse,
    attribute: T,
): CognitoIdToken[T] | null => {
    const idToken = getCookieValueFromRequest(req, ID_TOKEN_COOKIE);

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (req: NextApiRequest, res: NextApiResponse): string | null =>
    getAttributeFromIdToken(req, res, 'custom:noc');

export const getEmailFromIdToken = (req: NextApiRequest, res: NextApiResponse): string | null =>
    getAttributeFromIdToken(req, res, 'email');

export const getAndValidateNoc = (req: NextApiRequestWithSession, res: NextApiResponse): string => {
    const idTokenNoc = getNocFromIdToken(req, res);

    const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);

    const splitNoc = idTokenNoc?.split('|');

    if (operatorAttribute?.nocCode && idTokenNoc && splitNoc?.includes(operatorAttribute?.nocCode)) {
        return operatorAttribute.nocCode;
    }

    throw new Error('invalid NOC set');
};

export const getSchemeOpRegionFromIdToken = (req: NextApiRequest, res: NextApiResponse): string | null =>
    getAttributeFromIdToken(req, res, 'custom:schemeRegionCode');

export const getAndValidateSchemeOpRegion = (req: NextApiRequestWithSession, res: NextApiResponse): string | null => {
    const idTokenSchemeOpRegion = getSchemeOpRegionFromIdToken(req, res);
    const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);

    const region = operatorAttribute?.region;

    if (!region && !idTokenSchemeOpRegion) {
        return null;
    }

    if (!region || !idTokenSchemeOpRegion || (region && idTokenSchemeOpRegion && region !== idTokenSchemeOpRegion)) {
        throw new Error('invalid scheme operator region code set');
    }

    return region;
};

export const isSchemeOperator = (req: NextApiRequestWithSession, res: NextApiResponse): boolean =>
    !!getAndValidateSchemeOpRegion(req, res);

export const signOutUser = async (
    username: string | null,
    req: NextApiRequestWithSession,
    res: NextApiResponse,
): Promise<void> => {
    if (username) {
        await globalSignOut(username);
    }

    deleteCookieOnResponseObject(ID_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(REFRESH_TOKEN_COOKIE, req, res);
    deleteCookieOnResponseObject(DISABLE_AUTH_COOKIE, req, res);

    destroySession(req);
};

export const getSelectedStages = (req: NextApiRequest): string[][] => {
    const requestBody = req.body;

    const selectObjectsArray: string[][] = [];

    Object.keys(requestBody).map((e) => {
        if (requestBody[e] !== '') {
            selectObjectsArray.push(requestBody[e]);
        }
        return null;
    });

    return selectObjectsArray;
};

export const validatePasswordConformsToPolicy = (password: string): string[] => {
    const passwordError = [];

    if (password.length < 8) {
        passwordError.push('be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        passwordError.push('contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        passwordError.push('contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        passwordError.push('contain at least one number');
    }

    if (!/[$^*.[\]{}()?"!@#%&/\\,><':;|_~`=+-]/.test(password)) {
        passwordError.push('contain at least one special character');
    }

    return passwordError;
};

export const validatePassword = (
    password: string,
    confirmPassword: string,
    errorId: string,
    isUpdate?: boolean,
): ErrorInfo | null => {
    let passwordError = '';

    if (password.length === 0) {
        passwordError = `Enter a ${isUpdate ? 'new ' : ''}password`;

        return { id: errorId, errorMessage: passwordError };
    }

    const passwordPolicyErrors = validatePasswordConformsToPolicy(password);

    if (passwordPolicyErrors.length > 0) {
        return { id: errorId, errorMessage: `Password must ${listFormat.format(passwordPolicyErrors)}` };
    }

    if (password !== confirmPassword) {
        return { id: errorId, errorMessage: 'Passwords do not match' };
    }
    if (zxcvbn(password).score < 3) {
        return {
            id: errorId,
            errorMessage:
                'Your password is too weak. Try adding another word or two. Uncommon words are better. Avoid repeating characters. An example of a strong password is one with three or more uncommon words, one after another.',
        };
    }

    return null;
};

export const dateIsOverThirtyMinutesAgo = (inputDate: Date): boolean => {
    const thirtyMinutesInMilliseconds = 60 * 30 * 1000;
    const date = new Date(inputDate).getTime();
    const thirtyMinutesAgo = Date.now() - thirtyMinutesInMilliseconds;
    return date < thirtyMinutesAgo;
};

export const isADayOfTheWeek = (input: string | undefined): boolean => {
    return !!input && daysOfWeek.includes(input);
};

export const exportHasStarted = (exportStarted: number): boolean => {
    const currTime = new Date().getTime() / 1000;

    return currTime - exportStarted > 5;
};

export const isSchoolFareType = (fareTypeAttribute: FareType | FareTypeWithErrors | undefined): boolean => {
    return !!fareTypeAttribute && !isWithErrors(fareTypeAttribute) && fareTypeAttribute.fareType === 'schoolService';
};
