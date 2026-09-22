import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import ErrorSummary from '../../components/ErrorSummary';
import CsrfForm from '../../components/CsrfForm';
import { ErrorInfo, NextPageContextWithSession } from '../../interfaces';
import { getCsrfToken, isAdmin } from '../../utils';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { ADMIN_RESEND_INVITE_ATTRIBUTE } from '../../constants/attributes';
import { getAdminUser } from '../../data/cognito';
import { humanFormatNocs } from '../../utils/adminUsers';

const title = 'Resend Invite - Create Fares Data Service';
const description = 'Admin page for resending an invite to a Create Fares Data user';

interface ResendInviteProps {
    csrfToken: string;
    errors: ErrorInfo[];
    success?: string;
    username: string;
    email: string;
    nocs: string;
}

const ResendInvite = ({ csrfToken, errors, success, username, email, nocs }: ResendInviteProps): ReactElement => (
    <BaseLayout title={title} description={description} errors={errors} showNavigation>
        <a href="/admin/users" className="govuk-back-link">
            Back
        </a>
        <h1 className="govuk-heading-xl">Resend invite</h1>
        <ErrorSummary errors={errors} />
        {success && (
            <div className="govuk-panel govuk-panel--confirmation">
                <p className="govuk-panel__body">
                    Invite successfully resent for <b>{success}</b>
                </p>
            </div>
        )}
        <p className="govuk-body">
            Resend the invite for <b>{email}</b> ({humanFormatNocs(nocs)})? This will generate a new temporary password
            and email.
        </p>
        <CsrfForm action="/api/admin/resendInvite" method="post" csrfToken={csrfToken}>
            <>
                <input type="hidden" name="username" value={username} />
                <input type="hidden" name="email" value={email} />
                <input type="hidden" name="nocs" value={nocs} />
                <input
                    type="submit"
                    value="Resend invite"
                    id="resend-invite-button"
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
    { props: ResendInviteProps } | { redirect: { destination: string; permanent: boolean } } | { notFound: true }
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
    const attribute = getSessionAttribute(ctx.req, ADMIN_RESEND_INVITE_ATTRIBUTE);
    updateSessionAttribute(ctx.req, ADMIN_RESEND_INVITE_ATTRIBUTE, undefined);

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

export default ResendInvite;
