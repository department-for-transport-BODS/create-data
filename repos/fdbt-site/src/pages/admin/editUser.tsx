import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import ErrorSummary from '../../components/ErrorSummary';
import FormElementWrapper from '../../components/FormElementWrapper';
import CsrfForm from '../../components/CsrfForm';
import { AdminUserFormAttribute, ErrorInfo, NextPageContextWithSession } from '../../interfaces';
import { getCsrfToken, isAdmin } from '../../utils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { ADMIN_EDIT_USER_ATTRIBUTE } from '../../constants/attributes';
import { getAdminUser } from '../../data/cognito';
import { humanFormatNocs } from '../../utils/adminUsers';

const title = 'Edit User - Create Fares Data Service';
const description = 'Admin page for editing a Create Fares Data user';

interface EditUserProps {
    csrfToken: string;
    errors: ErrorInfo[];
    success?: string;
    username: string;
    email: string;
    nocs: string;
}

const EditUser = ({ csrfToken, errors, success, username, email, nocs }: EditUserProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} showNavigation>
        <a href="/admin/users" className="govuk-back-link">
            Back
        </a>
        <h1 className="govuk-heading-xl">Edit User</h1>
        <ErrorSummary errors={errors} />
        {success && (
            <div className="govuk-panel govuk-panel--confirmation">
                <p className="govuk-panel__body">
                    Account edited successfully for <b>{email}</b>
                </p>
            </div>
        )}
        <CsrfForm action="/api/admin/editUser" method="post" csrfToken={csrfToken}>
            <>
                <input type="hidden" name="username" value={username} />
                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <label className="govuk-label" htmlFor="email">
                        User Email
                    </label>
                    <div className="govuk-hint">
                        Email addresses cannot be changed. Delete the existing user and create a new one if needed.
                    </div>
                    <input className="govuk-input" id="email" name="email" type="text" value={email} readOnly />

                    <label className="govuk-label govuk-!-margin-top-4" htmlFor="nocs">
                        User National Operator Code (NOC)
                    </label>
                    <div className="govuk-hint">
                        If the user has multiple NOCs, enter a comma-separated list. For example:
                        &apos;NOC1,NOC2,NOC3&apos;
                    </div>
                    <FormElementWrapper errors={errors} errorId="nocs" errorClass="govuk-input--error">
                        <input
                            className="govuk-input"
                            id="nocs"
                            name="nocs"
                            type="text"
                            spellCheck="false"
                            defaultValue={humanFormatNocs(nocs)}
                        />
                    </FormElementWrapper>
                </div>
                <input
                    type="submit"
                    value="Submit"
                    id="edit-user-button"
                    data-module="govuk-button"
                    className="govuk-button"
                />
            </>
        </CsrfForm>
    </BaseLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<
    { props: EditUserProps } | { redirect: { destination: string; permanent: boolean } } | { notFound: true }
> => {
    if (!isAdmin(ctx)) {
        return { redirect: { destination: '/home', permanent: false } };
    }

    const username = ctx.query?.username;

    if (!username || typeof username !== 'string') {
        return { notFound: true };
    }

    const user = await getAdminUser(username);

    if (!user) {
        return { notFound: true };
    }

    const csrfToken = getCsrfToken(ctx);
    const attribute = getSessionAttribute(ctx.req, ADMIN_EDIT_USER_ATTRIBUTE) as AdminUserFormAttribute | undefined;
    updateSessionAttribute(ctx.req, ADMIN_EDIT_USER_ATTRIBUTE, undefined);

    return {
        props: {
            csrfToken,
            errors: attribute?.errors ?? [],
            success: attribute?.success,
            username: user.username,
            email: user.email,
            nocs: user.nocs,
        },
    };
};

export default EditUser;
