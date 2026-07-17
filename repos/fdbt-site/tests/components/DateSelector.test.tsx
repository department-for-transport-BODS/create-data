import { render } from '@testing-library/react';
import DateSelector from '../../src/components/DateSelector';

describe('DateSelector', () => {
    it('should render the start DateSelector component empty', () => {
        const { asFragment } = render(<DateSelector startOrEnd="start" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the end DateSelector component empty', () => {
        const { asFragment } = render(<DateSelector startOrEnd="end" />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the DateSelector component with errors', () => {
        const { asFragment } = render(
            <DateSelector
                startOrEnd="start"
                errors={[{ errorMessage: 'Start date must be a real date', id: 'start-day-input' }]}
                inputs={{
                    dayInput: 'first',
                    monthInput: 'august',
                    yearInput: '2020',
                }}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the DateSelector component with valid inputs', () => {
        const { asFragment } = render(
            <DateSelector
                startOrEnd="start"
                errors={[]}
                inputs={{
                    dayInput: '01',
                    monthInput: '01',
                    yearInput: '2020',
                }}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
