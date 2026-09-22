import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import ErrorSummary from '../../components/ErrorSummary';
import FormElementWrapper from '../../components/FormElementWrapper';
import CsrfForm from '../../components/CsrfForm';
import { AdminUserFormAttribute, ErrorInfo, NextPageContextWithSession } from '../../interfaces';
import { getCsrfToken, isAdmin } from '../../utils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { ADMIN_ADD_USER_ATTRIBUTE } from '../../constants/attributes';

const title = 'Add User - Create Fares Data Service';
const description = 'Admin page for adding a Create Fares Data user';

interface AddUserProps {
    csrfToken: string;
    errors: ErrorInfo[];
    success?: string;
}

const AddUser = ({ csrfToken, errors, success }: AddUserProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} showNavigation>
        <a href="/admin/users" className="govuk-back-link">
            Back
        </a>
        <h1 className="govuk-heading-xl">Add user</h1>
        <ErrorSummary errors={errors} />
        {success && (
            <div className="govuk-panel govuk-panel--confirmation">
                <p className="govuk-panel__body">
                    Account created successfully for <b>{success}</b>
                </p>
            </div>
        )}
        <CsrfForm action="/api/admin/addUser" method="post" csrfToken={csrfToken}>
            <>
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label className="govuk-label" htmlFor="email">
                        User email
                    </label>
                    <FormElementWrapper errors={errors} errorId="email" errorClass="govuk-input--error">
                        <input className="govuk-input" id="email" name="email" type="text" spellCheck="false" />
                    </FormElementWrapper>

                    <label className="govuk-label govuk-!-margin-top-4" htmlFor="nocs">
                        National Operator Code(s) (NOC)
                    </label>
                    <div className="govuk-hint">
                        If the user has multiple NOCs, enter a comma-separated list, e.g. &apos;NOC1,NOC2,NOC3&apos;
                    </div>
                    <FormElementWrapper errors={errors} errorId="nocs" errorClass="govuk-input--error">
                        <input className="govuk-input" id="nocs" name="nocs" type="text" spellCheck="false" />
                    </FormElementWrapper>
                </div>
                <input
                    type="submit"
                    value="Add user"
                    id="add-user-button"
                    data-module="govuk-button"
                    className="govuk-button"
                />
            </>
        </CsrfForm>
    </BaseLayout>
);

export const getServerSideProps = (
    ctx: NextPageContextWithSession,
): { props: AddUserProps } | { redirect: { destination: string; permanent: boolean } } => {
    if (!isAdmin(ctx)) {
        return { redirect: { destination: '/home', permanent: false } };
    }

    const csrfToken = getCsrfToken(ctx);
    const attribute = getSessionAttribute(ctx.req, ADMIN_ADD_USER_ATTRIBUTE) as AdminUserFormAttribute | undefined;
    updateSessionAttribute(ctx.req, ADMIN_ADD_USER_ATTRIBUTE, undefined);

    return { props: { csrfToken, errors: attribute?.errors ?? [], success: attribute?.success } };
};

export default AddUser;
