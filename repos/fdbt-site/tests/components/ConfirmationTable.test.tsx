import { render } from '@testing-library/react';
import ConfirmationTable from '../../src/components/ConfirmationTable';

describe('ConfirmationTable', () => {
    it('should render the table with options', () => {
        const { asFragment } = render(
            <ConfirmationTable
                header="Snapshot test things"
                confirmationElements={[
                    { name: 'Name', content: 'Bob', href: '/login' },
                    { name: 'House', content: 'Big', href: '/fareType' },
                ]}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
