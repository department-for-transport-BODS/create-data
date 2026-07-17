import { render } from '@testing-library/react';
import InsetText from '../../src/components/InsetText';

describe('InsetText', () => {
    it('should render the inset text', () => {
        const { asFragment } = render(<InsetText text="Snapshot text" />);
        expect(asFragment()).toMatchSnapshot();
    });
});
