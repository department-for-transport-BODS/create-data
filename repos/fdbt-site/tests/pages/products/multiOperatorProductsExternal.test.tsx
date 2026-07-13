import { render, screen } from '@testing-library/react';
import { getProductsMatchingJson } from '../../../src/data/s3';
import { getMultiOperatorExternalProducts, getPassengerTypeById } from '../../../src/data/auroradb';
import { expectedSchemeOperatorMultiServicesTicket, getMockContext } from '../../testData/mockData';
import MultiOperatorProducts, {
    getServerSideProps,
    MultiOperatorProductExternal,
} from '../../../src/pages/products/multiOperatorProductsExternal';
import * as utils from '../../../src/utils';

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
        const { asFragment } = render(
            <MultiOperatorProducts ownedProducts={ownedProducts} sharedProducts={sharedProducts} csrfToken="" />,
        );

        expect(asFragment()).toMatchSnapshot();
        expect(screen.queryByText('You currently have no multi-operator products')).toBeNull();
        expect(screen.queryByText('There are no multi-operator products shared with you')).toBeNull();
    });

    it('displays a no products message when there are no owned products', () => {
        render(<MultiOperatorProducts ownedProducts={[]} sharedProducts={sharedProducts} csrfToken="" />);

        expect(screen.getByText('You currently have no multi-operator products')).toBeTruthy();
    });

    it('displays a no products message when there are no shared products', () => {
        render(<MultiOperatorProducts ownedProducts={ownedProducts} sharedProducts={[]} csrfToken="" />);

        expect(screen.getByText('There are no multi-operator products shared with you')).toBeTruthy();
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
