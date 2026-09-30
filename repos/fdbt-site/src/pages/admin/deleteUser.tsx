import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import ErrorSummary from '../../components/ErrorSummary';
import CsrfForm from '../../components/CsrfForm';
import { ErrorInfo, NextPageContextWithSession } from '../../interfaces';
import { getCsrfToken, isAdmin } from '../../utils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { ADMIN_DELETE_USER_ATTRIBUTE } from '../../constants/attributes';
import { getAdminUser } from '../../data/cognito';
import { humanFormatNocs } from '../../utils/adminUsers';

const title = 'Delete User - Create Fares Data Service';
const description = 'Admin page for deleting a Create Fares Data user';

interface DeleteUserProps {
    csrfToken: string;
    errors: ErrorInfo[];
    success?: string;
    username: string;
    email: string;
    nocs: string;
}

const DeleteUser = ({ csrfToken, errors, success, username, email, nocs }: DeleteUserProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} showNavigation>
        <a href="/admin/users" className="govuk-back-link">
            Back
        </a>
        <h1 className="govuk-heading-xl">Delete User</h1>
        <ErrorSummary errors={errors} />
        {success && (
            <div className="govuk-panel govuk-panel--confirmation">
                <p className="govuk-panel__body">
                    Account deleted successfully for <b>{success}</b>
                </p>
            </div>
        )}
        <CsrfForm action="/api/admin/deleteUser" method="post" csrfToken={csrfToken}>
            <>
                <input type="hidden" name="username" value={username} />
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="email">
                        User Email
                    </label>
                    <input className="govuk-input" id="email" name="email" type="text" value={email} readOnly />
                </div>
                <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="nocs">
                        User National Operator Code (NOC)
                    </label>
                    <input
                        className="govuk-input"
                        id="nocs"
                        name="nocs"
                        type="text"
                        value={humanFormatNocs(nocs)}
                        readOnly
                    />
                </div>
                <input
                    type="submit"
                    value="Delete"
                    id="delete-user-button"
                    data-module="govuk-button"
                    className="govuk-button govuk-button--warning"
                />
            </>
        </CsrfForm>
    </BaseLayout>
);

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<
    { props: DeleteUserProps } | { redirect: { destination: string; permanent: boolean } } | { notFound: true }
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
    const attribute = getSessionAttribute(ctx.req, ADMIN_DELETE_USER_ATTRIBUTE);
    updateSessionAttribute(ctx.req, ADMIN_DELETE_USER_ATTRIBUTE, undefined);

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

export default DeleteUser;
