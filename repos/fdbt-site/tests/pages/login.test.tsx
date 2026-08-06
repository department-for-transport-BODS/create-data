import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Login from '../../src/pages/login';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('login', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<Login errors={[]} csrfToken="" email="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <Login
                    errors={[
                        {
                            errorMessage: 'Enter an email address in the correct format, like name@example.com',
                            id: 'email',
                        },
                    ]}
                    csrfToken=""
                    email="test@example.com"
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
