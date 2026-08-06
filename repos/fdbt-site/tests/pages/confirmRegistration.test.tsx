import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ConfirmRegistration from '../../src/pages/confirmRegistration';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('confirmRegistration', () => {
        it('should render correctly with no tndsless nocs', () => {
            const tree = renderToFragment(<ConfirmRegistration tndslessNocs={[]} />);
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with tndsless nocs', () => {
            const tree = renderToFragment(<ConfirmRegistration tndslessNocs={['AAAA', 'ZZZZ']} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
