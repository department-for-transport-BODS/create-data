import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { USER_ATTRIBUTE } from '../constants/attributes';
import { NextPageContextWithSession } from '../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';

const title = 'Password Updated - Create Fares Data Service';
const description = 'Password Updated page of the Create Fares Data Service';

interface PasswordUpdatedProps {
    redirectTo: string;
}

const PasswordUpdated = ({ redirectTo }: PasswordUpdatedProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Password Updated</h1>
        <p className="govuk-body-l">Your password has been updated successfully</p>
        <a
            href={redirectTo}
            role="button"
            draggable="false"
            className="govuk-button"
            data-module="govuk-button"
            id="continue-button"
        >
            Continue
        </a>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): object => {
    const userAttribute = getSessionAttribute(ctx.req, USER_ATTRIBUTE);
    const redirectTo = userAttribute?.redirectFrom === '/resetPassword' ? '/login' : '/account';

    updateSessionAttribute(ctx.req, USER_ATTRIBUTE, undefined);
    return { props: { redirectTo } };
};

export default PasswordUpdated;
