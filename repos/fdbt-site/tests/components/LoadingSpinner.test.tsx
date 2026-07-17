import { render } from '@testing-library/react';
import LoadingSpinner from '../../src/components/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render the loading spinner', () => {
        const { asFragment } = render(<LoadingSpinner />);
        expect(asFragment()).toMatchSnapshot();
    });
});
