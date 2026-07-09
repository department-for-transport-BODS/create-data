/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import * as auroradb from '../../src/data/auroradb';
import * as s3 from '../../src/data/s3';
import { mockRawService, userFareStages, zoneStops, service, selectedFareStages } from '../testData/mockData';
import OutboundMatching from '../../src/pages/outboundMatching';

jest.mock('../../src/data/auroradb');
jest.mock('../../src/data/s3');

jest.mock('../../src/data/auroradb.ts');
jest.mock('../../src/data/s3.ts');

describe('OutboundMatching Page', () => {
    let wrapper: ShallowWrapper;
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

        wrapper = shallow(
            <OutboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
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
        wrapper = shallow(
            <OutboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                dataSource="tnds"
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should render with warning', () => {
        wrapper = shallow(
            <OutboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error=""
                warning={true}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                dataSource="bods"
            />,
        );

        expect(wrapper).toMatchSnapshot();
    });

    it('should render with error', () => {
        wrapper = shallow(
            <OutboundMatching
                userFareStages={userFareStages}
                stops={zoneStops}
                service={service}
                error="No fare stages have been assigned, assign each fare stage to a stop"
                warning={false}
                selectedFareStages={selectedFareStages}
                csrfToken=""
                dataSource="bods"
            />,
        );
        expect(wrapper).toMatchSnapshot();
    });
});
