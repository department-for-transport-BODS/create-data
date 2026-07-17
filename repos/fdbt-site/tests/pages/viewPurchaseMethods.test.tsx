import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { FromDb, SalesOfferPackage } from '../../src/interfaces/matchingJsonTypes';
import ViewPurchaseMethods, { PurchaseMethodCardBody } from '../../src/pages/viewPurchaseMethods';
import { expectedSalesOfferPackageArray } from '../testData/mockData';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/viewPurchaseMethods' }) }));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

const purchaseMethods: FromDb<SalesOfferPackage>[] = expectedSalesOfferPackageArray
    .map((sop, index) => ({
        ...sop,
        id: index + 7,
    }))
    .filter((purchaseMethod) => !purchaseMethod.isCapped);

const cappedPurchaseMethods: FromDb<SalesOfferPackage>[] = expectedSalesOfferPackageArray
    .map((sop, index) => ({
        ...sop,
        id: index + 7,
    }))
    .filter((purchaseMethod) => purchaseMethod.isCapped);

describe('pages', () => {
    describe('view purchase methods', () => {
        it('should render correctly with no purchase methods and no capped purchase methods', () => {
            const tree = renderToFragment(
                <ViewPurchaseMethods
                    csrfToken={''}
                    purchaseMethods={[]}
                    cappedPurchaseMethods={[]}
                    referer={'hello'}
                    viewPurchaseMethodErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with purchase methods and no capped purchase methods', () => {
            const tree = renderToFragment(
                <ViewPurchaseMethods
                    csrfToken={''}
                    purchaseMethods={purchaseMethods}
                    cappedPurchaseMethods={[]}
                    referer={'hello'}
                    viewPurchaseMethodErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with no purchase methods and capped purchase methods', () => {
            const tree = renderToFragment(
                <ViewPurchaseMethods
                    csrfToken={''}
                    purchaseMethods={[]}
                    cappedPurchaseMethods={cappedPurchaseMethods}
                    referer={'hello'}
                    viewPurchaseMethodErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with purchase methods and capped purchase methods', () => {
            const tree = renderToFragment(
                <ViewPurchaseMethods
                    csrfToken={''}
                    purchaseMethods={purchaseMethods}
                    cappedPurchaseMethods={cappedPurchaseMethods}
                    referer={'hello'}
                    viewPurchaseMethodErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('purchase methods inner component', () => {
        it('renders normally when time restrictions are present', () => {
            const tree = renderToFragment(<PurchaseMethodCardBody entity={purchaseMethods[0]} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
