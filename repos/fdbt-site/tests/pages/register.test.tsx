import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Register, { getServerSideProps } from '../../src/pages/register';
import { getMockContext } from '../testData/mockData';
import { USER_ATTRIBUTE } from '../../src/constants/attributes';
import { ErrorInfo } from '../../src/interfaces';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('register', () => {
        const mockErrors: ErrorInfo[] = [
            {
                errorMessage: 'Enter an email address in the correct format, like name@example.com',
                id: 'email',
                userInput: 'test@tfn.com',
            },
        ];

        it('should render correctly', () => {
            const tree = renderToFragment(<Register regKey="abcdefg" errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render errors correctly', () => {
            const tree = renderToFragment(<Register regKey="abcdefg" errors={mockErrors} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            const mockRegKey = 'thisisarandomquerystringkey';
            it('should return default props when the page is first visited', () => {
                const ctx = getMockContext({ query: { key: mockRegKey } });
                const expectedProps = { csrfToken: '', errors: [], regKey: mockRegKey };
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props).toEqual(expectedProps);
            });

            it('should return props containing errors when the user submits invalid info', () => {
                const ctx = getMockContext({
                    session: { [USER_ATTRIBUTE]: { errors: mockErrors } },
                    query: { key: mockRegKey },
                });
                const expectedProps = { csrfToken: '', errors: mockErrors, regKey: mockRegKey };
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props).toEqual(expectedProps);
            });
        });
    });
});
