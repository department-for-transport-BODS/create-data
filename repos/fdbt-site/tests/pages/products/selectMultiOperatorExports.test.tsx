import { shallow } from 'enzyme';
import React from 'react';
import SelectMultiOperatorExports, { getServerSideProps } from '../../../src/pages/products/selectMultiOperatorExports';
import { getMockContext, mockMultiOperatorExtProducts } from '../../testData/mockData';
import * as getExportProgress from '../../../src/pages/api/getExportProgress';

jest.mock('../../../src/pages/api/getExportProgress');

describe('selectMultiOperatorExports', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const event = Object.assign(jest.fn(), { preventDefault: () => {} });

    it('renders appropriately when the user has no products', () => {
        const tree = shallow(<SelectMultiOperatorExports csrf={''} productsToDisplay={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('renders appropriately when the user has products', () => {
        const tree = shallow(<SelectMultiOperatorExports csrf={''} productsToDisplay={mockMultiOperatorExtProducts} />);
        expect(tree).toMatchSnapshot();
    });

    it('selects all the checkboxes when the select all button is clicked, and unselects them properly also', () => {
        const tree = shallow(<SelectMultiOperatorExports csrf={''} productsToDisplay={mockMultiOperatorExtProducts} />);
        expect(tree).toMatchSnapshot();

        const checkboxes = tree.find('checkbox');

        checkboxes.forEach((checkbox) => {
            expect(checkbox.props().checked).toBeFalsy();
        });

        tree.find('#select-all').simulate('click', event);

        checkboxes.forEach((checkbox) => {
            expect(checkbox.props().checked).toBeTruthy();
        });

        tree.find('#select-all').simulate('click', event);

        checkboxes.forEach((checkbox) => {
            expect(checkbox.props().checked).toBeFalsy();
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
