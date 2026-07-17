import { render } from '@testing-library/react';
import RadioButtons from '../../src/components/RadioButtons';

describe('FareTypeRadios', () => {
    const mockFareProps = {
        fares: [
            {
                value: 'single',
                label: 'Single ticket',
                hint: 'A ticket for a point to point journey',
            },
            {
                value: 'return',
                label: 'Return ticket',
                hint: 'An inbound and outbound ticket for the same service',
            },
            {
                value: 'flatFare',
                label: 'Flat fare ticket',
                hint: 'A fixed fee ticket for a single journey',
            },
            {
                value: 'period',
                label: 'Period ticket',
                hint: 'A ticket valid for a number of days, weeks, months or years',
            },
            {
                value: 'carnet',
                label: 'Carnet ticket',
                hint: 'A bundle of pre-paid tickets',
            },
            {
                value: 'multiOperator',
                label: 'Multi-operator',
                hint: 'A ticket that covers more than one operator',
            },
            {
                value: 'schoolService',
                label: 'School service',
                hint: 'A ticket available to pupils in full-time education',
            },
        ],
    };

    it('should render a set of radio buttons the fares provided', () => {
        const { asFragment } = render(<RadioButtons options={mockFareProps.fares} inputName="helloANDhi" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
