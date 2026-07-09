import { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import { getCsrfToken } from '../utils/index';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { isWithErrors } from '../interfaces/typeGuards';

const title = 'Login - Create Fares Data Service';
const description = 'Login page of the Create Fares Data Service';

interface LoginProps {
    errors?: ErrorInfo[];
    email?: string;
    csrfToken: string;
}

const Login = ({ errors = [], csrfToken, email }: LoginProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <CsrfForm action="/api/login" method="post" csrfToken={csrfToken}>
                    <>
                        <ErrorSummary errors={errors} />
                        <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                            <fieldset className="govuk-fieldset" aria-describedby="register-page-heading">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading" id="register-page-heading">
                                        Sign in
                                    </h1>
                                </legend>
                                <p className="govuk-hint hint-text">
                                    Enter Create Fares Data account details to sign in
                                </p>
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="email">
                                        Email
                                    </label>
                                    <FormElementWrapper errors={errors} errorId="email" errorClass="govuk-input--error">
                                        <input
                                            className="govuk-input"
                                            id="email"
                                            name="email"
                                            type="text"
                                            autoComplete="email"
                                            spellCheck="false"
                                            defaultValue={email || ''}
                                        />
                                    </FormElementWrapper>
                                </div>
                                <div className="govuk-form-group">
                                    <label className="govuk-label" htmlFor="password">
                                        Password
                                    </label>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="password"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input"
                                            id="password"
                                            name="password"
                                            type="password"
                                            spellCheck="false"
                                            autoComplete="off"
                                        />
                                    </FormElementWrapper>
                                </div>
                            </fieldset>
                        </div>
                        <input
                            type="submit"
                            name="signIn"
                            value="Sign in"
                            id="sign-in-button"
                            className="govuk-button"
                        />
                    </>
                </CsrfForm>
            </div>
            <div className="govuk-grid-column-one-third">
                <div>
                    <h2 className="govuk-heading-s">Forgot your Password?</h2>
                    <a href="/forgotPassword" className="govuk-link">
                        Reset your password
                    </a>
                </div>
                <br />
                <div>
                    <h2 className="govuk-heading-s">Don&apos;t have an account?</h2>
                    <a
                        href="/requestAccess"
                        className="govuk-link"
                        aria-label="Don't have an account? – Request access"
                    >
                        Request access
                    </a>
                </div>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: LoginProps } => {
    const csrfToken = getCsrfToken(ctx);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    if (operatorAttribute) {
        if (isWithErrors(operatorAttribute)) {
            const { errors, email } = operatorAttribute;
            updateSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE, undefined);
            return { props: { errors, email: email ?? '', csrfToken } };
        }
    }

    return { props: { csrfToken } };
};

export default Login;
