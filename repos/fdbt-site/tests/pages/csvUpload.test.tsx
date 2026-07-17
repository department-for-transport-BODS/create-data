import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import CsvUpload from '../../src/pages/csvUpload';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('csvUpload', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <CsvUpload
                    csvUploadTitle="Upload fares triangle as CSV"
                    csvUploadHintText=""
                    guidanceDocDisplayName=""
                    guidanceDocSize=""
                    csvTemplateDisplayName=""
                    csvTemplateSize=""
                    errors={[]}
                    showPriceOption
                    csrfToken=""
                    backHref=""
                    supportEmail="bodshelpdesk@kainos.com"
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
