import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import EditPeriodDuration from '../../src/pages/editPeriodDuration';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('editPeriodDuration', () => {
        it('should render editPeriodDuration page correctly', () => {
            const wrapper = renderToFragment(
                <EditPeriodDuration
                    errors={[]}
                    csrfToken=""
                    productDurationValue="1"
                    productDurationUnit="week"
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
        it('should render editPeriodDuration page correctly with an error', () => {
            const wrapper = renderToFragment(
                <EditPeriodDuration
                    errors={[{ id: 'edit-period-duration-quantity', errorMessage: 'Product duration cannot be empty' }]}
                    csrfToken=""
                    productDurationValue=""
                    productDurationUnit="week"
                    backHref=""
                />,
            );
            expect(wrapper).toMatchSnapshot();
        });
    });
});
