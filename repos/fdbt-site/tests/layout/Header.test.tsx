import { render, screen } from '@testing-library/react';
import Header from '../../src/layout/Header';

describe('Header', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<Header isAuthed csrfToken="" noc={undefined} multiOperator={false} />);
        expect(asFragment()).toMatchSnapshot();
    });

    it('expect title_link to be root', () => {
        render(<Header isAuthed csrfToken="" noc={'HELLO'} multiOperator />);
        const titleLink = screen.getByRole('link', { name: 'Create Fares Data' });
        expect(titleLink.getAttribute('href')).toEqual('/home');
    });
});
