import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import MultipleProducts, { getServerSideProps } from '../../src/pages/multipleProducts';
import { getMockContext } from '../testData/mockData';
import {
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('multipleProduct', () => {
        it('should render correctly for a non flat fare non carnet', () => {
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={1}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare={false}
                    carnet={false}
                    school={false}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render correctly for a flat fare non carnet', () => {
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={1}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare
                    carnet={false}
                    school={false}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render correctly for a flat fare carnet', () => {
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={1}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare
                    carnet
                    school={false}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render correctly for a period carnet', () => {
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={1}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare={false}
                    carnet
                    school={false}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render correctly for 5 products', () => {
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={5}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare
                    carnet
                    school
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        it('should render correctly for a multi operator flat fare', () => {
            getMockContext({
                cookies: {},
                body: null,
                session: {
                    [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServicesFlatFareMultiOperator' },
                },
            });
            const wrapper = renderToFragment(
                <MultipleProducts
                    numberOfProductsToRender={1}
                    errors={[]}
                    userInput={[]}
                    csrfToken=""
                    flatFare
                    carnet={false}
                    school={false}
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            beforeEach(() => {
                jest.clearAllMocks();
            });
            it('should return number of products to render, whether the ticket is flat fare, and whether the ticket is carnet', () => {
                const ctx = getMockContext({
                    session: {
                        [FARE_TYPE_ATTRIBUTE]: {
                            fareType: 'flatFare',
                        },
                        [CARNET_FARE_TYPE_ATTRIBUTE]: true,
                        [NUMBER_OF_PRODUCTS_ATTRIBUTE]: 2,
                    },
                });
                const result = getServerSideProps(ctx);

                expect(result.props.numberOfProductsToRender).toBe(2);
                expect(result.props.carnet).toBe(true);
                expect(result.props.flatFare).toBe(true);
            });

            it('should return number of products to render, whether the ticket is multi operator flat fare', () => {
                const ctx = getMockContext({
                    session: {
                        [FARE_TYPE_ATTRIBUTE]: {
                            fareType: 'multiOperator',
                        },
                        [NUMBER_OF_PRODUCTS_ATTRIBUTE]: undefined,
                        [TICKET_REPRESENTATION_ATTRIBUTE]: { name: 'multipleServicesFlatFareMultiOperator' },
                    },
                });
                const result = getServerSideProps(ctx);

                expect(result.props.numberOfProductsToRender).toBe(1);
                expect(result.props.carnet).toBe(false);
                expect(result.props.flatFare).toBe(true);
            });

            it('should throw an error if the necessary attributes to render the page are not present', () => {
                const ctx = getMockContext({
                    session: {
                        [FARE_TYPE_ATTRIBUTE]: undefined,
                    },
                });
                expect(() => getServerSideProps(ctx)).toThrow(
                    'Faretype attribute not found, could not ascertain fareType.',
                );
            });
        });
    });
});
