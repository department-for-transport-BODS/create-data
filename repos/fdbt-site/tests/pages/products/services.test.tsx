import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Services, { showProductAgainstService } from '../../../src/pages/products/services';
import { MyFaresServiceWithProductCount } from '../../../src/interfaces';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/products/services' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('myfares pages', () => {
    describe('services', () => {
        it('should render correctly when no services present', () => {
            const tree = renderToFragment(<Services servicesAndProducts={[]} />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when services present', () => {
            const services: MyFaresServiceWithProductCount[] = [
                {
                    id: '01',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                    products: 0,
                    requiresAttention: false,
                },
            ];

            const tree = renderToFragment(<Services servicesAndProducts={services} />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when services present and products', () => {
            const services: MyFaresServiceWithProductCount[] = [
                {
                    id: '01',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                    products: 2,
                    requiresAttention: false,
                },
            ];

            const tree = renderToFragment(<Services servicesAndProducts={services} />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when services require attention', () => {
            const services: MyFaresServiceWithProductCount[] = [
                {
                    id: '01',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                    products: 2,
                    requiresAttention: true,
                },
            ];

            const tree = renderToFragment(<Services servicesAndProducts={services} />);

            expect(tree).toMatchSnapshot();
        });
    });

    describe('showProductAgainstService', () => {
        it('correctly returns false if the products expiration date is before the start date of the service', () => {
            const result = showProductAgainstService(
                '2021-09-15T23:00:00.000Z',
                '2022-10-15T23:00:00.000Z',
                '05/04/2023',
                '05/04/2024',
            );
            expect(result).toBeFalsy();
        });

        it('correctly returns false if the services end date is before a products start date', () => {
            const result = showProductAgainstService(
                '2021-09-15T23:00:00.000Z',
                '2022-10-15T23:00:00.000Z',
                '05/04/2020',
                '05/04/2021',
            );
            expect(result).toBeFalsy();
        });

        it('correctly returns true if the product should be against the service', () => {
            const result = showProductAgainstService(
                '2019-09-15T23:00:00.000Z',
                '2020-10-15T23:00:00.000Z',
                '15/09/2019',
                '15/10/2020',
            );
            expect(result).toBeTruthy();
        });

        it('correctly returns true if the product should be against the service and there is no end date', () => {
            const result = showProductAgainstService(
                '2019-09-15T23:00:00.000Z',
                '2020-10-15T23:00:00.000Z',
                '15/09/2019',
                undefined,
            );
            expect(result).toBeTruthy();
        });
    });
});
