import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import DefinePricingPerDistance from '../../src/pages/definePricingPerDistance';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('DefinePricingPerDistance', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <DefinePricingPerDistance
                    errors={[]}
                    csrfToken=""
                    pricingPerDistanceData={{
                        maximumPrice: '4',
                        minimumPrice: '3',
                        distanceBands: [
                            {
                                distanceFrom: '0',
                                distanceTo: '2',
                                pricePerKm: '5',
                            },
                            {
                                distanceFrom: '2',
                                distanceTo: 'Max',
                                pricePerKm: '5',
                            },
                        ],
                        productName: 'Product',
                    }}
                    numberOfEntitesByDistanceInitial={1}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode', () => {
            const tree = renderToFragment(
                <DefinePricingPerDistance
                    errors={[]}
                    csrfToken=""
                    pricingPerDistanceData={{
                        maximumPrice: '4',
                        minimumPrice: '3',
                        distanceBands: [
                            {
                                distanceFrom: '0',
                                distanceTo: '2',
                                pricePerKm: '5',
                            },
                            {
                                distanceFrom: '2',
                                distanceTo: 'Max',
                                pricePerKm: '5',
                            },
                        ],
                        productName: 'Product',
                    }}
                    numberOfEntitesByDistanceInitial={1}
                    backHref="/products/productDetails?productId=1"
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <DefinePricingPerDistance
                    errors={[
                        {
                            id: `distance-to-0`,
                            errorMessage: 'Enter a value for the distance',
                        },
                    ]}
                    csrfToken=""
                    pricingPerDistanceData={{
                        maximumPrice: '4',
                        minimumPrice: '3',
                        distanceBands: [
                            {
                                distanceFrom: '0',
                                distanceTo: '',
                                pricePerKm: '6',
                            },
                            {
                                distanceFrom: '3',
                                distanceTo: 'Max',
                                pricePerKm: '5',
                            },
                        ],
                        productName: 'Product',
                    }}
                    numberOfEntitesByDistanceInitial={2}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
