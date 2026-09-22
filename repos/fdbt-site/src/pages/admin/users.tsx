import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import { AdminUser, listUsers } from '../../data/cognito';
import { NextPageContextWithSession } from '../../interfaces';
import { getCsrfToken, isAdmin } from '../../utils';
import { getUserStatusLabel, isAwaitingRegistration, isTestUser, sortAdminUsersByEmail } from '../../utils/adminUsers';

const title = 'Manage Users - Create Fares Data Service';
const description = 'Admin page for managing Create Fares Data users';

interface AdminUsersProps {
    csrfToken: string;
    users: AdminUser[];
}

const AdminUsers = ({ csrfToken, users }: AdminUsersProps): ReactElement => {
    const registeredUsers = users.filter((user) => user.status === 'CONFIRMED');
    const pendingUsers = users.filter((user) => user.status === 'FORCE_CHANGE_PASSWORD');

    return (
        <BaseLayout title={title} description={description} showNavigation>
            <h1 className="govuk-heading-xl">Manage users</h1>

            <a href="/admin/addUser" className="govuk-button" data-module="govuk-button" id="add-user-button">
                Add user
            </a>

            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Completed registrations
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Pending registrations
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Total registrations
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">{registeredUsers.length}</td>
                        <td className="govuk-table__cell">{pendingUsers.length}</td>
                        <td className="govuk-table__cell">{users.length}</td>
                    </tr>
                </tbody>
            </table>

            <table className="govuk-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Email
                        </th>
                        <th scope="col" className="govuk-table__header">
                            NOC(s)
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Status
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    {users.map((user) => (
                        <tr className="govuk-table__row" key={user.username}>
                            <td className="govuk-table__cell">
                                {user.email}
                                {isTestUser(user) ? ' (test)' : ''}
                            </td>
                            <td className="govuk-table__cell">{user.nocs.replace(/\|/g, ', ')}</td>
                            <td className="govuk-table__cell">{getUserStatusLabel(user.status)}</td>
                            <td className="govuk-table__cell">
                                <a href={`/admin/editUser?username=${encodeURIComponent(user.username)}`}>Edit</a>
                                <br />
                                <a href={`/admin/deleteUser?username=${encodeURIComponent(user.username)}`}>Delete</a>
                                {isAwaitingRegistration(user.status) && (
                                    <>
                                        <br />
                                        <a href={`/admin/resendInvite?username=${encodeURIComponent(user.username)}`}>
                                            Resend invite
                                        </a>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <input type="hidden" value={csrfToken} />
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: AdminUsersProps } | { redirect: { destination: string; permanent: boolean } }> => {
    if (!isAdmin(ctx)) {
        return { redirect: { destination: '/home', permanent: false } };
    }

    const csrfToken = getCsrfToken(ctx);
    const users = sortAdminUsersByEmail(await listUsers());

    return { props: { csrfToken, users } };
};

export default AdminUsers;
