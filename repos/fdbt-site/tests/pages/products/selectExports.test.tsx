import { shallow } from 'enzyme';
import React from 'react';
import SelectExports, { getServerSideProps } from '../../../src/pages/products/selectExports';
import {
    getMockContext,
    mockOtherProducts,
    mockPointToPointProducts,
    mockServicesToDisplay,
} from '../../testData/mockData';
import * as getExportProgress from '../../../src/pages/api/getExportProgress';

jest.mock('../../../src/pages/api/getExportProgress');

describe('selectExports', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const event = Object.assign(jest.fn(), { preventDefault: () => {} });

    it('renders appropriately when the user has no products', () => {
        const tree = shallow(<SelectExports csrf={''} productsToDisplay={[]} servicesToDisplay={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('renders fully when the user has products they can export, but no point to point products', () => {
        const tree = shallow(<SelectExports csrf={''} productsToDisplay={mockOtherProducts} servicesToDisplay={[]} />);
        expect(tree).toMatchSnapshot();
    });

    it('renders fully when the user has products they can export and both types of products (point to point and non point to point)', () => {
        const tree = shallow(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('selects all the checkboxes when the select all button is clicked, and unselects them properly also', () => {
        const tree = shallow(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );
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

    it('opens all the details tabs when the open all button is clicked, and closes them properly also', () => {
        const tree = shallow(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );

        const details = tree.find('details');

        details.forEach((detail) => {
            expect(detail.props().open).toBeFalsy();
        });

        tree.find('#open-all-services').simulate('click', event);

        const detailsAfterClick = tree.find('details');

        detailsAfterClick.forEach((detail) => {
            expect(detail.props().open).toBeTruthy();
        });

        tree.find('#open-all-services').simulate('click', event);

        const detailsAfterSecondClick = tree.find('details');

        detailsAfterSecondClick.forEach((detail) => {
            expect(detail.props().open).toBeFalsy();
        });
    });

    it('correctly updates the "selected" tag to show how many products are selected', () => {
        const tree = shallow(
            <SelectExports
                csrf={''}
                productsToDisplay={[...mockOtherProducts, ...mockPointToPointProducts]}
                servicesToDisplay={mockServicesToDisplay}
            />,
        );

        expect(tree.find('#products-selected').text()).toEqual('0 / 6 selected');

        tree.find('#select-all').simulate('click', event);

        expect(tree.find('#products-selected').text()).toEqual('6 / 6 selected');
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
