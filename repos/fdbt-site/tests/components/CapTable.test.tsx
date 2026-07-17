import { render } from '@testing-library/react';
import CapTable from '../../src/components/CapTable';
import { CapExpiryUnit } from '../../src/interfaces/matchingJsonTypes';

describe('CapTable', () => {
    it('should render the table upon first opening of page', () => {
        const { asFragment } = render(
            <CapTable errors={[]} userInputtedCaps={[]} numberOfEntitesByDistancesToDisplay={1} />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
    it('should render the table with no errors', () => {
        const { asFragment } = render(
            <CapTable
                errors={[]}
                userInputtedCaps={[
                    {
                        name: 'First cap',
                        price: '2.33',
                        durationAmount: '2',
                        durationUnits: CapExpiryUnit.WEEK,
                    },
                    {
                        name: 'Second cap',
                        price: '3.33',
                        durationAmount: '2',
                        durationUnits: CapExpiryUnit.DAY,
                    },
                ]}
                numberOfEntitesByDistancesToDisplay={2}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render the table with errors', () => {
        const { asFragment } = render(
            <CapTable
                errors={[{ errorMessage: 'Cap names must be unique', id: 'cap-name-0' }]}
                userInputtedCaps={[
                    {
                        name: 'First cap',
                        price: '2.33',
                        durationAmount: '2',
                        durationUnits: CapExpiryUnit.WEEK,
                    },
                    {
                        name: 'First cap',
                        price: '3.33',
                        durationAmount: '2',
                        durationUnits: CapExpiryUnit.DAY,
                    },
                ]}
                numberOfEntitesByDistancesToDisplay={2}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
