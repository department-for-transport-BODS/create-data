import nodemailer from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import Mail from 'nodemailer/lib/mailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SERVICE_EMAIL_ADDRESS, STAGE } from '../../constants';
import { Feedback } from '../../interfaces';

export const buildFeedbackContent = (feedbackQuestions: Feedback[]): string => {
    const questionsAndAnswers = feedbackQuestions.map((question) => {
        return `Question: ${question.question}\nAnswer: ${question.answer}`;
    });

    return questionsAndAnswers.join('\n');
};

export const setFeedbackMailOptions = (
    nocCodeOfSender: string,
    feedbackSubmitterEmailAddress: string,
    feedback: Feedback[],
): Mail.Options => {
    const subject =
        STAGE === 'prod'
            ? `Feedback received from ${nocCodeOfSender}`
            : `${STAGE} - Feedback received from ${nocCodeOfSender}`;
    return {
        from: SERVICE_EMAIL_ADDRESS ?? undefined,
        to: SERVICE_EMAIL_ADDRESS ?? undefined,
        cc: feedbackSubmitterEmailAddress,
        subject: subject,
        text: buildFeedbackContent(feedback),
    };
};

export const createMailTransporter = (): Mail => {
    const sesClient = new SESClient({
        apiVersion: '2010-12-01',
        region: 'eu-west-1',
    });

    return nodemailer.createTransport(
        new SESTransport({
            SES: { sesClient, SendEmailCommand },
        }),
    );
};
