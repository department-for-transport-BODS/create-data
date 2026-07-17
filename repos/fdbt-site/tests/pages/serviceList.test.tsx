import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ServiceList, { getServerSideProps } from '../../src/pages/serviceList';
import { expectedMultiOperatorGeoZoneTicketWithMultipleProducts, getMockContext } from '../testData/mockData';
import {
    getServicesByNocCodeAndDataSource,
    getAllServicesByNocCode,
    getTndsServicesByNocAndModes,
    getAdditionalNocsForMultiOpExtProduct,
} from '../../src/data/auroradb';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
} from '../../src/constants/attributes';
import { ErrorInfo, ServiceType, ServicesInfo } from '../../src/interfaces';

jest.mock('../../src/data/auroradb');

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('serviceList', () => {
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

        const mockError: ErrorInfo[] = [
            {
                errorMessage: 'Choose at least one service from the list',
                id: 'service-list-error',
            },
        ];

        const mockServices: ServiceType[] = [
            {
                id: 11,
                lineName: '123',
                lineId: '3h3vb32ik',
                startDate: '05/02/2020',
                description: 'IW Bus Service 123',
                origin: 'Manchester',
                destination: 'Leeds',
                serviceCode: 'NW_05_BLAC_123_1',
                dataSource: 'tnds',
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
                dataSource: 'tnds',
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
                dataSource: 'tnds',
                endDate: null,
            },
        ];

        beforeEach(() => {
            (getServicesByNocCodeAndDataSource as jest.Mock).mockImplementation(() => mockServices);
            (getAllServicesByNocCode as jest.Mock).mockImplementation(() => mockServices);
            (getTndsServicesByNocAndModes as jest.Mock).mockImplementation(() => []);
        });

        it('should render correctly with bods data source', () => {
            const tree = renderToFragment(
                <ServiceList
                    serviceList={mockServiceList}
                    errors={[]}
                    csrfToken=""
                    multiOperator={false}
                    dataSourceAttribute={{
                        source: 'bods',
                        hasTnds: true,
                        hasBods: true,
                    }}
                    additional={false}
                    backHref=""
                    selectedYesToExempt={false}
                    exemptStops=""
                    isEditMode={false}
                    secondaryOperatorNoc={null}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for multiOperator', () => {
            const tree = renderToFragment(
                <ServiceList
                    serviceList={mockServiceList}
                    errors={[]}
                    csrfToken=""
                    multiOperator
                    dataSourceAttribute={{
                        source: 'tnds',
                        hasTnds: true,
                        hasBods: false,
                    }}
                    additional={false}
                    backHref=""
                    selectedYesToExempt={false}
                    exemptStops=""
                    isEditMode={false}
                    secondaryOperatorNoc={null}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render an error when the error flag is set to true', () => {
            const tree = renderToFragment(
                <ServiceList
                    serviceList={[]}
                    errors={mockError}
                    csrfToken=""
                    multiOperator={false}
                    dataSourceAttribute={{
                        source: 'bods',
                        hasTnds: true,
                        hasBods: true,
                    }}
                    additional={false}
                    backHref=""
                    selectedYesToExempt={false}
                    exemptStops=""
                    isEditMode={false}
                    secondaryOperatorNoc={null}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when in edit mode', () => {
            const tree = renderToFragment(
                <ServiceList
                    serviceList={mockServiceList}
                    errors={[]}
                    csrfToken=""
                    multiOperator={false}
                    dataSourceAttribute={{
                        source: 'bods',
                        hasTnds: true,
                        hasBods: true,
                    }}
                    additional={false}
                    backHref="/product/productDetails?id=99"
                    selectedYesToExempt={false}
                    exemptStops=""
                    isEditMode
                    secondaryOperatorNoc={null}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should return expected props to the page when the page is first visited by the user', async () => {
                const ctx = getMockContext({ session: { [SERVICE_LIST_ATTRIBUTE]: null } });
                const result = await getServerSideProps(ctx);

                expect(result.props.errors.length).toBe(0);
                expect(result.props.serviceList).toEqual(mockServices);
            });

            it('should return expected props to the page when the page when multi modal attribute is present', async () => {
                const ctx = getMockContext({
                    session: {
                        [MULTI_MODAL_ATTRIBUTE]: {
                            modes: ['ferry', 'tram', 'coach'],
                        },
                        [SERVICE_LIST_ATTRIBUTE]: undefined,
                    },
                });
                (getAllServicesByNocCode as jest.Mock).mockImplementation(() => []);
                (getTndsServicesByNocAndModes as jest.Mock).mockImplementation(() => mockServices);

                const result = await getServerSideProps(ctx);
                const expectedCheckedServiceList: ServicesInfo[] = mockServices.map((mockService) => ({
                    ...mockService,
                }));

                expect(result.props.serviceList).toEqual(expectedCheckedServiceList);
            });

            it('should return props containing errors when the user has previously selected no checkboxes', async () => {
                const ctx = getMockContext({
                    session: {
                        [SERVICE_LIST_ATTRIBUTE]: {
                            errors: mockError,
                        },
                    },
                });
                const result = await getServerSideProps(ctx);

                expect(result.props.errors).toEqual(mockError);
                expect(result.props.serviceList).toEqual(mockServices);
            });

            it('should throw an error if noc invalid', async () => {
                const ctx = getMockContext({
                    session: { [OPERATOR_ATTRIBUTE]: undefined },
                    body: null,
                    uuid: {},
                    mockWriteHeadFn: jest.fn(),
                    mockEndFn: jest.fn(),
                    isLoggedin: false,
                });
                await expect(getServerSideProps(ctx)).rejects.toThrow('invalid NOC set');
            });

            it('should throw an error if editAdditionalOperator query parameter is provided for a ticket that is not being edited', async () => {
                const ctx = getMockContext({
                    body: null,
                    uuid: {},
                    mockWriteHeadFn: jest.fn(),
                    mockEndFn: jest.fn(),
                    query: { editAdditionalOperator: 'TEST' },
                });
                await expect(getServerSideProps(ctx)).rejects.toThrow(
                    'The editAdditionalOperator query parameter can not be provided for a new ticket',
                );
            });

            it('should throw an error if editAdditionalOperator query parameter is provided for a ticket that is not a multiOperatorExt ticket', async () => {
                const ctx = getMockContext({
                    body: null,
                    uuid: {},
                    mockWriteHeadFn: jest.fn(),
                    mockEndFn: jest.fn(),
                    query: { editAdditionalOperator: 'TEST' },
                    session: {
                        [MATCHING_JSON_ATTRIBUTE]: {
                            ...expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
                        },
                    },
                });
                await expect(getServerSideProps(ctx)).rejects.toThrow(
                    'The editAdditionalOperator query parameter provided for a ticket that is not a multiOperatorExt ticket',
                );
            });

            it('should throw an error if the NOC provided for editAdditionalOperator query param does not match the ticket', async () => {
                const ctx = getMockContext({
                    session: {
                        [MULTI_MODAL_ATTRIBUTE]: {
                            modes: ['ferry', 'tram', 'coach'],
                        },
                        [SERVICE_LIST_ATTRIBUTE]: undefined,
                        [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                            matchingJsonLink: 'test.json',
                            productId: '1',
                        },
                        [MATCHING_JSON_ATTRIBUTE]: {
                            ...expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
                            type: 'multiOperatorExt',
                        },
                    },
                    query: { editAdditionalOperator: 'invalid' },
                });
                (getAllServicesByNocCode as jest.Mock).mockImplementation(() => []);
                (getTndsServicesByNocAndModes as jest.Mock).mockImplementation(() => mockServices);
                (getAdditionalNocsForMultiOpExtProduct as jest.Mock).mockImplementation(() => []);

                await expect(getServerSideProps(ctx)).rejects.toThrow(
                    'The secondary operator noc code provided is not valid for the ticket',
                );
            });
        });
    });
});
