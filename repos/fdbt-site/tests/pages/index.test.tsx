import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Index from '../../src/pages/index';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('operator', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<Index />);
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with no multiple operators', () => {
            const tree = renderToFragment(<Index />);
            expect(tree).toMatchSnapshot();
        });
    });
});
