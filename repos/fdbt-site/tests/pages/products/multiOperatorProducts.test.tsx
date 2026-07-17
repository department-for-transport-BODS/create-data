import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { getProductsMatchingJson } from '../../../src/data/s3';
import { getOtherProductsByNoc, getPassengerTypeById } from '../../../src/data/auroradb';
import {
    expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
    expectedPeriodGeoZoneTicketWithMultipleProducts,
    expectedPeriodMultipleServicesTicketWithMultipleProducts,
    getMockContext,
} from '../../testData/mockData';
import MultiOperatorProducts, {
    getServerSideProps,
    MultiOperatorProduct,
} from '../../../src/pages/products/multiOperatorProducts';

jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/data/s3');

(getOtherProductsByNoc as jest.Mock).mockResolvedValue([
    {
        matchingJsonLink: 'path',
        id: 1,
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
    {
        matchingJsonLink: 'path2',
        id: 2,
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
    {
        matchingJsonLink: 'path3',
        id: 3,
        startDate: '17/12/2020',
        endDate: '18/12/2020',
        incomplete: false,
    },
]);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedPeriodMultipleServicesTicketWithMultipleProducts);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedMultiOperatorGeoZoneTicketWithMultipleProducts);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedPeriodGeoZoneTicketWithMultipleProducts);
(getPassengerTypeById as jest.Mock).mockResolvedValueOnce({
    id: 9,
    name: 'My best passenger',
    passengerType: {
        passengerType: 'Adult',
    },
});
(getPassengerTypeById as jest.Mock).mockResolvedValueOnce({
    id: 2,
    name: 'My other passenger',
    passengerType: {
        passengerType: 'Infant',
    },
});
(getPassengerTypeById as jest.Mock).mockResolvedValueOnce({
    id: 3,
    name: 'My last passenger',
    passengerType: {
        passengerType: 'Student',
    },
});

const testProducts: MultiOperatorProduct[] = [
    {
        productDescription: 'First product',
        type: 'flatFare',
        id: 1,
        incomplete: false,
        duration: '1 trip',
        passengerType: 'infant',
        startDate: '11/04/2020',
        endDate: '02/09/2090',
    },
    {
        productDescription: 'The greatest product eveer!',
        type: 'period',
        id: 2,
        incomplete: false,
        duration: '3 days',
        passengerType: 'infant',
        startDate: '11/12/2021',
        endDate: '02/09/2090',
    },
    {
        productDescription: 'The greatest product eveer!',
        type: 'period',
        id: 3,
        incomplete: false,
        duration: '3 days',
        passengerType: 'adult',
        startDate: '11/12/2021',
        endDate: '02/09/2090',
    },
];

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/products/multiOperatorProducts' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('myfares pages', () => {
    describe('multiOperatorProducts', () => {
        it('should render correctly when some non-Point-to-Point products exist', () => {
            const tree = renderToFragment(<MultiOperatorProducts multiOperatorProducts={testProducts} csrfToken="" />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when no non-Point-to-Point products exist', () => {
            const tree = renderToFragment(<MultiOperatorProducts multiOperatorProducts={[]} csrfToken={''} />);

            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('creates the array of products from the main matching json and the nested products inside it', async () => {
            const ctx = getMockContext();

            expect(await getServerSideProps(ctx)).toStrictEqual({
                props: {
                    csrfToken: '',
                    multiOperatorProducts: [
                        {
                            duration: '5 weeks',
                            id: 2,
                            incomplete: false,
                            endDate: '18/12/2020',
                            passengerType: '',
                            productDescription: 'Weekly Ticket',
                            startDate: '17/12/2020',
                            type: 'multiOperator',
                        },
                        {
                            duration: '1 year',
                            endDate: '18/12/2020',
                            id: 2,
                            incomplete: false,
                            passengerType: '',
                            productDescription: 'Day Ticket',
                            startDate: '17/12/2020',
                            type: 'multiOperator',
                        },
                        {
                            duration: '28 months',
                            endDate: '18/12/2020',
                            passengerType: '',
                            id: 2,
                            incomplete: false,
                            productDescription: 'Monthly Ticket',
                            startDate: '17/12/2020',
                            type: 'multiOperator',
                        },
                    ],
                },
            });
        });
    });
});
