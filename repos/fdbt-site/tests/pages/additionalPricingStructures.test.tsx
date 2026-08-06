import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import AdditionalPricingStructures from '../../src/pages/additionalPricingStructures';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('additionalPricingStructures', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <AdditionalPricingStructures
                    errors={[]}
                    csrfToken=""
                    additionalPricingStructures={{
                        pricingStructureStart: '2',
                        structureDiscount: '2',
                    }}
                    clickedYes={true}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <AdditionalPricingStructures
                    errors={[
                        {
                            id: 'capPricing-structure-start',
                            errorMessage: 'Enter a value for the Time allowance after first journey',
                        },
                    ]}
                    csrfToken=""
                    additionalPricingStructures={{
                        pricingStructureStart: '',
                        structureDiscount: '2',
                    }}
                    clickedYes={true}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
