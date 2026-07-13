import { fireEvent, render } from '@testing-library/react';
import { ReactElement } from 'react';
import SelectExports, { getServerSideProps } from '../../../src/pages/products/selectExports';
import {
    getMockContext,
    mockOtherProducts,
    mockPointToPointProducts,
    mockServicesToDisplay,
} from '../../testData/mockData';
import * as getExportProgress from '../../../src/pages/api/getExportProgress';

describe('selectExports', () => {
    const renderToFragment = (component: ReactElement) => render(component).asFragment();

    it('renders appropriately when the user has no products', () => {
        const tree = renderToFragment(<SelectExports csrf={''} productsToDisplay={[]} servicesToDisplay={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('renders fully when the user has products they can export, but no point to point products', () => {
        const tree = renderToFragment(
            <SelectExports csrf={''} productsToDisplay={mockOtherProducts} servicesToDisplay={[]} />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('renders fully when the user has products they can export and both types of products (point to point and non point to point)', () => {
        const tree = renderToFragment(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('selects all the checkboxes when the select all button is clicked, and unselects them properly also', () => {
        const { container } = render(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );
        const getCheckboxes = () => container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
        const selectAll = () => fireEvent.click(container.querySelector('#select-all') as HTMLButtonElement);

        getCheckboxes().forEach((checkbox) => {
            expect(checkbox.checked).toBeFalsy();
        });

        selectAll();

        getCheckboxes().forEach((checkbox) => {
            expect(checkbox.checked).toBeTruthy();
        });

        selectAll();

        getCheckboxes().forEach((checkbox) => {
            expect(checkbox.checked).toBeFalsy();
        });
    });

    it('opens all the details tabs when the open all button is clicked, and closes them properly also', () => {
        const { container } = render(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );
        const getDetails = () => container.querySelectorAll<HTMLDetailsElement>('details');
        const openAll = () => fireEvent.click(container.querySelector('#open-all-services') as HTMLButtonElement);

        getDetails().forEach((detail) => {
            expect(detail.open).toBeFalsy();
        });

        openAll();

        getDetails().forEach((detail) => {
            expect(detail.open).toBeTruthy();
        });

        openAll();

        getDetails().forEach((detail) => {
            expect(detail.open).toBeFalsy();
        });
    });

    it('correctly updates the "selected" tag to show how many products are selected', () => {
        const { container } = render(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );

        expect(container.querySelector('#products-selected')?.textContent).toEqual('0 / 6 selected');

        fireEvent.click(container.querySelector('#select-all') as HTMLButtonElement);

        expect(container.querySelector('#products-selected')?.textContent).toEqual('6 / 6 selected');
    });

    it('should redirect if an export is in progress', async () => {
        const getAllExportsSpy = jest.spyOn(getExportProgress, 'getAllExports');
        getAllExportsSpy.mockResolvedValueOnce([
            {
                name: 'mockExport',
                numberOfFilesExpected: 10,
                netexCount: 10,
                exportFailed: false,
                failedValidationFilenames: [],
            },
        ]);
        const ctx = getMockContext();

        const result = await getServerSideProps(ctx);

        expect(result).toEqual({ redirect: { destination: '/products/exports', permanent: false } });
    });
});
