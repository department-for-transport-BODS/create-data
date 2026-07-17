import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Privacy from '../../src/pages/privacy';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('privacy', () => {
        it('should render privacy page correctly', () => {
            const tree = renderToFragment(<Privacy />);
            expect(tree).toMatchSnapshot();
        });
    });
});
