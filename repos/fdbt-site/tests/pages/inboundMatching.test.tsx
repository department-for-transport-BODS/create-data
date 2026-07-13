import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import * as auroradb from '../../src/data/auroradb';
import * as s3 from '../../src/data/s3';
import { mockRawService, userFareStages, zoneStops, service, selectedFareStages } from '../testData/mockData';
import InboundMatching from '../../src/pages/inboundMatching';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('Inbound Matching Page', () => {
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
            <InboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                unusedStage={false}
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

    it('should render correctly with tnds data source', () => {
        wrapper = renderToFragment(
            <InboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                unusedStage={false}
                dataSource="tnds"
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should render with warning', () => {
        wrapper = renderToFragment(
            <InboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={true}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                unusedStage={false}
                dataSource="bods"
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should render with error', () => {
        wrapper = renderToFragment(
            <InboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error="No fare stages have been assigned, assign each fare stage to a stop"
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                unusedStage={false}
                dataSource="bods"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
