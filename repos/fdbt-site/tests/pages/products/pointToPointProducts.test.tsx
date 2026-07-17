import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import PointToPointProducts, { filterProductsNotToDisplay } from '../../../src/pages/products/pointToPointProducts';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('myfares pages', () => {
    describe('pointToPointProducts', () => {
        it('should render correctly when no products against service', () => {
            const tree = renderToFragment(
                <PointToPointProducts
                    csrfToken={''}
                    service={{
                        id: '01',
                        origin: 'Leeds',
                        destination: 'Manchester',
                        lineId: 'wefawefa',
                        lineName: '1',
                        startDate: '1/1/2021',
                        endDate: '16/9/2021',
                    }}
                    products={[]}
                    productNeedsAttention={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when products present against service and the product requires attention', () => {
            const tree = renderToFragment(
                <PointToPointProducts
                    csrfToken={''}
                    service={{
                        id: '01',
                        origin: 'Leeds',
                        destination: 'Manchester',
                        lineId: 'wefawefa',
                        lineName: '1',
                        startDate: '1/1/2021',
                        endDate: '16/9/2021',
                    }}
                    products={[
                        {
                            id: 1,
                            productDescription: 'Adult - single',
                            validity: 'Monday, Tuesday',
                            startDate: '05/04/2020',
                            endDate: '10/04/2020',
                            requiresAttention: true,
                        },
                    ]}
                    productNeedsAttention={true}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when products present against service and the product does not require attention', () => {
            const tree = renderToFragment(
                <PointToPointProducts
                    csrfToken={''}
                    service={{
                        id: '01',
                        origin: 'Leeds',
                        destination: 'Manchester',
                        lineId: 'wefawefa',
                        lineName: '1',
                        startDate: '1/1/2021',
                        endDate: '16/9/2021',
                    }}
                    products={[
                        {
                            id: 1,
                            productDescription: 'Adult - single',
                            validity: 'Monday, Tuesday',
                            startDate: '05/04/2020',
                            endDate: '10/04/2020',
                            requiresAttention: false,
                        },
                    ]}
                    productNeedsAttention={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });
    });

    describe('filterProductsNotToDisplay', () => {
        it('correctly returns the products which should be displayed on the page', () => {
            const result = filterProductsNotToDisplay(
                {
                    id: '01',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                },
                [
                    {
                        id: 1,
                        nocCode: 'TEST',
                        lineId: 'wefawefa',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '05/04/2018',
                        endDate: '10/04/2019',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 2,
                        nocCode: 'TEST',
                        lineId: 'wefawefa',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '01/01/2021',
                        endDate: '04/04/2021',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 3,
                        nocCode: 'TEST',
                        lineId: 'wefawefa',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '05/04/2020',
                        endDate: '10/04/2020',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 4,
                        nocCode: 'TEST',
                        lineId: 'wefawefa',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '05/04/2020',
                        endDate: '10/04/2020',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                ],
            );
            expect(result).toEqual([
                {
                    endDate: '04/04/2021',
                    id: 2,
                    nocCode: 'TEST',
                    lineId: 'wefawefa',
                    fareType: 'single',
                    matchingJsonLink: '/path/to/json',
                    startDate: '01/01/2021',
                    servicesRequiringAttention: [],
                    incomplete: false,
                },
            ]);
        });

        it('correctly returns no products when none fall between the correct dates', () => {
            const result = filterProductsNotToDisplay(
                {
                    id: '01',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                },
                [
                    {
                        id: 1,
                        nocCode: 'TEST',
                        lineId: 'blah1',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '05/04/2012',
                        endDate: '10/04/2012',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 2,
                        nocCode: 'TEST',
                        lineId: 'blah2',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '01/01/2014',
                        endDate: '04/04/2015',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 3,
                        nocCode: 'TEST',
                        lineId: 'blah3',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '05/04/2022',
                        endDate: '10/04/2022',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                    {
                        id: 4,
                        nocCode: 'TEST',
                        lineId: 'blah4',
                        fareType: 'single',
                        matchingJsonLink: '/path/to/json',
                        startDate: '12/12/2021',
                        endDate: '10/04/2023',
                        servicesRequiringAttention: [],
                        incomplete: false,
                    },
                ],
            );
            expect(result).toEqual([]);
        });
    });
});
