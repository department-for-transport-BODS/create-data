import { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { USER_ATTRIBUTE } from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { redirectTo } from '../utils/apiUtils';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';

const title = 'Reset Password - Create Fares Data Service';
const description = 'Reset Password page of the Create Fares Data Service';

interface ResetPasswordProps {
    errors: ErrorInfo[];
    regKey: string;
    username: string;
    expiry: string;
    csrfToken: string;
}

const ResetPassword = ({ errors, regKey, username, expiry, csrfToken }: ResetPasswordProps): ReactElement => {
    return (
        <BaseLayout title={title} description={description} errors={errors}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <CsrfForm action="/api/resetPassword" method="post" csrfToken={csrfToken}>
                        <>
                            <ErrorSummary errors={errors} />
                            <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                                <fieldset className="govuk-fieldset" aria-describedby="reset-password-page-heading">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                        <h1 className="govuk-fieldset__heading" id="reset-password-page-heading">
                                            Reset your password
                                        </h1>
                                    </legend>
                                    <p className="govuk-hint hint-text" id="reset-password-page-hint">
                                        Your password should be at least 8 characters long
                                    </p>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="new-password">
                                            New password
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="new-password"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="new-password"
                                                name="password"
                                                type="password"
                                                aria-describedby="reset-password-page-hint"
                                                spellCheck="false"
                                            />
                                        </FormElementWrapper>
                                    </div>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="confirm-new-password">
                                            Confirm password
                                        </label>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="confirm-new-password"
                                            errorClass="govuk-input--error"
                                        >
                                            <input
                                                className="govuk-input"
                                                id="confirm-new-password"
                                                name="confirmPassword"
                                                type="password"
                                                aria-describedby="reset-password-page-hint"
                                                spellCheck="false"
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </fieldset>
                            </div>
                            <input
                                type="submit"
                                name="resetPassword"
                                value="Reset Password"
                                id="reset-password-button"
                                className="govuk-button"
                            />
                            <input value={regKey} type="hidden" name="regKey" />
                            <input value={username} type="hidden" name="username" />
                            <input value={expiry} type="hidden" name="expiry" />
                        </>
                    </CsrfForm>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ResetPasswordProps } => {
    const csrfToken = getCsrfToken(ctx);
    const userAttribute = getSessionAttribute(ctx.req, USER_ATTRIBUTE);

    const { key, user_name: username, expiry } = ctx.query;

    if (!key || !username || !expiry) {
        throw new Error('Could not retrieve parameters from query string');
    }

    if (expiry) {
        if (typeof expiry === 'string') {
            const parsedExpiry = parseInt(expiry, 10);

            const currentTimeStamp = Math.floor(Date.now() / 1000);
            if (currentTimeStamp > parsedExpiry) {
                if (ctx.res) {
                    redirectTo(ctx.res, '/resetLinkExpired');
                }
            }
        }
    }

    return {
        props: {
            errors: isWithErrors(userAttribute) ? userAttribute.errors : [],
            regKey: key as string,
            username: username as string,
            expiry: expiry as string,
            csrfToken,
        },
    };
};

export default ResetPassword;
