import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { getMockContext } from '../testData/mockData';
import ChangePassword, { getServerSideProps } from '../../src/pages/changePassword';
import { USER_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('changePassword', () => {
    it('should render correctly', () => {
        const tree = renderToFragment(<ChangePassword csrfToken="" errors={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('should render error messaging when errors are passed', () => {
        const tree = renderToFragment(
            <ChangePassword
                csrfToken=""
                errors={[
                    {
                        errorMessage: 'Passwords do not match',
                        id: 'password',
                    },
                ]}
            />,
        );
        expect(tree).toMatchSnapshot();
    });

    describe('getServerSideProps', () => {
        it('should return props containing no errors when the USER_ATTRIBUTE is missing (i.e. no errors are present)', () => {
            const ctx = getMockContext();
            const res = getServerSideProps(ctx);
            expect(res).toEqual({ props: { errors: [], csrfToken: '' } });
        });

        it('should return props containing errors when errors are present', () => {
            const mockError = {
                id: 'old-password',
                errorMessage: 'Your old password is incorrect.',
            };

            const ctx = getMockContext({
                session: {
                    [USER_ATTRIBUTE]: { errors: [mockError] },
                },
            });
            const res = getServerSideProps(ctx);
            expect(res).toEqual({ props: { errors: [mockError], csrfToken: '' } });
        });
    });
});
