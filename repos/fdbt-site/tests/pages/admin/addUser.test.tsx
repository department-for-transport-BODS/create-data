import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import AddUser, { getServerSideProps } from '../../../src/pages/admin/addUser';
import { buildIdToken, getMockContext } from '../../testData/mockData';
import { ADMIN_ADD_USER_ATTRIBUTE } from '../../../src/constants/attributes';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/admin/addUser' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('admin addUser page', () => {
    it('should render correctly', () => {
        const tree = renderToFragment(<AddUser csrfToken="" errors={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('should render error messaging when errors are passed', () => {
        const tree = renderToFragment(
            <AddUser csrfToken="" errors={[{ id: 'email', errorMessage: 'Enter an email address' }]} />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('should render a success message when passed', () => {
        const tree = renderToFragment(<AddUser csrfToken="" errors={[]} success="new@example.com" />);
        expect(tree).toMatchSnapshot();
    });

    describe('getServerSideProps', () => {
        it('should redirect to /home when the user is not an admin', () => {
            const ctx = getMockContext();
            const result = getServerSideProps(ctx);
            expect(result).toEqual({ redirect: { destination: '/home', permanent: false } });
        });

        it('should return empty errors when no ADMIN_ADD_USER_ATTRIBUTE is present', () => {
            const ctx = getMockContext({ cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) } });
            const result = getServerSideProps(ctx);
            expect(result).toEqual({ props: { csrfToken: '', errors: [], success: undefined } });
        });

        it('should return errors when the ADMIN_ADD_USER_ATTRIBUTE contains errors', () => {
            const mockError = { id: 'email', errorMessage: 'Enter an email address' };
            const ctx = getMockContext({
                cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) },
                session: { [ADMIN_ADD_USER_ATTRIBUTE]: { errors: [mockError] } },
            });
            const result = getServerSideProps(ctx);
            expect(result).toEqual({ props: { csrfToken: '', errors: [mockError], success: undefined } });
        });
    });
});
