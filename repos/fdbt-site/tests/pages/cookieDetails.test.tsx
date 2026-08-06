import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import CookieDetails from '../../src/pages/cookieDetails';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('cookieDetails', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<CookieDetails />);
            expect(tree).toMatchSnapshot();
        });
    });
});
