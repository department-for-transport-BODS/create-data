import * as React from 'react';
import { shallow } from 'enzyme';
import ReturnService, { getServerSideProps } from '../../src/pages/returnService';
import { getServicesByNocCodeAndDataSource, getTndsServicesByNocAndModes } from '../../src/data/auroradb';
import { expectedReturnTicketWithAdditionalService, expectedSingleTicket, getMockContext } from '../testData/mockData';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
} from '../../src/constants/attributes';
import { OperatorAttribute, ServiceType } from '../../src/interfaces';

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
    describe('returnService', () => {
        beforeEach(() => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => mockServices);
        });

        it('should render correctly', () => {
            const tree = shallow(
                <ReturnService
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    errors={[]}
                    csrfToken=""
                    selectedServiceId={1}
                    backHref="/productDetails?productId=1"
                    dataSource="bods"
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('shows operator name above the select box', () => {
            const wrapper = shallow(
                <ReturnService
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    errors={[]}
                    csrfToken=""
                    selectedServiceId={1}
                    backHref="/productDetails?productId=1"
                    dataSource="bods"
                />,
            );
            const operatorWelcome = wrapper.find('#service-operator-passenger-type-hint').first();

            expect(operatorWelcome.text()).toBe('Connexions Buses - Adult');
        });

        it('shows a list of services for the operator in the select box with bods data source', () => {
            const wrapper = shallow(
                <ReturnService
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    errors={[]}
                    csrfToken=""
                    selectedServiceId={1}
                    backHref=""
                    dataSource="bods"
                />,
            );
            const operatorServices = wrapper.find('.service-option');

            expect(operatorServices).toHaveLength(3);
            expect(operatorServices.first().text()).toBe('123 Manchester - Leeds (Start date 05/02/2020)');
            expect(operatorServices.at(1).text()).toBe('X1 Edinburgh - N/A (Start date 06/02/2020)');
            expect(operatorServices.at(2).text()).toBe('Infinity Line N/A - London (Start date 07/02/2020)');
        });

        it('shows a list of services for the operator in the select box with tnds data source', () => {
            const wrapper = shallow(
                <ReturnService
                    operator="Connexions Buses"
                    passengerType="Adult"
                    services={mockServices}
                    errors={[]}
                    csrfToken=""
                    selectedServiceId={1}
                    backHref=""
                    dataSource="tnds"
                />,
            );
            const operatorServices = wrapper.find('.service-option');

            expect(operatorServices).toHaveLength(3);
            expect(operatorServices.first().text()).toBe('123 Manchester - Leeds (Start date 05/02/2020)');
            expect(operatorServices.at(1).text()).toBe('X1 Edinburgh - N/A (Start date 06/02/2020)');
            expect(operatorServices.at(2).text()).toBe('Infinity Line N/A - London (Start date 07/02/2020)');
        });

        it('returns operator value and list of services when operator attribute exists with NOCCode', async () => {
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
                },
                query: {
                    selectedServiceId: 1,
                },
            });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    errors: [],
                    operator: 'Test Op',
                    passengerType: '',
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
                    csrfToken: '',
                    backHref: '/products/productDetails?productId=1&serviceId=2',
                    selectedServiceId: 1,
                    dataSource: 'bods',
                },
            });
        });

        it('return list of services if multi modal attribute is present', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);
            (getTndsServicesByNocAndModes as jest.Mock).mockImplementation(() => mockServices);

            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
                    [MULTI_MODAL_ATTRIBUTE]: { modes: ['ferry', 'tram', 'coach'] },
                },
                query: {
                    selectedServiceId: 1,
                },
            });
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    errors: [],
                    operator: 'Test Op',
                    passengerType: '',
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
                    csrfToken: '',
                    backHref: '/products/productDetails?productId=1&serviceId=2',
                    selectedServiceId: 1,
                    dataSource: 'tnds',
                },
            });
        });

        it('throws error if no services can be found', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);

            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [MATCHING_JSON_ATTRIBUTE]: expectedReturnTicketWithAdditionalService,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
                },
                uuid: {},
                query: {
                    selectedServiceId: 1,
                },
                mockWriteHeadFn,
                mockEndFn,
            });

            await getServerSideProps(ctx);

            expect(ctx.res?.writeHead).toHaveBeenCalledWith(302, { Location: '/noServices' });
        });

        it('throws error if ticket was not in edit mode', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);

            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                },
                uuid: {},
                query: {
                    selectedServiceId: 1,
                },
                mockWriteHeadFn,
                mockEndFn,
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow('Ticket details not found');
        });

        it('throws error if selected service id is missing', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);

            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
                },
                uuid: {},
                query: {},
                mockWriteHeadFn,
                mockEndFn,
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow('Added service is missing');
        });

        it('throws error if ticket is not a return ticket', async () => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => []);

            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            const ctx = getMockContext({
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                    [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
                },
                uuid: {},
                query: {
                    selectedServiceId: 1,
                },
                mockWriteHeadFn,
                mockEndFn,
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow('Ticket should be return type');
        });

        it('throws error if noc invalid', async () => {
            const mockWriteHeadFn = jest.fn();
            const mockEndFn = jest.fn();

            const ctx = getMockContext({
                session: {
                    [OPERATOR_ATTRIBUTE]: undefined,
                    [MATCHING_JSON_ATTRIBUTE]: undefined,
                    [MATCHING_JSON_META_DATA_ATTRIBUTE]: undefined,
                },
                body: null,
                uuid: {},
                mockWriteHeadFn,
                mockEndFn,
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow('invalid NOC set');
        });
    });
});
