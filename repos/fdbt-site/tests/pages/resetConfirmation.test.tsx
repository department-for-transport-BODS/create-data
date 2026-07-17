import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ResetConfirmation from '../../src/pages/resetConfirmation';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('fareType', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<ResetConfirmation email="test@email.com" />);
            expect(tree).toMatchSnapshot();
        });
    });
});
