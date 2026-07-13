import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Error from '../../src/pages/_error';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('error page', () => {
        it('should render error page correctly', () => {
            const tree = renderToFragment(<Error statusCode={500} />);
            expect(tree).toMatchSnapshot();
        });

        it('should render 404 page correctly', () => {
            const tree = renderToFragment(<Error statusCode={404} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
