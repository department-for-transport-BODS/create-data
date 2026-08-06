import { ReactElement } from 'react';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import { FORGOT_PASSWORD_ATTRIBUTE } from '../constants/attributes';
import { isWithErrors } from '../interfaces/typeGuards';

const title = 'Forgot Password - Create Fares Data Service';
const description = 'Forgot Password page of the Create Fares Data Service';
const id = 'email';

interface ForgotEmailProps {
    email: string;
    errors: ErrorInfo[];
    csrfToken: string;
}

const ForgotPassword = ({ email, errors = [], csrfToken }: ForgotEmailProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <CsrfForm action="/api/forgotPassword" method="post" csrfToken={csrfToken}>
                    <>
                        <ErrorSummary errors={errors} />
                        <div className="govuk-form-group">
                            <h1 className="govuk-heading-l" id="forgot-password-heading">
                                Forgot your Password?
                            </h1>
                            <p className="govuk-hint hint-text">
                                Enter your email address to reset your password. The link you will be emailed will only
                                be usable for one hour.
                            </p>
                            <label className="govuk-label" htmlFor="email">
                                Email address
                            </label>
                            <div className="govuk-form-group">
                                <FormElementWrapper errors={errors} errorId={id} errorClass="govuk-input--error">
                                    <input
                                        className="govuk-input"
                                        id="email"
                                        name="email"
                                        type="text"
                                        autoComplete="email"
                                        spellCheck="false"
                                        defaultValue={email}
                                    />
                                </FormElementWrapper>
                            </div>
                        </div>
                        <input
                            type="submit"
                            name="continue"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button"
                        />
                    </>
                </CsrfForm>
            </div>
            <div className="govuk-grid-column-one-third">
                <p>
                    <h2 className="govuk-heading-s">Don&#39;t have an account?</h2>
                    <a href="/register" className="govuk-link">
                        Request Access
                    </a>
                </p>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ForgotEmailProps } => {
    const csrfToken = getCsrfToken(ctx);
    const forgotPasswordAttribute = getSessionAttribute(ctx.req, FORGOT_PASSWORD_ATTRIBUTE);

    return {
        props: {
            errors: isWithErrors(forgotPasswordAttribute) ? forgotPasswordAttribute?.errors : [],
            email: forgotPasswordAttribute?.email ?? '',
            csrfToken,
        },
    };
};

export default ForgotPassword;
