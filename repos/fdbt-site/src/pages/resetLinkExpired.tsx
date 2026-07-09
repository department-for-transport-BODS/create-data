import { ReactElement } from 'react';
import { NextPage } from 'next';
import TwoThirdsLayout from '../layout/Layout';
import { USER_ATTRIBUTE } from '../constants/attributes';
import { updateSessionAttribute } from '../utils/sessions';
import { NextPageContextWithSession } from '../interfaces';

const title = 'Reset Password Link Expired - Create Fares Data Service';
const description = 'Reset Password Link Expired page for the Create Fares Data Service';

const ResetLinkExpired: NextPage = (): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Reset Password Link Expired</h1>
        <p className="govuk-body-l">Your reset password link has expired, click the button below to try again.</p>
        <a
            href="/forgotPassword"
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="forgot-password-button"
        >
            Reset your password
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    updateSessionAttribute(ctx.req, USER_ATTRIBUTE, undefined);
    return { props: {} };
};

export default ResetLinkExpired;
