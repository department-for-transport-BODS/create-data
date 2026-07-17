import { fireEvent, render } from '@testing-library/react';
import { ReactElement } from 'react';
import SelectMultiOperatorExports, { getServerSideProps } from '../../../src/pages/products/selectMultiOperatorExports';
import { getMockContext, mockMultiOperatorExtProducts } from '../../testData/mockData';
import * as getExportProgress from '../../../src/pages/api/getExportProgress';

describe('selectMultiOperatorExports', () => {
    const renderToFragment = (component: ReactElement) => render(component).asFragment();

    it('renders appropriately when the user has no products', () => {
        const tree = renderToFragment(<SelectMultiOperatorExports csrf={''} productsToDisplay={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('renders appropriately when the user has products', () => {
        const tree = renderToFragment(
            <SelectMultiOperatorExports csrf={''} productsToDisplay={mockMultiOperatorExtProducts} />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('selects all the checkboxes when the select all button is clicked, and unselects them properly also', () => {
        const { container, asFragment } = render(
            <SelectMultiOperatorExports csrf={''} productsToDisplay={mockMultiOperatorExtProducts} />,
        );
        expect(asFragment()).toMatchSnapshot();

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

        expect(result).toEqual({
            redirect: { destination: '/products/multiOperatorProductsExternal', permanent: false },
        });
    });
});
