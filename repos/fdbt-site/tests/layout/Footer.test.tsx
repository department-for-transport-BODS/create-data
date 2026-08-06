import { render } from '@testing-library/react';
import Footer from '../../src/layout/Footer';

describe('Footer', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<Footer />);
        expect(asFragment()).toMatchSnapshot();
    });
});
