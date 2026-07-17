import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import RequestAccess from '../../src/pages/requestAccess';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('requestAccess', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<RequestAccess />);
            expect(tree).toMatchSnapshot();
        });
    });
});
