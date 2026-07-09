import cookies from '../../../src/pages/api/cookies';
import * as apiUtils from '../../../src/utils/apiUtils';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, oneYearInSeconds } from '../../../src/constants';
import { CookiePolicy } from '../../../src/interfaces';

jest.mock('../../../src/utils/apiUtils');

describe('cookies', () => {
    const writeHeadMock = jest.fn();
    const setCookieSpy = jest.spyOn(apiUtils, 'setCookieOnResponseObject');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should redirect back to itself (i.e. /cookies) when no tracking selection is sent to the API', () => {
        const { req, res } = getMockRequestAndResponse({ body: {}, mockWriteHeadFn: writeHeadMock });
        cookies(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/cookies' });
    });

    it("should update all cookies, with the cookie policy 'usage' as false when the user disables tracking", () => {
        const mockCookiePolicy: CookiePolicy = { essential: true, usage: false };
        const { req, res } = getMockRequestAndResponse({
            body: {
                tracking: 'off',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        cookies(req, res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIE_PREFERENCES_COOKIE,
            'true',
            req,
            res,
            oneYearInSeconds,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_POLICY_COOKIE,
            JSON.stringify(mockCookiePolicy),
            req,
            res,
            oneYearInSeconds,
            false,
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/cookies?settingsSaved=true' });
    });

    it("should update all cookies, with the cookie policy 'usage' as true when the user enables tracking", () => {
        const mockCookiePolicy: CookiePolicy = { essential: true, usage: true };
        const { req, res } = getMockRequestAndResponse({
            body: {
                tracking: 'on',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        cookies(req, res);
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            1,
            COOKIE_PREFERENCES_COOKIE,
            'true',
            req,
            res,
            oneYearInSeconds,
            false,
        );
        expect(setCookieSpy).toHaveBeenNthCalledWith(
            2,
            COOKIES_POLICY_COOKIE,
            JSON.stringify(mockCookiePolicy),
            req,
            res,
            oneYearInSeconds,
            false,
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/cookies?settingsSaved=true' });
    });
});
