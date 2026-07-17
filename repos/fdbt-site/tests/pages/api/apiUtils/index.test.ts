import {
    setCookieOnResponseObject,
    getUuidFromSession,
    redirectOnFareType,
    checkEmailValid,
    getAttributeFromIdToken,
    validatePassword,
    getSelectedStages,
    getAndValidateSchemeOpRegion,
    isSchemeOperator,
    getFareTypeFromFromAttributes,
} from '../../../../src/utils/apiUtils';
import * as s3 from '../../../../src/data/s3';
import { getMockRequestAndResponse, mockSchemOpIdToken } from '../../../testData/mockData';
import {
    FARE_TYPE_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
} from '../../../../src/constants/attributes';
import { TicketType } from '../../../../src/interfaces/matchingJsonTypes';

describe('apiUtils', () => {
    const writeHeadMock = jest.fn();

    beforeEach(() => {
        jest.spyOn(s3, 'putStringInS3');
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('checkEmailisInvalid', () => {
        it.each([
            ['@email.com'],
            ['test@email'],
            ['  test@email.com'],
            ['t est@email.com'],
            ['t est@email.com'],
            ['test@email.com   '],
            ['test@email .com'],
        ])('should validate that %s returns false', (input) => {
            expect(checkEmailValid(input)).toBeFalsy();
        });
    });

    describe('checkEmailValid', () => {
        it.each([['test@email.com'], ['TEST@EMAIL.COM']])('should validate that %s returns true', (input) => {
            expect(checkEmailValid(input)).toBeTruthy();
        });
    });

    describe('setCookieOnResponseObject', () => {
        it('sets the Set-Cookie header', () => {
            const cookieName = 'test';
            const cookieValue = 'cookieValue';
            const { req, res } = getMockRequestAndResponse();

            const setHeaderSpy = jest.spyOn(res, 'setHeader');

            setCookieOnResponseObject(cookieName, cookieValue, req, res);

            expect(setHeaderSpy).toHaveBeenCalledWith('Set-Cookie', [
                expect.stringContaining(`${cookieName}=${cookieValue}`),
            ]);
        });
    });

    describe('getUuidFromSession', () => {
        it('should get the uuid from the session', () => {
            const { req } = getMockRequestAndResponse({
                cookieValues: {},
                body: null,
                uuid: {
                    operatorUuid: '780e3459-6305-4ae5-9082-b925b92cb46c',
                },
            });
            const result = getUuidFromSession(req);
            expect(result).toBe('780e3459-6305-4ae5-9082-b925b92cb46c');
        });
    });

    describe('getFareTypeFromFromAttributes', () => {
        it("should return the fare type from the FARE_TYPE_ATTRIBUTE when fareType is not 'schoolService'", () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'single' },
                },
            });
            const fareType = getFareTypeFromFromAttributes(req);
            expect(fareType).toBe('single');
        });

        it("should return the fare type from the SCHOOL_FARE_TYPE_ATTRIBUTE when fareType is 'schoolService'", () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                    [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
                },
            });
            const fareType = getFareTypeFromFromAttributes(req);
            expect(fareType).toBe('period');
        });

        it('should throw an error when the fare type is not a valid fare type', () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'FAKE FARE TYPE' as TicketType },
                },
            });
            expect(() => getFareTypeFromFromAttributes(req)).toThrow('Incorrect fare type session attributes found.');
        });

        it("should throw an error when the fare type is 'schoolService', but there is no SCHOOL_FARE_TYPE_ATTRIBUTE", () => {
            const { req } = getMockRequestAndResponse({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                },
            });
            expect(() => getFareTypeFromFromAttributes(req)).toThrow('Incorrect fare type session attributes found.');
        });
    });

    describe('redirectOnFareType', () => {
        it.each([
            ['/service', 'single'],
            ['/ticketRepresentation', 'period'],
            ['/service', 'return'],
            ['/ticketRepresentation', 'flatFare'],
            ['/ticketRepresentation', 'multiOperator'],
        ])('should return 302 redirect to %s when the %s ticket option is selected', (redirect, fareType) => {
            const { req, res } = getMockRequestAndResponse({
                mockWriteHeadFn: writeHeadMock,
                session: { [FARE_TYPE_ATTRIBUTE]: { fareType: fareType as TicketType } },
            });
            redirectOnFareType(req, res);
            expect(writeHeadMock).toHaveBeenCalledWith(302, {
                Location: redirect,
            });
        });

        it('should call redirectOnSchoolFareType when the schoolService ticket option is selected', () => {
            const { req, res } = getMockRequestAndResponse({
                mockWriteHeadFn: writeHeadMock,
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                    [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
                },
            });
            redirectOnFareType(req, res);
            expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/ticketRepresentation' });
        });

        it('should call redirectOnSchoolFareType when the schoolService ticket option is selected and school type is period', () => {
            const { req, res } = getMockRequestAndResponse({
                mockWriteHeadFn: writeHeadMock,
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'schoolService' },
                    [SCHOOL_FARE_TYPE_ATTRIBUTE]: { schoolFareType: 'period' },
                },
            });
            redirectOnFareType(req, res);
            expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/ticketRepresentation' });
        });

        it('should throw error if unexpected fare type is selected', () => {
            const { req, res } = getMockRequestAndResponse({
                mockWriteHeadFn: writeHeadMock,
                session: { [FARE_TYPE_ATTRIBUTE]: { fareType: 'roundabout' as TicketType } },
            });

            expect(() => {
                redirectOnFareType(req, res);
            }).toThrow(new Error('Could not extract fareType from the fare type attribute.'));
        });
    });

    describe('getAttributeFromIdToken', () => {
        let emailJwt: string;

        beforeEach(() => {
            // This JWT encodes an email of test@example.com
            emailJwt =
                'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.pwd0gdkeSRBqRpoNKxC8lK3SuydPKqKPRRdEE-eNEc0';
        });

        it('should retrieve given attribute if present', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: emailJwt,
                },
            });
            const email = getAttributeFromIdToken(req, res, 'email');

            expect(email).toBe('test@example.com');
        });

        it('should return null if not present', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: emailJwt,
                },
            });
            const email = getAttributeFromIdToken(req, res, 'custom:noc');

            expect(email).toBeNull();
        });
    });

    describe('getAndValidateSchemeOpRegion', () => {
        it('should return the scheme operator region code when the logged in user is a scheme operator', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                },
            });
            const region = getAndValidateSchemeOpRegion(req, res);
            expect(region).toBe('SCHEME_REGION');
        });

        it('should return null when the logged in user is not a scheme operator', () => {
            const { req, res } = getMockRequestAndResponse();
            const region = getAndValidateSchemeOpRegion(req, res);
            expect(region).toEqual(null);
        });

        it('should throw an error when the idToken and OPERATOR_ATTRIBUTE do not match', () => {
            const { req, res } = getMockRequestAndResponse({ cookieValues: { idToken: mockSchemOpIdToken } });
            expect(() => getAndValidateSchemeOpRegion(req, res)).toThrow();
        });
    });

    describe('isSchemeOperator', () => {
        it('should return true when the user logged in is a scheme operator', () => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                },
            });
            const result = isSchemeOperator(req, res);
            expect(result).toEqual(true);
        });

        it('should return false when the user logged in is not a scheme operator', () => {
            const { req, res } = getMockRequestAndResponse();
            const result = isSchemeOperator(req, res);
            expect(result).toEqual(false);
        });
    });

    describe('validatePassword', () => {
        const noPasswordError = { id: 'test', errorMessage: 'Enter a new password' };
        const passwordLengthError = { id: 'test', errorMessage: 'Password must be at least 8 characters long' };
        const passwordMatchError = { id: 'test', errorMessage: 'Passwords do not match' };
        const passwordSpecialCharacterError = {
            id: 'test',
            errorMessage: 'Password must contain at least one special character',
        };
        const passwordNumberError = { id: 'test', errorMessage: 'Password must contain at least one number' };
        const passwordUppercaseError = {
            id: 'test',
            errorMessage: 'Password must contain at least one uppercase letter',
        };
        const passwordLowercaseError = {
            id: 'test',
            errorMessage: 'Password must contain at least one lowercase letter',
        };
        const weakPasswordError = {
            id: 'test',
            errorMessage:
                'Your password is too weak. Try adding another word or two. Uncommon words are better. Avoid repeating characters. An example of a strong password is one with three or more uncommon words, one after another.',
        };
        const passwordMultiplePolicyError = {
            id: 'test',
            errorMessage:
                'Password must be at least 8 characters long, contain at least one uppercase letter, contain at least one number, and contain at least one special character',
        };

        it.each([
            ['no errors', 'passwords match and are a suitable length', 'iLoveBuses1!', 'iLoveBuses1!', null],
            ['a no password error', 'no input is provided', '', '', noPasswordError],
            ['a no password error', 'no new password is provided', '', 'iLoveBuses', noPasswordError],
            ['a password length error', 'new password is too short', 'Bus1!', 'iLoveBuses', passwordLengthError],
            [
                'a password match error',
                'the two passwords do not match',
                'iHateBuses1!',
                'iLoveBuses',
                passwordMatchError,
            ],
            ['a weak password error', 'weak password provided', 'Password1!', 'Password1!', weakPasswordError],
            ['a weak password error', 'weak password provided', 'Password123!', 'Password123!', weakPasswordError],
            [
                'a password missing special character error',
                'new password missing special character',
                'iLoveBuses1',
                'iLoveBuses1',
                passwordSpecialCharacterError,
            ],
            [
                'a password missing number error',
                'new password missing number',
                'iLoveBuses!',
                'iLoveBuses!',
                passwordNumberError,
            ],
            [
                'a password missing uppercase letter error',
                'new password missing uppercase letter',
                'ilovebuses1!',
                'ilovebuses1!',
                passwordUppercaseError,
            ],
            [
                'a password missing lowercase letter error',
                'new password missing lowercase letter',
                'ILOVEBUSES1!',
                'ILOVEBUSES1!',
                passwordLowercaseError,
            ],
            [
                'a password missing multiple aspects of password policy error',
                'new password missing multiple aspects of password policy',
                'bus',
                'bus',
                passwordMultiplePolicyError,
            ],
        ])('should return %s when %s', (_errors, _case, newPassword, confirmNewPassword, expectedResult) => {
            const res = validatePassword(newPassword, confirmNewPassword, 'test', true);
            expect(res).toEqual(expectedResult);
        });
    });

    describe('getSelectedStages', () => {
        it('should return a string array', () => {
            const { req } = getMockRequestAndResponse({});
            const result = getSelectedStages(req);
            expect(result).toEqual([]);
        });
    });
});
