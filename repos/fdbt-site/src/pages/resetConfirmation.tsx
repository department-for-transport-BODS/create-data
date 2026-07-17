import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { FORGOT_PASSWORD_ATTRIBUTE } from '../constants/attributes';
import { getSessionAttribute } from '../utils/sessions';
import { NextPageContextWithSession } from '../interfaces';

const title = 'Reset Email Confirmation - Create Fares Data Service';
const description = 'Reset Email Confirmation page of the Create Fares Data Service';

interface ResetConfirmationProps {
    email: string;
}

const ResetConfirmation = ({ email }: ResetConfirmationProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l" id="reset-confirmation-page-heading">
            Reset password link has been sent
        </h1>
        <p className="govuk-body">
            If this email address exists in our system, we will send a password reset email to
            <b>{` ${email}`}</b>.
        </p>
        <p className="govuk-body">Check your email and follow the link within 1 hour to reset your password.</p>
        <p className="govuk-body">If you cannot find the email then look in your spam or junk email folder.</p>
        <a href="/" role="button" draggable="false" className="govuk-button" data-module="govuk-button">
            Home
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ResetConfirmationProps } => {
    const forgotPasswordAttribute = getSessionAttribute(ctx.req, FORGOT_PASSWORD_ATTRIBUTE);

    // error in case user navigates to page manually or without attribute
    if (!forgotPasswordAttribute) {
        throw new Error('No forgotPassword attribute found.');
    }

    const { email } = forgotPasswordAttribute;

    // error in case user navigates to page manually
    if (!email) {
        throw new Error('No email found.');
    }

    return { props: { email } };
};

export default ResetConfirmation;
