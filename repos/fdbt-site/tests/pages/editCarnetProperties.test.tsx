import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { CarnetExpiryUnit } from '../../src/interfaces/matchingJsonTypes';
import EditCarnetProperties from '../../src/pages/editCarnetProperties';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('editCarnetProperties', () => {
        it('should render editCarnetProperties page correctly', () => {
            const wrapper = renderToFragment(
                <EditCarnetProperties
                    errors={[]}
                    csrfToken=""
                    expiryTime="3"
                    expiryUnit={CarnetExpiryUnit.HOUR}
                    quantity="3"
                    backHref="/product/productDetails?id=99"
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        it('should render editCarnetProperties page correctly with an error', () => {
            const wrapper = renderToFragment(
                <EditCarnetProperties
                    errors={[
                        {
                            id: 'edit-carnet-expiry-duration',
                            errorMessage: 'Carnet expiry amount cannot be less than 1',
                        },
                    ]}
                    csrfToken=""
                    expiryTime="0"
                    expiryUnit={CarnetExpiryUnit.HOUR}
                    quantity="3"
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
