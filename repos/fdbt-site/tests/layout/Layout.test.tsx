import { render } from '@testing-library/react';
import Layout from '../../src/layout/Layout';

describe('Layout', () => {
    it('should render correctly', () => {
        const { asFragment } = render(<Layout title="title" description="description" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
