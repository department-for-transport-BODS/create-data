import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Contact from '../../src/pages/contact';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('contact', () => {
    it('should render correctly', () => {
        const tree = renderToFragment(<Contact supportEmail="bodshelpdesk@kainos.com" supportPhone="0800 000 000" />);
        expect(tree).toMatchSnapshot();
    });
});
