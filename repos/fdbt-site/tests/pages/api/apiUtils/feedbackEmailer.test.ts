import { buildFeedbackContent } from '../../../../src/utils/apiUtils/feedbackEmailer';
import { Feedback } from '../../../../src/interfaces';
import {
    contactFeedbackQuestion,
    solveFeedbackQuestion,
    hearAboutUsFeedbackQuestion,
    generalFeedbackQuestion,
} from '../../../../src/constants';

describe('feedbackEmailer', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('buildFeedbackContent', () => {
        it('should take a full array of feedback and sort it into a readible string', () => {
            const feedback: Feedback[] = [
                {
                    question: contactFeedbackQuestion,
                    answer: 'Yes',
                },
                {
                    question: solveFeedbackQuestion,
                    answer: 'Yes',
                },
                {
                    question: hearAboutUsFeedbackQuestion,
                    answer: 'From a colleague',
                },
                {
                    question: generalFeedbackQuestion,
                    answer: 'Make the text bigger and a different colour like purple.',
                },
            ];
            const expected =
                'Question: Did you contact us for assistance at any point?\n' +
                'Answer: Yes\n' +
                'Question: Did we solve your problem?\n' +
                'Answer: Yes\n' +
                'Question: How did you hear about our service?\n' +
                'Answer: From a colleague\n' +
                'Question: Please let us know any feedback or suggestions for improvements you may have\n' +
                'Answer: Make the text bigger and a different colour like purple.';
            expect(buildFeedbackContent(feedback)).toBe(expected);
        });
    });
});
