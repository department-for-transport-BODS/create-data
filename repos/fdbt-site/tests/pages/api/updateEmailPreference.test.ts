import * as cognito from '../../../src/data/cognito';
import { getMockRequestAndResponse } from '../../testData/mockData';
import updateUserAttribute from '../../../src/pages/api/updateEmailPreference';
import * as apiUtils from '../../../src/utils/apiUtils';
import * as sessions from '../../../src/utils/sessions';
import { ACCOUNT_PAGE_ERROR } from '../../../src/constants/attributes';

describe('updateEmailPreference', () => {
    const updateUserAttributesSpy = jest.spyOn(cognito, 'updateUserAttributes');
    const redirectToSpy = jest.spyOn(apiUtils, 'redirectTo');
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should not call cognito if running locally', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
        });

        await updateUserAttribute(req, res);
        expect(updateUserAttributesSpy).not.toHaveBeenCalled();
        expect(redirectToSpy).toHaveBeenCalledWith(res, '/home');
        expect(updateSessionAttributeSpy).not.toHaveBeenCalled();
    });

    it.each([{}, 1, ['test', 'test']])(
        'should redirect back to account page if body is not as expected: %o',
        async (body) => {
            const { req, res } = getMockRequestAndResponse({
                body: body,
                requestHeaders: { host: 'https://example.com' },
            });

            await updateUserAttribute(req, res);
            expect(updateUserAttributesSpy).not.toHaveBeenCalled();
            expect(redirectToSpy).toHaveBeenCalledWith(res, '/account');
            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ACCOUNT_PAGE_ERROR, [
                {
                    id: 'radio-multi-op-email-pref',
                    errorMessage: 'There was a problem updating email preference',
                },
            ]);
        },
    );

    it.each(['true', 'false'])(
        'should update cognito attribute and redirect back to home if required properties are provided: %o',
        async (body) => {
            const { req, res } = getMockRequestAndResponse({
                body: {
                    multiOpEmailPref: body,
                },
                requestHeaders: { host: 'https://example.com' },
            });
            updateUserAttributesSpy.mockResolvedValue(new Promise((resolve) => resolve()));

            await updateUserAttribute(req, res);
            expect(updateUserAttributesSpy).toHaveBeenCalled();
            expect(updateUserAttributesSpy).toHaveBeenCalledWith('test@example.com', [
                { Name: 'custom:multiOpEmailEnabled', Value: body },
            ]);
            expect(redirectToSpy).toHaveBeenCalledWith(res, '/home');
            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ACCOUNT_PAGE_ERROR, undefined);
        },
    );
});
