import * as React from 'react';
import { shallow } from 'enzyme';
import InputMethod from '../../src/pages/inputMethod';

describe('pages', () => {
    describe('inputMethod', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <InputMethod
                    errors={[]}
                    csrfToken=""
                    guidanceDocDisplayName="Download Help File - File Type PDF - File Size 592KB"
                    guidanceDocSize="1.2MB"
                    csvTemplateDisplayName="Download fares triangle CSV template - File Type CSV - File Size 255B"
                    csvTemplateSize="255B"
                    supportEmail="bodshelpdesk@kainos.com"
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
