import * as React from 'react';
import { shallow } from 'enzyme';
import CsvUpload from '../../src/pages/csvUpload';

describe('pages', () => {
    describe('csvUpload', () => {
        it('should render correctly', () => {
            const tree = shallow(
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
