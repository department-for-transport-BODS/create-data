import { render } from '@testing-library/react';
import AccessibilityDetails from '../../src/components/AccessibilityDetails';

describe('AccessibilityDetails', () => {
    it('should render the AccessibilityDetails component', () => {
        const { asFragment } = render(<AccessibilityDetails supportEmail="test@gmail.com" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
