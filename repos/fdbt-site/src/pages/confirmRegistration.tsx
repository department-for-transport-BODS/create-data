import { ReactElement } from 'react';
import isArray from 'lodash/isArray';
import TwoThirdsLayout from '../layout/Layout';
import { USER_ATTRIBUTE } from '../constants/attributes';
import { updateSessionAttribute } from '../utils/sessions';
import { NextPageContextWithSession } from '../interfaces';

const title = 'Registration Successful - Create Fares Data Service';
const description = 'Confirm Registration page for the Create Fares Data Service';

interface ConfirmRegistrationProps {
    tndslessNocs: string[];
}

const ConfirmRegistration = ({ tndslessNocs }: ConfirmRegistrationProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <h1 className="govuk-heading-l">Your account has been successfully created</h1>
        {tndslessNocs.length > 0 && (
            <>
                <p className="govuk-body-m">
                    This service utilises the Traveline National Dataset (TNDS) and Bus Open Data Service (BODS) to
                    obtain operators&apos; service data in order to help them create fares data.
                </p>
                <p className="govuk-body-m">
                    The following National Operator Codes have no service data in TNDS and so cannot be used to create
                    NeTex:
                </p>
                <p className="govuk-body-m">
                    <b>{tndslessNocs.join(',')}</b>
                </p>
                <p className="govuk-body-m">
                    <a href="/contact">Contact</a> us if you have further questions.
                </p>
            </>
        )}
        <p className="govuk-body-l">Click continue to go to the homepage.</p>
        <a
            href="/"
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

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ConfirmRegistrationProps } => {
    updateSessionAttribute(ctx.req, USER_ATTRIBUTE, undefined);
    const { nocs } = ctx.query;
    let nocsToDisplay: string[] = [];
    if (nocs && !isArray(nocs)) {
        nocsToDisplay = nocsToDisplay.concat(nocs.split('|'));
    }
    return {
        props: {
            tndslessNocs: nocsToDisplay,
        },
    };
};

export default ConfirmRegistration;
