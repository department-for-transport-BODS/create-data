import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ManageFareDayEnd, { fareDayEndInputId } from '../../src/pages/manageFareDayEnd';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/manageFareDayEnd' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('manage passenger types', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <ManageFareDayEnd csrfToken={''} errors={[]} fareDayEnd={'1234'} referer={'hi'} saved={false} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state if error', () => {
            const errors = [{ id: fareDayEndInputId, errorMessage: 'An error happened!' }];

            const tree = renderToFragment(
                <ManageFareDayEnd
                    csrfToken={''}
                    errors={errors}
                    fareDayEnd={'Not a time'}
                    referer={null}
                    saved={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render popup if saved', () => {
            const tree = renderToFragment(
                <ManageFareDayEnd csrfToken={''} errors={[]} fareDayEnd={'1254'} referer={null} saved={true} />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
