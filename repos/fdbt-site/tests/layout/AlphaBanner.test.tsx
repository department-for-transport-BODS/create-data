import { render, screen } from '@testing-library/react';
import PhaseBanner from '../../src/layout/PhaseBanner';
import { FEEDBACK_LINK } from '../../src/constants';

describe('PhaseBanner', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<PhaseBanner />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('expect govuk_link to be correct gov.uk', () => {
        render(<PhaseBanner />);
        const feedbackLink = screen.getByRole('link', { name: 'give your feedback (opens in new tab)' });
        expect(feedbackLink.getAttribute('href')).toEqual(FEEDBACK_LINK);
    });
});
