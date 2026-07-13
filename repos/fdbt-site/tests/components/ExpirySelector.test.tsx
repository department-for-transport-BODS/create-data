import { render } from '@testing-library/react';
import ExpirySelector from '../../src/components/ExpirySelector';

describe('ExpirySelector', () => {
    it('should render the selector for a non-carnet', () => {
        const { asFragment } = render(
            <ExpirySelector
                quantityId="test-quantity-id"
                unitId="test-unit-id"
                unitName="testUnitName"
                quantityName="testQuantityName"
                hideFormGroupError={false}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the selector for a carnet', () => {
        const { asFragment } = render(
            <ExpirySelector
                quantityId="test-quantity-id"
                unitId="test-unit-id"
                unitName="testUnitName"
                quantityName="testQuantityName"
                carnet
                hideFormGroupError={false}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the selector for a school ticket', () => {
        const { asFragment } = render(
            <ExpirySelector
                quantityId="test-quantity-id"
                unitId="test-unit-id"
                unitName="testUnitName"
                quantityName="testQuantityName"
                carnet={false}
                school
                hideFormGroupError={false}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
