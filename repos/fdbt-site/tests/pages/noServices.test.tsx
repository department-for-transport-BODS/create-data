import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import NoServices from '../../src/pages/noServices';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('noServices', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<NoServices />);
            expect(tree).toMatchSnapshot();
        });
    });
});
