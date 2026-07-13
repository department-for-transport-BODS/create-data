import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import * as auroradb from '../../src/data/auroradb';
import * as s3 from '../../src/data/s3';
import {
    mockRawService,
    userFareStages,
    fareStageNames,
    zoneStops,
    editSelectedFareStages,
} from '../testData/mockData';

import EditFareStageMatching from '../../src/pages/editFareStageMatching';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('Edit Fare Stage Matching Page', () => {
    let wrapper: DocumentFragment;
    let getServiceByNocCodeLineNameAndDataSourceSpy = jest.spyOn(auroradb, 'getServiceByIdAndDataSource');
    let batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
    let getUserFareStagesSpy = jest.spyOn(s3, 'getUserFareStages');

    beforeEach(() => {
        getServiceByNocCodeLineNameAndDataSourceSpy = jest.spyOn(auroradb, 'getServiceByIdAndDataSource');
        batchGetStopsByAtcoCodeSpy = jest.spyOn(auroradb, 'batchGetStopsByAtcoCode');
        getUserFareStagesSpy = jest.spyOn(s3, 'getUserFareStages');

        getServiceByNocCodeLineNameAndDataSourceSpy.mockImplementation(() => Promise.resolve(mockRawService));
        batchGetStopsByAtcoCodeSpy.mockImplementation(() => Promise.resolve([]));
        getUserFareStagesSpy.mockImplementation(() => Promise.resolve(userFareStages));

        wrapper = renderToFragment(
            <EditFareStageMatching
                fareStages={fareStageNames}
                stops={zoneStops}
                errors={[]}
                selectedFareStages={editSelectedFareStages}
                csrfToken=""
                backHref=""
                warning={false}
                showBackButtton={true}
                direction={'outbound'}
                dataSource="bods"
            />,
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should render correctly', () => {
        expect(wrapper).toMatchSnapshot();
    });

    it('should render correctly for tnds data source', () => {
        wrapper = renderToFragment(
            <EditFareStageMatching
                fareStages={fareStageNames}
                stops={zoneStops}
                errors={[]}
                selectedFareStages={editSelectedFareStages}
                csrfToken=""
                backHref=""
                warning={false}
                showBackButtton={true}
                direction={'outbound'}
                dataSource="tnds"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should render correctly for inbound', () => {
        wrapper = renderToFragment(
            <EditFareStageMatching
                fareStages={fareStageNames}
                stops={zoneStops}
                errors={[]}
                selectedFareStages={editSelectedFareStages}
                csrfToken=""
                backHref=""
                warning={false}
                showBackButtton={true}
                direction={'inbound'}
                dataSource="bods"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should render with error', () => {
        wrapper = renderToFragment(
            <EditFareStageMatching
                fareStages={fareStageNames}
                stops={zoneStops}
                errors={[
                    {
                        errorMessage:
                            'One or more fare stages have not been assigned, assign each fare stage to a stop',
                        id: 'option-0',
                    },
                ]}
                selectedFareStages={editSelectedFareStages}
                csrfToken=""
                backHref=""
                warning={false}
                showBackButtton={true}
                direction={'outbound'}
                dataSource="bods"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });

    it('should render with warning', () => {
        wrapper = renderToFragment(
            <EditFareStageMatching
                fareStages={fareStageNames}
                stops={zoneStops}
                errors={[]}
                selectedFareStages={editSelectedFareStages}
                csrfToken=""
                backHref=""
                warning={true}
                showBackButtton={true}
                direction={'outbound'}
                dataSource="bods"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
