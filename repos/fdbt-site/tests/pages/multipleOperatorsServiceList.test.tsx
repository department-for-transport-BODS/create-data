import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import MultipleOperatorsServiceList, { getServerSideProps } from '../../src/pages/multiOperatorServiceList';
import { getMockContext } from '../testData/mockData';
import * as aurora from '../../src/data/auroradb';
import { ErrorInfo, MultiOperatorInfo, ServiceWithOriginAndDestination } from '../../src/interfaces';
import { MULTIPLE_OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('multipleOperatorsServiceList', () => {
        const mockErrors: ErrorInfo[] = [
            {
                errorMessage: 'All operators need to have at least one service',
                id: 'checkbox-0',
            },
        ];

        const mockBlackServices: ServiceWithOriginAndDestination[] = [
            {
                origin: 'Fleetwood',
                destination: 'Blackpool',
                lineName: '1',
                lineId: '4YyoI0',
                startDate: '05/04/2020',
                serviceDescription: 'FLEETWOOD - BLACKPOOL via Promenade',
                serviceCode: 'NW_05_BLAC_1_1',
            },
            {
                origin: 'Poulton',
                destination: 'Blackpool',
                lineName: '2',
                lineId: 'YpQjUw',
                startDate: '05/04/2020',
                serviceDescription: 'POULTON - BLACKPOOL via Victoria Hospital Outpatients',
                serviceCode: 'NW_05_BLAC_2_1',
            },
        ];
        const mockLNUDServices: ServiceWithOriginAndDestination[] = [
            {
                origin: 'Brighouse',
                destination: 'East Bierley',
                lineName: '259',
                lineId: 'vHaXmz',
                startDate: '25/03/2020',
                serviceDescription: 'Brighouse - East Bierley',
                serviceCode: 'YWAO259',
            },
        ];
        const mockMultiOperatorData: MultiOperatorInfo[] = [
            {
                nocCode: 'BLAC',
                name: 'Blackpool Transport',
                services: [
                    {
                        lineName: '1',
                        lineId: '4YyoI0',
                        startDate: '05/04/2020',
                        serviceDescription: 'FLEETWOOD - BLACKPOOL via Promenade',
                        origin: 'Fleetwood',
                        destination: 'Blackpool',
                        serviceCode: 'NW_05_BLAC_1_1',
                    },
                    {
                        lineName: '2',
                        lineId: 'YpQjUw',
                        startDate: '05/04/2020',
                        serviceDescription: 'POULTON - BLACKPOOL via Victoria Hospital Outpatients',
                        origin: 'Poulton',
                        destination: 'Blackpool',
                        serviceCode: 'NW_05_BLAC_2_1',
                    },
                ],
                selectedServices: [],
                dataSource: 'bods',
            },
            {
                nocCode: 'LNUD',
                name: 'Testing ops',
                services: [
                    {
                        lineName: '259',
                        lineId: 'vHaXmz',
                        startDate: '25/03/2020',
                        serviceDescription: 'Brighouse - East Bierley',
                        origin: 'Brighouse',
                        destination: 'East Bierley',
                        serviceCode: 'YWAO259',
                    },
                ],
                selectedServices: [],
                dataSource: 'bods',
            },
        ];
        const getServicesByNocCodeAndDataSourceAndDescriptionSpy = jest.spyOn(
            aurora,
            'getServicesByNocCodeAndDataSourceWithGrouping',
        );

        beforeEach(() => {
            getServicesByNocCodeAndDataSourceAndDescriptionSpy.mockResolvedValueOnce(mockBlackServices);
            getServicesByNocCodeAndDataSourceAndDescriptionSpy.mockResolvedValueOnce(mockLNUDServices);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should render the multiOperatorData page upon first load', () => {
            const tree = renderToFragment(
                <MultipleOperatorsServiceList
                    multiOperatorData={mockMultiOperatorData}
                    errors={[]}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with errors', () => {
            const tree = renderToFragment(
                <MultipleOperatorsServiceList
                    multiOperatorData={mockMultiOperatorData}
                    errors={mockErrors}
                    csrfToken=""
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should return expected props to the page when the page is first visited by the user', async () => {
                const ctx = getMockContext({
                    session: {
                        [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                            selectedOperators: [
                                { nocCode: 'BLAC', name: 'Blackpool Transport' },
                                { nocCode: 'LNUD', name: 'Testing ops' },
                            ],
                        },
                    },
                });
                const result = await getServerSideProps(ctx);
                expect(result.props.errors.length).toBe(0);
                expect(result.props.multiOperatorData).toEqual(mockMultiOperatorData);
            });
        });
    });
});
