import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import MissingStops from '../../src/pages/missingStops';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('missingStops', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<MissingStops missingStops={['07093832', 'wdfa22323', '2323b23b']} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
