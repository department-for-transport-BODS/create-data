import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ManagePurchaseMethod from '../../src/pages/managePurchaseMethod';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('manage purchase method', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <ManagePurchaseMethod
                    csrfToken={''}
                    errors={[]}
                    inputs={undefined}
                    editMode={false}
                    isCapped={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });
        it('should render correctly for capped ticket', () => {
            const tree = renderToFragment(
                <ManagePurchaseMethod csrfToken={''} errors={[]} inputs={undefined} editMode={false} isCapped={true} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode', () => {
            const inputs = {
                id: 0,
                name: 'test',
                ticketFormats: ['blah'],
                paymentMethods: ['blob'],
                purchaseLocations: ['baz'],
                isCapped: false,
            };

            const tree = renderToFragment(
                <ManagePurchaseMethod csrfToken={''} errors={[]} inputs={inputs} isCapped={false} editMode />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode for capped ticket', () => {
            const inputs = {
                id: 0,
                name: 'test',
                ticketFormats: ['blah'],
                paymentMethods: ['blob'],
                purchaseLocations: ['baz'],
                isCapped: true,
            };

            const tree = renderToFragment(
                <ManagePurchaseMethod csrfToken={''} errors={[]} inputs={inputs} isCapped={false} editMode />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on purchase method form group when error', () => {
            const errors = [{ id: 'purchase-method-name', errorMessage: 'You must select at least one day.' }];

            const inputs = {
                id: 0,
                name: 'test',
                ticketFormats: ['blah'],
                paymentMethods: ['blob'],
                purchaseLocations: ['baz'],
                isCapped: false,
            };

            const tree = renderToFragment(
                <ManagePurchaseMethod csrfToken={''} errors={errors} inputs={inputs} isCapped={false} editMode />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
