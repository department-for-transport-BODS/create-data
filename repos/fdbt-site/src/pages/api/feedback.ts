import { NextApiResponse } from 'next';
import Mail from 'nodemailer/lib/mailer';
import { setFeedbackMailOptions, createMailTransporter } from '../../utils/apiUtils/feedbackEmailer';
import { removeExcessWhiteSpace } from '../../utils/apiUtils/validator';
import { redirectToError, redirectTo, getNocFromIdToken, getEmailFromIdToken } from '../../utils/apiUtils/index';
import { NextApiRequestWithSession, Feedback } from '../../interfaces';
import {
    contactFeedbackQuestion,
    solveFeedbackQuestion,
    hearAboutUsFeedbackQuestion,
    generalFeedbackQuestion,
} from '../../constants';
import logger from '../../utils/logger';

export const buildFeedbackForEmail = (req: NextApiRequestWithSession): Feedback[] => {
    const { body } = req;
    const feedback: Feedback[] = [];
    const refinedHearAboutServiceInput = removeExcessWhiteSpace(body.hearAboutServiceQuestion);
    const refinedGeneralFeedbackInput = removeExcessWhiteSpace(body.generalFeedbackQuestion);
    if (refinedHearAboutServiceInput && refinedHearAboutServiceInput !== '') {
        feedback.push({
            question: hearAboutUsFeedbackQuestion,
            answer: refinedHearAboutServiceInput,
        });
    }
    if (refinedGeneralFeedbackInput && refinedGeneralFeedbackInput !== '') {
        feedback.push({
            question: generalFeedbackQuestion,
            answer: refinedGeneralFeedbackInput,
        });
    }
    if (body.contactQuestion) {
        feedback.push({
            question: contactFeedbackQuestion,
            answer: body.contactQuestion,
        });
    }
    if (body.problemQuestion) {
        feedback.push({
            question: solveFeedbackQuestion,
            answer: body.problemQuestion,
        });
    }

    return feedback;
};

export const requestIsEmpty = (req: NextApiRequestWithSession): boolean => {
    const { body } = req;
    const refinedHearAboutServiceInput = removeExcessWhiteSpace(body.hearAboutServiceQuestion);
    const refinedGeneralFeedbackInput = removeExcessWhiteSpace(body.generalFeedbackQuestion);
    if (
        !body.contactQuestion &&
        !body.problemQuestion &&
        refinedHearAboutServiceInput === '' &&
        refinedGeneralFeedbackInput === ''
    ) {
        return true;
    }

    return false;
};

// redactEmailAddress replaces the user portion of an email address so it can be safely logged
export const redactEmailAddress = (
    toRedact: string | Mail.Address | (string | Mail.Address)[] | undefined,
): string | string[] => {
    const redact = (address: string): string => address.toString().replace(/.*@/, '*****@');
    if (toRedact !== undefined) {
        if (typeof toRedact === 'string') {
            return redact(toRedact);
        } else if (typeof toRedact === 'object' && 'name' in toRedact && 'address' in toRedact) {
            const email = toRedact as Mail.Address;
            return redact(email.address);
        } else if (typeof toRedact === 'object') {
            const addresses = toRedact as Mail.Address[];
            return addresses.map((email) => {
                if (typeof email !== 'string' && 'name' in email && 'address' in email) {
                    return redact(email.address);
                } else {
                    return redact(email as unknown as string);
                }
            });
        }
    }
    return '*****@*****.***';
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    let mailOptions: Mail.Options = {};
    try {
        if (requestIsEmpty(req)) {
            redirectTo(res, '/feedback?feedbackSubmitted=false');
            return;
        }

        const feedback: Feedback[] = buildFeedbackForEmail(req);
        const noc = getNocFromIdToken(req, res) || 'UNKNOWN';
        const feedbackSubmitterEmailAddress = getEmailFromIdToken(req, res) || 'UNKNOWN';
        mailOptions = setFeedbackMailOptions(noc, feedbackSubmitterEmailAddress, feedback);

        if (process.env.NODE_ENV !== 'production') {
            logger.info('mailOptions', {
                context: 'api.feedback',
                mailOptions: {
                    from: mailOptions.from,
                    to: redactEmailAddress(mailOptions.to),
                    subject: mailOptions.subject,
                    text: mailOptions.text,
                },
                message: 'Sending of emails disabled, email not sent',
            });
        } else {
            const mailTransporter = createMailTransporter();
            await mailTransporter.sendMail(mailOptions);
            logger.info({
                context: 'api.feedback',
                mailOptions: {
                    from: mailOptions.from,
                    to: redactEmailAddress(mailOptions.to),
                    subject: mailOptions.subject,
                    text: mailOptions.text,
                },
                message: 'Sending of emails enabled, email sent',
            });
        }

        redirectTo(res, '/feedback?feedbackSubmitted=true');
        return;
    } catch (error) {
        logger.error({
            context: 'api.feedback',
            mailOptions: {
                from: mailOptions?.from,
                to: redactEmailAddress(mailOptions?.to),
                subject: mailOptions?.subject,
                text: mailOptions?.text,
            },
            message: 'Sending of emails failed, email probably not sent',
        });
        const message = 'There was a problem receiving the user feedback.';
        redirectToError(res, message, 'api.feedback', error);
    }
};
