import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { getProductsMatchingJson } from '../../../src/data/s3';
import { getOtherProductsByNoc, getPassengerTypeNameByIdAndNoc } from '../../../src/data/auroradb';
import { MyFaresOtherFaresProduct } from '../../../src/interfaces';
import OtherProducts, { getServerSideProps } from '../../../src/pages/products/otherProducts';
import {
    expectedFlatFareTicket,
    expectedPeriodGeoZoneTicketWithMultipleProducts,
    getMockContext,
} from '../../../tests/testData/mockData';

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
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce(expectedFlatFareTicket);
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce({
    ...expectedPeriodGeoZoneTicketWithMultipleProducts,
    products: [expectedPeriodGeoZoneTicketWithMultipleProducts.products[0]],
});
(getProductsMatchingJson as jest.Mock).mockResolvedValueOnce({
    ...expectedPeriodGeoZoneTicketWithMultipleProducts,
    products: [expectedPeriodGeoZoneTicketWithMultipleProducts.products[1]],
});

(getPassengerTypeNameByIdAndNoc as jest.Mock)
    .mockResolvedValueOnce('My best passenger')
    .mockResolvedValueOnce('My other passenger')
    .mockResolvedValueOnce('My last passenger');

const testProducts: MyFaresOtherFaresProduct[] = [
    {
        productDescription: 'First product',
        type: 'flatFare',
        id: 1,
        duration: '1 trip',
        passengerType: 'infant',
        startDate: '11/04/2020',
        endDate: '02/09/2090',
    },
    {
        productDescription: 'The greatest product eveer!',
        type: 'period',
        id: 2,
        duration: '3 days',
        passengerType: 'infant',
        startDate: '11/12/2021',
        endDate: '02/09/2090',
    },
    {
        productDescription: 'The greatest product eveer!',
        type: 'period',
        id: 3,
        duration: '3 days',
        passengerType: 'adult',
        startDate: '11/12/2021',
        endDate: '02/09/2090',
    },
];

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/products/otherProducts' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('myfares pages', () => {
    describe('otherProducts', () => {
        it('should render correctly when some non-Point-to-Point products exist', () => {
            const tree = renderToFragment(<OtherProducts otherProducts={testProducts} csrfToken="" />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when no non-Point-to-Point products exist', () => {
            const tree = renderToFragment(<OtherProducts otherProducts={[]} csrfToken={''} />);

            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('creates the array of products from the main matching json and the nested products inside it', async () => {
            const ctx = getMockContext();

            expect(await getServerSideProps(ctx)).toStrictEqual({
                props: {
                    csrfToken: '',
                    otherProducts: [
                        {
                            duration: '1 trip',
                            id: 1,
                            endDate: '18/12/2020',
                            passengerType: 'My best passenger',
                            productDescription: 'Weekly Rider',
                            startDate: '17/12/2020',
                            type: 'flatFare',
                            incomplete: false,
                        },
                        {
                            duration: '5 weeks',
                            id: 2,
                            endDate: '18/12/2020',
                            passengerType: 'My other passenger',
                            productDescription: 'Weekly Ticket',
                            startDate: '17/12/2020',
                            type: 'period',
                            incomplete: false,
                        },
                        {
                            duration: '1 year',
                            id: 3,
                            endDate: '18/12/2020',
                            passengerType: 'My last passenger',
                            productDescription: 'Day Ticket',
                            startDate: '17/12/2020',
                            type: 'period',
                            incomplete: false,
                        },
                    ],
                },
            });
        });
    });
});
