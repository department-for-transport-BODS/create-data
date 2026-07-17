import { render } from '@testing-library/react';
import Help from '../../src/components/Help';

describe('Help', () => {
    it('should render the Help component', () => {
        const { asFragment } = render(<Help />);
        expect(asFragment()).toMatchSnapshot();
    });
});
