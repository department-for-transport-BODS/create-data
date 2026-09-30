import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import EditUser, { getServerSideProps } from '../../../src/pages/admin/editUser';
import * as cognito from '../../../src/data/cognito';
import { buildIdToken, getMockContext } from '../../testData/mockData';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/admin/editUser' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('admin editUser page', () => {
    const getAdminUserSpy = jest.spyOn(cognito, 'getAdminUser');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should render correctly', () => {
        const tree = renderToFragment(
            <EditUser csrfToken="" errors={[]} username="user@example.com" email="user@example.com" nocs="NOC1|NOC2" />,
        );
        expect(tree).toMatchSnapshot();
    });

    describe('getServerSideProps', () => {
        it('should redirect to /home when the user is not an admin', async () => {
            const ctx = getMockContext({ query: { username: 'user@example.com' } });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({ redirect: { destination: '/home', permanent: false } });
        });

        it('should return notFound when no username is provided in the query', async () => {
            const ctx = getMockContext({ cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) } });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({ notFound: true });
        });

        it('should return notFound when the user does not exist', async () => {
            getAdminUserSpy.mockResolvedValueOnce(null);
            const ctx = getMockContext({
                cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) },
                query: { username: 'missing@example.com' },
            });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({ notFound: true });
        });

        it('should return the user details when the user is an admin and the target user exists', async () => {
            getAdminUserSpy.mockResolvedValueOnce({
                username: 'user@example.com',
                email: 'user@example.com',
                nocs: 'NOC1',
                status: 'CONFIRMED',
            });
            const ctx = getMockContext({
                cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) },
                query: { username: 'user@example.com' },
            });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    csrfToken: '',
                    errors: [],
                    success: undefined,
                    username: 'user@example.com',
                    email: 'user@example.com',
                    nocs: 'NOC1',
                },
            });
        });
    });
});
