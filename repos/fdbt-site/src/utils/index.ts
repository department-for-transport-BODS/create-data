import * as cookie from 'cookie';
import Cookies from 'js-cookie';
import { NextPageContext } from 'next';
import { IncomingMessage } from 'http';
import { decodeJwt as decode } from 'jose';
import startCase from 'lodash/startCase';
import toLower from 'lodash/toLower';
import dayjs from './dayjs';
import {
    ID_TOKEN_COOKIE,
    REFRESH_TOKEN_COOKIE,
    DISABLE_AUTH_COOKIE,
    COOKIES_POLICY_COOKIE,
    COOKIE_PREFERENCES_COOKIE,
    CSRF_COOKIE,
    EXPRESS_SESSION_COOKIE,
    purchaseMethodsValuesMap,
} from '../constants';
import { OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { getSessionAttribute } from './sessions';
import {
    ErrorInfo,
    CognitoIdToken,
    NextPageContextWithSession,
    DocumentContextWithSession,
    ResponseWithLocals,
} from '../interfaces';
import { Stop, Ticket, TicketWithIds, ReturnTicket } from '../interfaces/matchingJsonTypes';

const parseCookiesFromContext = (ctx: NextPageContext): Record<string, string | undefined> => {
    const cookieHeader = ctx.req?.headers?.cookie;

    if (cookieHeader) {
        return cookie.parse(cookieHeader);
    }

    if (typeof document !== 'undefined') {
        return Cookies.get() as Record<string, string | undefined>;
    }

    return {};
};

const appendSetCookieHeader = (ctx: NextPageContext, serialisedCookie: string): void => {
    if (!ctx.res) {
        return;
    }

    const existingSetCookieHeader = ctx.res.getHeader('Set-Cookie');
    const existingCookies = Array.isArray(existingSetCookieHeader)
        ? existingSetCookieHeader.map((value) => String(value))
        : existingSetCookieHeader
          ? [String(existingSetCookieHeader)]
          : [];

    ctx.res.setHeader('Set-Cookie', [...existingCookies, serialisedCookie]);
};

const destroyCookieInContext = (ctx: NextPageContext, cookieName: string): void => {
    const serialisedCookie = cookie.serialize(cookieName, '', {
        expires: new Date(0),
        maxAge: 0,
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
    });

    if (ctx.res) {
        appendSetCookieHeader(ctx, serialisedCookie);
        return;
    }

    if (typeof document !== 'undefined') {
        Cookies.remove(cookieName, { path: '/' });
    }
};

export const formatFailedFileNames = (failedExportFileNames: string[]): string => {
    // example filename
    // FX-PI-01_UK_BRTB_NETWORK-FARE_My-Best-Product_2022-10-28_2020-02-01_fab0.xml
    const names = failedExportFileNames.map((fileName) => {
        const isNetworkFare = fileName.includes('NETWORK-FARE');
        const productNameChunk = fileName.split(isNetworkFare ? 'NETWORK-FARE_' : 'LINE-FARE_')[1];
        const amountOfCharactersInProductName = productNameChunk.length - 31;
        return productNameChunk.substring(0, amountOfCharactersInProductName);
    });

    return names.join(', ');
};

export const getProofDocumentsString = (documents: string[]): string =>
    documents.map((document) => sentenceCaseString(document)).join(', ');

export const deleteAllCookiesOnServerSide = (ctx: NextPageContext): void => {
    const cookies = parseCookiesFromContext(ctx);
    const cookieWhitelist = [
        ID_TOKEN_COOKIE,
        REFRESH_TOKEN_COOKIE,
        DISABLE_AUTH_COOKIE,
        COOKIES_POLICY_COOKIE,
        COOKIE_PREFERENCES_COOKIE,
        CSRF_COOKIE,
        EXPRESS_SESSION_COOKIE,
    ];

    Object.keys(cookies).forEach((cookie) => {
        if (!cookieWhitelist.includes(cookie)) {
            destroyCookieInContext(ctx, cookie);
        }
    });
};

export const formatSOPArray = (stringArray: string[]): string =>
    stringArray.map((string) => purchaseMethodsValuesMap[string] || sentenceCaseString(string)).join(', ');

export const getHost = (req: IncomingMessage | undefined): string => {
    if (!req) {
        return '';
    }
    const host = req?.headers?.host;

    if (host) {
        if (host && host.startsWith('localhost')) {
            return `http://${host}`;
        }
        return `https://${host}`;
    }

    return '';
};

export const getUuidFromSession = (ctx: NextPageContextWithSession): string | null => {
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    return operatorAttribute?.uuid ?? null;
};

export const formatStopName = (stop: Stop): string =>
    `${stop.localityName ? `${stop.localityName}, ` : ''}${stop.indicator ?? ''} ${stop.stopName ?? ''}${
        stop.street ? ` (on ${stop.street})` : ''
    }`;

export const buildTitle = (errors: ErrorInfo[], title: string): string => {
    if (errors.length > 0) {
        return `Error: ${title}`;
    }

    return title;
};

export const sentenceCaseString = (input: string): string => {
    const startCasedInput = startCase(input);
    if (startCasedInput.includes(' ')) {
        const splitStartCasedInput = startCasedInput.split(' ');
        return splitStartCasedInput
            .map((section, index) => {
                if (index === 0) {
                    return section;
                }
                return toLower(section);
            })
            .join(' ');
    }
    return startCasedInput;
};

export const getAttributeFromIdToken = <T extends keyof CognitoIdToken>(
    ctx: NextPageContext,
    attribute: T,
): CognitoIdToken[T] | null => {
    const cookies = parseCookiesFromContext(ctx);
    const idToken = cookies[ID_TOKEN_COOKIE];

    if (!idToken) {
        return null;
    }

    const decodedIdToken = decode(idToken) as CognitoIdToken;

    return decodedIdToken[attribute] ?? null;
};

export const getNocFromIdToken = (ctx: NextPageContext): string | null => getAttributeFromIdToken(ctx, 'custom:noc');

export const getAndValidateNoc = (ctx: NextPageContextWithSession): string => {
    const idTokenNoc = getNocFromIdToken(ctx);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const sessionNoc = operatorAttribute?.nocCode;
    const splitNoc = idTokenNoc?.split('|');

    if (sessionNoc && idTokenNoc && splitNoc?.includes(sessionNoc)) {
        return sessionNoc;
    }

    throw new Error('invalid NOC set');
};

export const getSchemeOpRegionFromIdToken = (ctx: NextPageContext): string | null =>
    getAttributeFromIdToken(ctx, 'custom:schemeRegionCode');

export const getAndValidateSchemeOpRegion = (ctx: NextPageContextWithSession): string | null => {
    const idTokenSchemeOpRegion = getSchemeOpRegionFromIdToken(ctx);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const sessionRegion = operatorAttribute?.region;

    if (!sessionRegion && !idTokenSchemeOpRegion) {
        return null;
    }

    if (
        !sessionRegion ||
        !idTokenSchemeOpRegion ||
        (sessionRegion && idTokenSchemeOpRegion && sessionRegion !== idTokenSchemeOpRegion)
    ) {
        throw new Error('invalid scheme operator region code set');
    }

    return sessionRegion;
};

export const isSchemeOperator = (ctx: NextPageContextWithSession): boolean => !!getAndValidateSchemeOpRegion(ctx);

export const getErrorsByIds = (ids: string[], errors: ErrorInfo[]): ErrorInfo[] => {
    const compactErrors: ErrorInfo[] = [];
    errors.forEach((error) => {
        if (ids.includes(error.id)) {
            compactErrors.push(error);
        }
    });
    return compactErrors;
};

export const checkIfMultipleOperators = (ctx: NextPageContextWithSession): boolean => {
    const databaseNocs = getNocFromIdToken(ctx);
    let nocs: string[] = [];
    if (databaseNocs) {
        nocs = databaseNocs.split('|');
    }
    return nocs?.length > 1;
};

export const getCsrfToken = (ctx: DocumentContextWithSession | NextPageContextWithSession | NextPageContext): string =>
    (ctx.res as ResponseWithLocals)?.locals?.csrfToken ?? '';

export const toArray = (thing: string | string[] | undefined): string[] => {
    if (thing === undefined) {
        return [];
    }

    return Array.isArray(thing) ? thing : [thing];
};

export const chunk = <T>(array: T[], size: number): T[][] => {
    const copy = [...array];
    const chunks = [];
    while (copy.length > 0) {
        chunks.push(copy.splice(0, size));
    }
    return chunks;
};

export const convertDateFormat = (date: string): string => {
    return dayjs(date).format('DD/MM/YYYY');
};

export const isReturnTicket = (ticket: Ticket | TicketWithIds): ticket is ReturnTicket => ticket.type === 'return';

export const objectKeyMatchesExportNameExactly = (objectKey: string, exportName: string): boolean => {
    const parts = objectKey.split('/');
    const exportNamePart = parts[2];
    return exportNamePart === exportName;
};

export const fareTypeIsAllowedToAddACap = (fareType: string): boolean => {
    return !!fareType && ['single', 'return', 'flatFare'].includes(fareType);
};

export const removeDuplicateServices = <T>(services: T[]): T[] => {
    const lineId = 'lineId' as keyof T;
    const startDate = 'startDate' as keyof T;
    const endDate = 'endDate' as keyof T;

    return services.filter(
        (value, index, self) =>
            index ===
            self.findIndex(
                (service) =>
                    service[lineId] === value[lineId] &&
                    service[startDate] === value[startDate] &&
                    service[endDate] === value[endDate],
            ),
    );
};

export const getAdditionalNocMatchingJsonLink = (matchingJsonLink: string, noc: string): string =>
    `${matchingJsonLink.substring(0, matchingJsonLink.lastIndexOf('.json'))}_${noc}.json`;
