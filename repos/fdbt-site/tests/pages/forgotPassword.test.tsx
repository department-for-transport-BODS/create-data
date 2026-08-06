import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ForgotPassword from '../../src/pages/forgotPassword';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    const mockErrors = [{ errorMessage: 'Choose a fare type from the options', id: 'fare-type-error' }];

    describe('fareType', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<ForgotPassword email="" errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed to the page', () => {
            const tree = renderToFragment(<ForgotPassword email="" errors={mockErrors} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });
    });
});
