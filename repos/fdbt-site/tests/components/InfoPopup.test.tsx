import { fireEvent, render, screen } from '@testing-library/react';
import InfoPopup from '../../src/components/InfoPopup';

describe('InfoPopup', () => {
    it('should render the InfoPopup', () => {
        const okActionHandler = jest.fn();
        const { asFragment } = render(
            <InfoPopup title="my title" text="this is my text" okActionHandler={okActionHandler} isOpen={true} />,
        );
        expect(asFragment()).toMatchSnapshot();

        expect(okActionHandler).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Ok' }));
        expect(okActionHandler).toHaveBeenCalled();
    });
});
