import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import PointToPointPeriodProduct from '../../src/pages/pointToPointPeriodProduct';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('pointToPointPeriodProduct', () => {
        it('should render correctly on first load', () => {
            const tree = renderToFragment(
                <PointToPointPeriodProduct
                    errors={[]}
                    csrfToken=""
                    product={null}
                    operator="Test Operator"
                    passengerType="Adult"
                    school={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for school ticket', () => {
            const tree = renderToFragment(
                <PointToPointPeriodProduct
                    errors={[]}
                    csrfToken=""
                    product={null}
                    operator="Test Operator"
                    passengerType="Adult"
                    school
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <PointToPointPeriodProduct
                    errors={[
                        {
                            errorMessage: 'Product name cannot have less than 2 characters',
                            id: 'point-to-point-period-product-name',
                        },

                        {
                            errorMessage: 'Product duration cannot be empty',
                            id: 'product-details-expiry-quantity',
                        },
                        {
                            errorMessage: 'Select a valid expiry unit',
                            id: 'product-details-expiry-unit',
                        },
                    ]}
                    csrfToken=""
                    product={null}
                    operator="Test Operator"
                    passengerType="Adult"
                    school
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
