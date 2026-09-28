import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import AdminUsers, { getServerSideProps } from '../../../src/pages/admin/users';
import * as cognito from '../../../src/data/cognito';
import { buildIdToken, getMockContext } from '../../testData/mockData';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/admin/users' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

const mockUsers: cognito.AdminUser[] = [
    {
        username: 'confirmed@example.com',
        email: 'confirmed@example.com',
        nocs: 'NOC1',
        status: 'CONFIRMED',
        attributes: { email: 'confirmed@example.com', 'custom:noc': 'NOC1' },
    },
    {
        username: 'pending@example.com',
        email: 'pending@example.com',
        nocs: 'NOC2|NOC3',
        status: 'FORCE_CHANGE_PASSWORD',
        attributes: { email: 'pending@example.com', 'custom:noc': 'NOC2|NOC3' },
    },
];

describe('admin users page', () => {
    const listUsersSpy = jest.spyOn(cognito, 'listUsers');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should render correctly', () => {
        const tree = renderToFragment(<AdminUsers csrfToken="" users={mockUsers} />);
        expect(tree).toMatchSnapshot();
    });

    describe('getServerSideProps', () => {
        it('should redirect to /home when the user is not an admin', async () => {
            const ctx = getMockContext();
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({ redirect: { destination: '/home', permanent: false } });
        });

        it('should return the sorted user list when the user is an admin', async () => {
            listUsersSpy.mockResolvedValueOnce([mockUsers[1], mockUsers[0]]);
            const ctx = getMockContext({ cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) } });

            const result = await getServerSideProps(ctx);

            expect(result).toEqual({ props: { csrfToken: '', users: [mockUsers[0], mockUsers[1]] } });
        });
    });
});
