import { render } from '@testing-library/react';
import TapPricingRow from '../../src/components/TapPricingRow';

describe('tap pricing row', () => {
    const mockInputs = {
        '1': '9',
        '2': '99',
        '3': '999',
        '4': '555',
        '5': '666',
    };
    it('renders correctly for a single row', () => {
        const numberToRender = 1;
        const { container, asFragment } = render(
            <TapPricingRow numberOfTapsToDisplay={numberToRender} errors={[]} userInput={{}} />,
        );
        expect(container.querySelectorAll('.govuk-input')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });

    it('renders correctly for more than one row', () => {
        const numberToRender = 5;
        const { container, asFragment } = render(
            <TapPricingRow numberOfTapsToDisplay={numberToRender} errors={[]} userInput={mockInputs} />,
        );
        expect(container.querySelectorAll('.govuk-input')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });

    it('renders correctly on error', () => {
        const numberToRender = 1;
        const { container, asFragment } = render(
            <TapPricingRow
                numberOfTapsToDisplay={numberToRender}
                errors={[{ errorMessage: 'Tap price cannot be empty', id: 'multi-tap-price-0' }]}
                userInput={{ '1': '' }}
            />,
        );
        expect(container.querySelectorAll('.govuk-input')).toHaveLength(numberToRender);
        expect(asFragment()).toMatchSnapshot();
    });
});
