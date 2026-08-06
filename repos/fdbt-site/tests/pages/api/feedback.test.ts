import Mail from 'nodemailer/lib/mailer';

import { getMockRequestAndResponse } from '../../testData/mockData';
import feedback, { requestIsEmpty, redactEmailAddress } from '../../../src/pages/api/feedback';

describe('feedback', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should redirect to the feedback page with query string true if feedback was submitted properly', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                contactQuestion: 'Yes',
                problemQuestion: 'No',
                hearAboutServiceQuestion: 'Heard about it from colleague',
                generalFeedbackQuestion: 'Should be easier to use',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await feedback(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/feedback?feedbackSubmitted=true',
        });
    });

    it('should redirect to the feedback page with query string false if feedback was empty', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                hearAboutServiceQuestion: '',
                generalFeedbackQuestion: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await feedback(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/feedback?feedbackSubmitted=false',
        });
    });

    describe('requestIsEmpty', () => {
        it('should return true if req.body is empty', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    hearAboutServiceQuestion: '',
                    generalFeedbackQuestion: '',
                },
            });
            expect(requestIsEmpty(req)).toBeTruthy();
        });

        it('should return false if req.body is not empty', () => {
            const { req } = getMockRequestAndResponse({
                body: {
                    hearAboutServiceQuestion: 'From a friend',
                    generalFeedbackQuestion: '          ',
                },
            });
            expect(requestIsEmpty(req)).toBeFalsy();
        });
    });
});

describe('redactEmailAddress', () => {
    it('email as string', () => {
        const given = 'test@example.com';
        const expected = '*****@example.com';
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('email as Address', () => {
        const given: Mail.Address = { name: 'test', address: 'test@example.com' };
        const expected = '*****@example.com';
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('emails as list of strings', () => {
        const given: string[] = ['test@example.com'];
        const expected: string[] = ['*****@example.com'];
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('emails as list of Address', () => {
        const given: Mail.Address[] = [{ name: 'test', address: 'test@example.com' }];
        const expected: string[] = ['*****@example.com'];
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('emails as list of multiple strings', () => {
        const given: string[] = ['test@example.com', 'test2@example2.com'];
        const expected: string[] = ['*****@example.com', '*****@example2.com'];
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('emails as list of multiple Address', () => {
        const given: Mail.Address[] = [
            { name: 'test', address: 'test@example.com' },
            { name: 'test2', address: 'test2@example2.com' },
        ];
        const expected: string[] = ['*****@example.com', '*****@example2.com'];
        expect(redactEmailAddress(given)).toEqual(expected);
    });
    it('email as bad input', () => {
        const given: string = 1 as unknown as string;
        const expected = '*****@*****.***';
        expect(redactEmailAddress(given)).toEqual(expected);
    });
});
