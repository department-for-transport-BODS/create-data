import { render } from '@testing-library/react';
import CookieBanner from '../../src/layout/CookieBanner';

describe('CookieBanner', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<CookieBanner />);
        expect(asFragment()).toMatchSnapshot();
    });
});
