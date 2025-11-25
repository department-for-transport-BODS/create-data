import * as React from 'react';
import { shallow } from 'enzyme';
import Contact from '../../src/pages/contact';

describe('contact', () => {
    it('should render correctly', () => {
        const tree = shallow(<Contact supportEmail="bodshelpdesk@kainos.com" supportPhone="0800 000 000" />);
        expect(tree).toMatchSnapshot();
    });
});
