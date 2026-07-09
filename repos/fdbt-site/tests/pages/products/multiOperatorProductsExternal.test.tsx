import { shallow } from 'enzyme';
import * as React from 'react';
import { getProductsMatchingJson } from '../../../src/data/s3';
import { getMultiOperatorExternalProducts, getPassengerTypeById } from '../../../src/data/auroradb';
import { expectedSchemeOperatorMultiServicesTicket, getMockContext } from '../../testData/mockData';
import MultiOperatorProducts, {
    getServerSideProps,
    MultiOperatorProductExternal,
} from '../../../src/pages/products/multiOperatorProductsExternal';
import * as utils from '../../../src/utils';

jest.mock('../../../src/utils');

jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/data/s3');

(getMultiOperatorExternalProducts as jest.Mock).mockResolvedValue([
    {
        matchingJsonLink: 'path',
        id: 1,
        nocCode: 'TEST',
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
    {
        matchingJsonLink: 'path2',
        id: 2,
        nocCode: 'LNUD',
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
    {
        matchingJsonLink: 'path3',
        id: 3,
        nocCode: 'ABCD',
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
]);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedSchemeOperatorMultiServicesTicket);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedSchemeOperatorMultiServicesTicket);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce({
    ...expectedSchemeOperatorMultiServicesTicket,
    additionalOperators: [
        {
            nocCode: 'RAND',
            selectedServices: [],
        },
        {
            nocCode: 'TEST',
            selectedServices: [],
        },
    ],
});
(getPassengerTypeById as jest.Mock).mockResolvedValue({
    id: 9,
    name: 'My best passenger',
    passengerType: {
        passengerType: 'Adult',
    },
});

describe('multiOperatorProductsExternal page', () => {
    const ownedProducts: MultiOperatorProductExternal[] = [
        {
            id: 1,
            incomplete: false,
            productDescription: 'product one',
            duration: '2 weeks',
            startDate: '17/12/2020',
            endDate: '18/12/2020',
            passengerType: 'My best passenger',
        },
        {
            id: 1,
            incomplete: false,
            productDescription: 'product two',
            duration: '5 days',
            startDate: '17/12/2020',
            endDate: '18/12/2020',
            passengerType: 'My best passenger',
        },
    ];
    const sharedProducts: MultiOperatorProductExternal[] = [
        {
            id: 3,
            incomplete: true,
            productDescription: 'product one',
            duration: '2 weeks',
            startDate: '17/12/2020',
            endDate: '18/12/2020',
            passengerType: 'My best passenger',
        },
        {
            id: 3,
            incomplete: true,
            productDescription: 'product two',
            duration: '5 days',
            startDate: '17/12/2020',
            endDate: '18/12/2020',
            passengerType: 'My best passenger',
        },
    ];

    it('renders correctly', () => {
        const tree = shallow(
            <MultiOperatorProducts ownedProducts={ownedProducts} sharedProducts={sharedProducts} csrfToken="" />,
        );

        expect(tree).toMatchSnapshot();
        expect(tree.find('span').exists()).toBeFalsy();
    });

    it('displays a no products message when there are no owned products', () => {
        const tree = shallow(<MultiOperatorProducts ownedProducts={[]} sharedProducts={sharedProducts} csrfToken="" />);

        expect(tree.find('span').first().text()).not.toContain('There are no multi-operator products shared with you');
    });

    it('displays a no products message when there are no shared products', () => {
        const tree = shallow(<MultiOperatorProducts ownedProducts={ownedProducts} sharedProducts={[]} csrfToken="" />);

        expect(tree.find('span').first().text()).not.toContain('You currently have no multi-operator products');
    });

    describe('getServerSideProps', () => {
        jest.spyOn(utils, 'getAndValidateNoc').mockReturnValue('TEST');
        it('sorts multi-operator products by owned and shared product lists', async () => {
            const ctx = getMockContext();
            const result = await getServerSideProps(ctx);

            expect(result.props.ownedProducts).toEqual([
                {
                    id: 1,
                    incomplete: false,
                    productDescription: 'product one',
                    duration: '2 weeks',
                    startDate: '17/12/2020',
                    endDate: '18/12/2020',
                    passengerType: 'My best passenger',
                },
                {
                    id: 1,
                    incomplete: false,
                    productDescription: 'product two',
                    duration: '5 days',
                    startDate: '17/12/2020',
                    endDate: '18/12/2020',
                    passengerType: 'My best passenger',
                },
            ]);
            expect(result.props.sharedProducts).toEqual([
                {
                    id: 3,
                    incomplete: false,
                    productDescription: 'product one',
                    duration: '2 weeks',
                    startDate: '17/12/2020',
                    endDate: '18/12/2020',
                    passengerType: 'My best passenger',
                },
                {
                    id: 3,
                    incomplete: false,
                    productDescription: 'product two',
                    duration: '5 days',
                    startDate: '17/12/2020',
                    endDate: '18/12/2020',
                    passengerType: 'My best passenger',
                },
            ]);
        });
    });
});
