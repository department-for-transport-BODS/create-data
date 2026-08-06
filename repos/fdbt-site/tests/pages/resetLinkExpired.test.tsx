import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ResetLinkExpired from '../../src/pages/resetLinkExpired';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('passwordUpdated', () => {
    it('should render correctly', () => {
        const tree = renderToFragment(<ResetLinkExpired />);
        expect(tree).toMatchSnapshot();
    });
});
