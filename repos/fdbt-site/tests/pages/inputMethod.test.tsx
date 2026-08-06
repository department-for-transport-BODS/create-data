import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import InputMethod from '../../src/pages/inputMethod';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('inputMethod', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
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
