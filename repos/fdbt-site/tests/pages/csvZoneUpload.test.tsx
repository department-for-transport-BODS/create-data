import * as React from 'react';
import { shallow } from 'enzyme';
import CsvZoneUpload from '../../src/pages/csvZoneUpload';
import { ServicesInfo } from '../../src/interfaces';

describe('pages', () => {
    describe('csvzoneupload', () => {
        const mockServiceList: ServicesInfo[] = [
            {
                id: 11,
                lineName: '123',
                lineId: '3h3vb32ik',
                startDate: '05/02/2020',
                description: 'IW Bus Service 123',
                origin: 'Manchester',
                destination: 'Leeds',
                serviceCode: 'NW_05_BLAC_123_1',
                checked: false,
                endDate: null,
            },
            {
                id: 12,
                lineName: 'X1',
                lineId: '3h3vb32ik',
                startDate: '06/02/2020',
                description: 'Big Blue Bus Service X1',
                origin: 'Edinburgh',
                serviceCode: 'NW_05_BLAC_X1_1',
                checked: false,
                endDate: null,
            },
            {
                id: 13,
                lineName: 'Infinity Line',
                lineId: '3h3vb32ik',
                startDate: '07/02/2020',
                description: 'This is some kind of bus service',
                destination: 'London',
                serviceCode: 'WY_13_IWBT_07_1',
                checked: false,
                endDate: null,
            },
        ];
        it('should render correctly', () => {
            const tree = shallow(
                <CsvZoneUpload
                    csvUploadTitle="Upload fare zone as CSV"
                    csvUploadHintText=""
                    guidanceDocDisplayName=""
                    guidanceDocSize=""
                    csvTemplateDisplayName=""
                    csvTemplateSize=""
                    errors={[]}
                    csrfToken=""
                    backHref=""
                    serviceList={mockServiceList}
                    clickedYes={false}
                    dataSourceAttribute={{ source: 'bods', hasBods: true, hasTnds: false }}
                    supportEmail="bodshelpdesk@kainos.com"
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
