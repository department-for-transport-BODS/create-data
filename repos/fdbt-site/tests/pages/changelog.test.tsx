import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Changelog from '../../src/pages/changelog';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('changelog', () => {
    it('should render correctly', () => {
        const tree = renderToFragment(<Changelog />);
        expect(tree).toMatchSnapshot();
    });
});
