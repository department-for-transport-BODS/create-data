import * as React from 'react';
import { shallow } from 'enzyme';
import Service, { getServerSideProps } from '../../src/pages/service';
import { getServicesByNocCodeAndDataSource } from '../../src/data/auroradb';
import { getMockContext } from '../testData/mockData';
import {
    MULTI_MODAL_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
} from '../../src/constants/attributes';
import { ServiceType } from '../../src/interfaces';

jest.mock('../../src/data/auroradb');

const mockServices: ServiceType[] = [
    {
        id: 11,
        lineName: '123',
        lineId: '3h3vb32ik',
        startDate: '05/02/2020',
        description: 'this bus service is 123',
        origin: 'Manchester',
        destination: 'Leeds',
        serviceCode: 'NW_05_BLAC_123_1',
        endDate: null,
    },
    {
        id: 12,
        lineName: 'X1',
        lineId: '3h3vb32ik',
        startDate: '06/02/2020',
        description: 'this bus service is X1',
        origin: 'Edinburgh',
        serviceCode: 'NW_05_BLAC_X1_1',
        endDate: null,
    },
    {
        id: 13,
        lineName: 'Infinity Line',
        lineId: '3h3vb32ik',
        startDate: '07/02/2020',
        description: 'this bus service is Infinity Line',
        destination: 'London',
        serviceCode: 'WY_13_IWBT_07_1',
        endDate: null,
    },
];

