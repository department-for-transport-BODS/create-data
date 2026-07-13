import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { getMockContext } from '../testData/mockData';
import { getSalesOfferPackagesByNocCode } from '../../src/data/auroradb';
import { FARE_TYPE_ATTRIBUTE, MULTIPLE_PRODUCT_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import SelectPurchaseMethods, { getServerSideProps, PurchaseMethodsProps } from '../../src/pages/selectPurchaseMethods';
import { FromDb, SalesOfferPackage } from '../../src/interfaces/matchingJsonTypes';
import { getSessionAttribute } from '../../src/utils/sessions';

jest.mock('../../src/data/auroradb');

const renderToFragment = (component: ReactElement) => render(component).asFragment();

const defaultSalesOfferPackageOne: FromDb<SalesOfferPackage> = {
    id: 1,
    name: 'Onboard (cash)',
    description: '',
    purchaseLocations: ['onBoard'],
    paymentMethods: ['cash'],
    ticketFormats: ['paperTicket'],
    isCapped: false,
};

const defaultSalesOfferPackageTwo: FromDb<SalesOfferPackage> = {
    id: 2,
    name: 'Onboard (contactless)',
    description: '',
    purchaseLocations: ['onBoard'],
    paymentMethods: ['contactlessPaymentCard'],
    ticketFormats: ['paperTicket'],
    isCapped: false,
};

const defaultSalesOfferPackageThree: FromDb<SalesOfferPackage> = {
    id: 3,
    name: 'Online (smart card)',
    description: '',
    purchaseLocations: ['online'],
    paymentMethods: ['directDebit', 'creditCard', 'debitCard'],
    ticketFormats: ['smartCard'],
    isCapped: false,
};

const defaultSalesOfferPackageFour: FromDb<SalesOfferPackage> = {
    id: 4,
    name: 'Mobile App',
    description: '',
    purchaseLocations: ['mobileDevice'],
    paymentMethods: ['debitCard', 'creditCard', 'mobilePhone', 'directDebit'],
    ticketFormats: ['mobileApp'],
    isCapped: false,
};

const defaultSalesOfferPackageFive: FromDb<SalesOfferPackage> = {
    id: 4,
    name: 'Capped Purchase Method Mobile',
    description: '',
    purchaseLocations: ['mobileDevice'],
    paymentMethods: ['debitCard', 'creditCard'],
    ticketFormats: ['mobileApp'],
    isCapped: true,
};

const defaultSalesOfferPackageSix: FromDb<SalesOfferPackage> = {
    id: 4,
    name: 'Mobile App',
    description: '',
    purchaseLocations: ['onBoard'],
    paymentMethods: ['debitCard', 'creditCard', 'mobilePhone'],
    ticketFormats: ['smartCard'],
    isCapped: false,
};

describe('pages', () => {
    const selectSalesOfferPackagePropsInfoNoError: PurchaseMethodsProps = {
        purchaseMethodsList: [
            defaultSalesOfferPackageOne,
            defaultSalesOfferPackageTwo,
            defaultSalesOfferPackageThree,
            defaultSalesOfferPackageFour,
        ],
        errors: [],
        products: [],
        csrfToken: '',
        backHref: '',
        isCapped: false,
    };

    const selectCappedSalesOfferPackagePropsInfoNoError: PurchaseMethodsProps = {
        purchaseMethodsList: [defaultSalesOfferPackageFive, defaultSalesOfferPackageSix],
        errors: [],
        products: [],
        csrfToken: '',
        backHref: '',
        isCapped: true,
    };

    const selectSalesOfferPackagePropsInfoWithError: PurchaseMethodsProps = {
        products: [],
        purchaseMethodsList: [
            defaultSalesOfferPackageOne,
            defaultSalesOfferPackageTwo,
            defaultSalesOfferPackageThree,
            defaultSalesOfferPackageFour,
        ],
        errors: [{ errorMessage: 'Choose at least one service from the options', id: 'sales-offer-package-error' }],
        csrfToken: '',
        backHref: '',
        isCapped: false,
    };

    const selectCappedSalesOfferPackagePropsInfoWithError: PurchaseMethodsProps = {
        products: [],
        purchaseMethodsList: [defaultSalesOfferPackageFive, defaultSalesOfferPackageSix],
        errors: [{ errorMessage: 'Choose at least one service from the options', id: 'sales-offer-package-error' }],
        csrfToken: '',
        backHref: '',
        isCapped: true,
    };

    describe('selectPurchaseMethods', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={selectSalesOfferPackagePropsInfoNoError.purchaseMethodsList}
                    products={[
                        {
                            productName: 'Great Product',
                            productPrice: '22',
                        },
                    ]}
                    errors={selectSalesOfferPackagePropsInfoNoError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for capped ticket', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={selectCappedSalesOfferPackagePropsInfoNoError.purchaseMethodsList}
                    products={[
                        {
                            productName: 'Great Product',
                            productPrice: '22',
                        },
                    ]}
                    errors={selectCappedSalesOfferPackagePropsInfoNoError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={true}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with no purchase methods', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={[]}
                    products={[
                        {
                            productName: 'Great Product',
                            productPrice: '22',
                        },
                    ]}
                    errors={selectSalesOfferPackagePropsInfoNoError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with no purchase methods for capped ticket', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={[]}
                    products={[
                        {
                            productName: 'Great Product',
                            productPrice: '22',
                        },
                    ]}
                    errors={selectCappedSalesOfferPackagePropsInfoNoError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={true}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render an error when an error message is passed through to props', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={selectSalesOfferPackagePropsInfoWithError.purchaseMethodsList}
                    products={[]}
                    errors={selectSalesOfferPackagePropsInfoWithError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render an error when an error message is passed through to props for capped ticket', () => {
            const tree = renderToFragment(
                <SelectPurchaseMethods
                    purchaseMethodsList={selectCappedSalesOfferPackagePropsInfoWithError.purchaseMethodsList}
                    products={[]}
                    errors={selectCappedSalesOfferPackagePropsInfoWithError.errors}
                    csrfToken=""
                    backHref=""
                    isCapped={true}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it.each([
                ['single', '', false],
                ['flatFare', '', false],
                ['period', ' geoZone', false],
                ['period', ' mulitpleServices', true],
                ['multiOperator', ' geoZone', true],
                ['multiOperator', ' multipleServices', false],
            ])(
                'should return expected props when the page is visited by a user with stored sales offer packages on the %s%s ticket flow',
                async (fareType, _ticketType, multipleProducts) => {
                    const mockSalesOfferPackages: SalesOfferPackage[] = [
                        {
                            id: 1,
                            name: 'IW Bus Co - Package 1',
                            description: 'On bus - Cash - Paper Ticket',
                            purchaseLocations: ['On bus'],
                            paymentMethods: ['Cash'],
                            ticketFormats: ['Paper ticket'],
                            isCapped: false,
                        },
                        {
                            id: 2,
                            name: 'IW Bus Co - Package 2',
                            description: 'Online App - Card via App - eTicket',
                            purchaseLocations: ['Online App'],
                            paymentMethods: ['Card via App'],
                            ticketFormats: ['eTicket'],
                            isCapped: false,
                        },
                        {
                            id: 3,
                            name: 'IW Bus Co - Package 3',
                            description: 'Ticket Machine - Card - Pass',
                            purchaseLocations: ['Ticket Machine'],
                            paymentMethods: ['Card'],
                            ticketFormats: ['Pass'],
                            isCapped: false,
                        },
                    ];
                    (getSalesOfferPackagesByNocCode as jest.Mock).mockImplementation(() => mockSalesOfferPackages);
                    const ctx = getMockContext({
                        session: {
                            [FARE_TYPE_ATTRIBUTE]: {
                                fareType,
                            },
                            ...(!multipleProducts && { [MULTIPLE_PRODUCT_ATTRIBUTE]: null }),
                        },
                    });
                    const result = await getServerSideProps(ctx);
                    const expectedSalesOfferPackageList: SalesOfferPackage[] = mockSalesOfferPackages.map(
                        (mockSalesOfferPackage) => {
                            return {
                                ...mockSalesOfferPackage,
                            };
                        },
                    );
                    const expectedProductNamesLength = !multipleProducts
                        ? 1
                        : (getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE)?.products?.length ?? 0);
                    expect(result.props.errors.length).toBe(0);
                    expect(result.props.products.length).toBe(expectedProductNamesLength);
                    expect(result.props.purchaseMethodsList).toEqual(expectedSalesOfferPackageList);
                },
            );

            it('should throw an error when necessary nocCode is invalid, when the user is not a scheme operator', async () => {
                const ctx = getMockContext({
                    session: { [OPERATOR_ATTRIBUTE]: undefined },
                    body: null,
                    uuid: {},
                    mockWriteHeadFn: jest.fn(),
                    mockEndFn: jest.fn(),
                    isLoggedin: false,
                });
                await expect(getServerSideProps(ctx)).rejects.toThrow('invalid NOC set');
            });
        });
    });
});
