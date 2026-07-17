import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Exports from '../../../src/pages/products/exports';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/products/exports' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('exports', () => {
        it('should render correctly without data when operator has no products', () => {
            const tree = renderToFragment(<Exports csrf={''} operatorHasProducts={false} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render the export button correctly when operator has products', () => {
            const tree = renderToFragment(<Exports csrf={''} operatorHasProducts={true} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render the export button correctly when operator has products and an export is in progress', () => {
            const tree = renderToFragment(<Exports csrf={''} operatorHasProducts={true} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
