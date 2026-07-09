import { ReactElement, useState } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { ID_TOKEN_COOKIE } from '../constants';
import { getNocFromIdToken, getAttributeFromIdToken, getCsrfToken } from '../utils';
import { parseCookiesFromRequest } from '../utils/apiUtils';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import BackButton from '../components/BackButton';
import CsrfForm from '../components/CsrfForm';
import FormElementWrapper from '../components/FormElementWrapper';
import { getSessionAttribute } from '../utils/sessions';
import { ACCOUNT_PAGE_ERROR } from '../constants/attributes';
import { getUserAttribute } from '../data/cognito';

const title = 'Account Details - Create Fares Data Service';
const description = 'Account Details page of the Create Fares Data Service';

interface AccountDetailsProps {
    emailAddress: string;
    nocCode: string;
    csrfToken: string;
    multiOperatorEmailPreference: boolean;
    errors: ErrorInfo[];
}

const AccountDetails = ({
    emailAddress,
    nocCode,
    csrfToken,
    multiOperatorEmailPreference,
    errors,
}: AccountDetailsProps): ReactElement => {
    const [multiOpEmailPreference, setMultiOpEmailPreference] = useState(multiOperatorEmailPreference);
    const passwordDots: ReactElement[] = [];
    for (let i = 0; i < 8; i += 1) {
        passwordDots.push(<span key={i} className="dot" />);
    }

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/updateEmailPreference" method="post" csrfToken={csrfToken}>
                <ErrorSummary errors={errors} />
                <div className="account-details-page">
                    <BackButton href="/home" />
                    <h1 className="govuk-heading-xl">Account Details</h1>
                    <div className="content-wrapper">
                        <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">Email Address</p>
                        <p className="govuk-body email-content content-three-quarters">{emailAddress}</p>
                    </div>
                    <div className="content-wrapper">
                        <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">Password</p>
                        <span className="password-dots">{passwordDots}</span>
                        <span className="change-password">
                            <a
                                href="/changePassword"
                                role="button"
                                draggable="false"
                                className="govuk-button"
                                data-module="govuk-button"
                                id="change-password-button"
                                aria-label="change password"
                            >
                                Change
                            </a>
                        </span>
                    </div>
                    <div className="content-wrapper govuk-!-margin-bottom-8">
                        <p className="govuk-body govuk-!-font-weight-bold content-one-quarter">Operator</p>
                        <p className="govuk-body content-three-quarters">{nocCode.replace(/\|/g, ', ')}</p>
                    </div>

                    <fieldset className="govuk-fieldset">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <p className="govuk-heading-m">Email notifications</p>
                            <p className="govuk-heading-s">Multi-operator fare alerts</p>
                        </legend>
                        <FormElementWrapper
                            errors={errors}
                            errorId="radio-multi-op-email-pref"
                            errorClass="govuk-radios--error"
                        >
                            <div className="govuk-radios govuk-radios--inline ml-auto" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="multiOpEmailPref-on"
                                        name="multiOpEmailPref"
                                        checked={multiOpEmailPreference}
                                        onChange={() => setMultiOpEmailPreference(true)}
                                        type="radio"
                                        value="true"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="multiOpEmailPref-on">
                                        On
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="multiOpEmailPref-off"
                                        name="multiOpEmailPref"
                                        checked={!multiOpEmailPreference}
                                        onChange={() => setMultiOpEmailPreference(false)}
                                        type="radio"
                                        value="false"
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="multiOpEmailPref-off">
                                        Off
                                    </label>
                                </div>
                            </div>
                        </FormElementWrapper>
                    </fieldset>
                </div>
                <input
                    type="submit"
                    name="saveChanges"
                    value="Save changes"
                    id="save-changes-button"
                    data-module="govuk-button"
                    className="govuk-button govuk-!-margin-right-4"
                />
                <a
                    href="/home"
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--secondary"
                    data-module="govuk-button"
                    id="cancel-button"
                >
                    Cancel changes
                </a>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: AccountDetailsProps }> => {
    const cookies = parseCookiesFromRequest(ctx.req);
    if (!cookies[ID_TOKEN_COOKIE]) {
        throw new Error('Necessary attributes not found to show account details');
    }
    const noc = getNocFromIdToken(ctx);
    const email = getAttributeFromIdToken(ctx, 'email');

    if (!email || !noc) {
        throw new Error('Could not extract the user email address and/or noc code from their ID token');
    }

    const host = ctx.req.headers.host;
    const multiOperatorEmailPreference = host?.startsWith('localhost')
        ? 'false'
        : await getUserAttribute(email, 'custom:multiOpEmailEnabled');

    const errors = getSessionAttribute(ctx.req, ACCOUNT_PAGE_ERROR);

    return {
        props: {
            emailAddress: email,
            nocCode: noc,
            csrfToken: getCsrfToken(ctx),
            multiOperatorEmailPreference: multiOperatorEmailPreference === 'true',
            errors: errors ?? [],
        },
    };
};

export default AccountDetails;
