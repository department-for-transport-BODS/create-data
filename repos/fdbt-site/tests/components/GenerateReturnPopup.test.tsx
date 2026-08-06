import { fireEvent, render, screen } from '@testing-library/react';
import GenerateReturnPopup from '../../src/components/GenerateReturnPopup';

describe('GenerateReturnPopup', () => {
    it('should render the GenerateReturnPopup', () => {
        const cancelActionHandler = jest.fn();
        const { asFragment } = render(<GenerateReturnPopup cancelActionHandler={cancelActionHandler} isOpen={true} />);
        expect(asFragment()).toMatchSnapshot();

        expect(cancelActionHandler).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(cancelActionHandler).toHaveBeenCalled();
    });
});