describe('pages', () => {
    describe('service', () => {
        beforeEach(() => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => mockServices);
        });
        /*
         it('should render correctly when data source is tnds', () => {
             const tree = shallow(
                 <Service
                     operator="Connexions Buses"
                     passengerType="Adult"
                     services={mockServices}
                     error={[]}
                     dataSourceAttribute={{
                         source: 'tnds',
                         hasTnds: true,
                         hasBods: false,
                     }}
                     csrfToken=""
                 />,
             );
             expect(tree).toMatchSnapshot();
         });
         */

        it('should render correctly when data source is bods', () => {
            const tree = shallow(
                <Service
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    error={[]}
                    warning={[]}
                    dataSourceAttribute={{
                        source: 'bods',
                        hasTnds: false,
                        hasBods: true,
                    }}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('shows operator name above the select box', () => {
            const wrapper = shallow(
                <Service
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    error={[]}
                    warning={[]}
                    dataSourceAttribute={{
                        source: 'tnds',
                        hasTnds: true,
                        hasBods: false,
                    }}
                    csrfToken=""
                />,
            );
            const operatorWelcome = wrapper.find('#service-operator-passenger-type-hint').first();

            expect(operatorWelcome.text()).toBe('Connexions Buses - Adult');
        });

        it('shows a list of services for the operator in the select box with tnds data source', () => {
            const wrapper = shallow(
                <Service
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    error={[]}
                    warning={[]}
                    dataSourceAttribute={{
                        source: 'tnds',
                        hasTnds: true,
                        hasBods: false,
                    }}
                    csrfToken=""
                />,
            );
            const operatorServices = wrapper.find('.service-option');

            expect(operatorServices).toHaveLength(3);
            expect(operatorServices.first().text()).toBe('123 - Start date 05/02/2020');
            expect(operatorServices.at(1).text()).toBe('X1 - Start date 06/02/2020');
            expect(operatorServices.at(2).text()).toBe('Infinity Line - Start date 07/02/2020');
        });

        it('shows a list of services for the operator in the select box with bods data source', () => {
            const wrapper = shallow(
                <Service
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    error={[]}
                    warning={[]}
                    dataSourceAttribute={{
                        source: 'bods',
                        hasTnds: false,
                        hasBods: true,
                    }}
                    csrfToken=""
                />,
            );
            const operatorServices = wrapper.find('.service-option');

            expect(operatorServices).toHaveLength(3);
            expect(operatorServices.first().text()).toBe('123 Manchester - Leeds (Start date 05/02/2020)');
            expect(operatorServices.at(1).text()).toBe('X1 Edinburgh - N/A (Start date 06/02/2020)');
            expect(operatorServices.at(2).text()).toBe('Infinity Line N/A - London (Start date 07/02/2020)');
        });

        it('returns operator value and list of services for the multi modal operator if multi modal attribute is present in session', async () => {
            const ctx = getMockContext({
                session: {
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'tnds',
                        hasBods: false,
                        hasTnds: true,
                    },
                    [MULTI_MODAL_ATTRIBUTE]: {
                        modes: ['tram', 'bus', 'coach'],
                    },
                },
            });
            const result = await getServerSideProps(ctx);

            expect(result).toEqual({
                props: {
                    error: [],
                    warning: [],
                    operator: 'test',
                    passengerType: 'Adult',
                    services: [
                        {
                            id: 11,
                            lineName: '123',
                            lineId: '3h3vb32ik',
                            startDate: '05/02/2020',
                            description: 'this bus service is 123',
                            origin: 'Manchester',
                            destination: 'Leeds',
                            serviceCode: 'NW_05_BLAC_123_1',
                            endDate: null,
                        },
                        {
                            id: 12,
                            lineName: 'X1',
                            lineId: '3h3vb32ik',
                            startDate: '06/02/2020',
                            description: 'this bus service is X1',
                            origin: 'Edinburgh',
                            serviceCode: 'NW_05_BLAC_X1_1',
                            endDate: null,
                        },
                        {
                            id: 13,
                            lineName: 'Infinity Line',
                            lineId: '3h3vb32ik',
                            startDate: '07/02/2020',
                            description: 'this bus service is Infinity Line',
                            destination: 'London',
                            serviceCode: 'WY_13_IWBT_07_1',
                            endDate: null,
                        },
                    ],
                    dataSourceAttribute: {
                        source: 'tnds',
                        hasBods: false,
                        hasTnds: true,
                    },
                    csrfToken: '',
                },
            });
        });

        it('returns operator value and list of services when operator attribute exists with NOCCode', async () => {
            const ctx = getMockContext({
                session: {
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
            });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    error: [],
                    warning: [],
                    operator: 'test',
                    passengerType: 'Adult',
                    services: [
                        {
                            id: 11,
                            lineName: '123',
                            lineId: '3h3vb32ik',
                            startDate: '05/02/2020',
                            description: 'this bus service is 123',
                            origin: 'Manchester',
                            destination: 'Leeds',
                            serviceCode: 'NW_05_BLAC_123_1',
                            endDate: null,
                        },
                        {
                            id: 12,
                            lineName: 'X1',
                            lineId: '3h3vb32ik',
                            startDate: '06/02/2020',
                            description: 'this bus service is X1',
                            origin: 'Edinburgh',
                            serviceCode: 'NW_05_BLAC_X1_1',
                            endDate: null,
                        },
                        {
                            id: 13,
                            lineName: 'Infinity Line',
                            lineId: '3h3vb32ik',
                            startDate: '07/02/2020',
                            description: 'this bus service is Infinity Line',
                            destination: 'London',
                            serviceCode: 'WY_13_IWBT_07_1',
                            endDate: null,
                        },
                    ],
                    dataSourceAttribute: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                    csrfToken: '',
                },
            });
        });

        it('throws error if no services can be found', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);

            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();

            const ctx = getMockContext({
                body: null,
                session: {
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
                uuid: {},
                mockWriteHeadFn,
                mockEndFn,
            });

            await getServerSideProps(ctx);

            expect(ctx.res?.writeHead).toHaveBeenCalledWith(302, { Location: '/noServices' });
        });

        it('throws error if noc invalid', async () => {
            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();

            const ctx = getMockContext({
                session: {
                    [OPERATOR_ATTRIBUTE]: undefined,
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
                body: null,
                uuid: {},
                mockWriteHeadFn,
                mockEndFn,
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow('invalid NOC set');
        });

        it('throws error if passengerType session does not exist', async () => {
            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();

            const ctx = getMockContext({
                body: null,
                uuid: {},
                mockWriteHeadFn,
                mockEndFn,
                session: {
                    [PASSENGER_TYPE_ATTRIBUTE]: undefined,
                },
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow(
                'Could not render the service selection page. Necessary attributes not found.',
            );
        });
    });
});
