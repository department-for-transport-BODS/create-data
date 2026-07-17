import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import SalesConfirmation, {
    buildSalesConfirmationElements,
    getServerSideProps,
    SalesConfirmationProps,
    sopTicketFormatConverter,
} from '../../src/pages/salesConfirmation';
import { getMockContext } from '../testData/mockData';
import { CAPS_DEFINITION_ATTRIBUTE, PRODUCT_DATE_ATTRIBUTE } from '../../src/constants/attributes';
import { CapExpiryUnit } from '../../src/interfaces/matchingJsonTypes';
import * as db from '../../src/data/auroradb';
import dayjs from 'dayjs';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('confirmation', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <SalesConfirmation
                    salesOfferPackages={[
                        {
                            id: 1,
                            name: 'A sales offer package',
                            description: 'my way of selling tickets',
                            purchaseLocations: ['at stop', 'website'],
                            paymentMethods: ['cash'],
                            ticketFormats: ['paper'],
                            isCapped: false,
                        },
                    ]}
                    startDate="2017-03-13T18:00:00+00:00"
                    endDate="2057-03-13T18:00:00+00:00"
                    csrfToken=""
                    fareType="single"
                    hasCaps={false}
                    selectedCaps={null}
                    isCarnet={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        const baseExpectedProps = { salesOfferPackages: expect.any(Array), csrfToken: '' };
        const mockStartDate = '2018-12-30T18:00:00+00:00Z';
        const mockEndDate = '2020-12-30T18:00:00+00:00Z';
        const mockDateInput = {
            startDateDay: '30',
            startDateMonth: '12',
            startDateYear: '2018',
            endDateDay: '20',
            endDateMonth: '12',
            endDateYear: '2020',
        };

        jest.mock('../../src/data/auroradb');

        const getCapsSpy = jest.spyOn(db, 'getCaps');
        getCapsSpy.mockResolvedValueOnce([
            {
                id: 2,
                capDetails: {
                    name: 'Best cap',
                    price: '2',
                    durationAmount: '2',
                    durationUnits: CapExpiryUnit.MONTH,
                },
            },
            {
                id: 3,
                capDetails: {
                    name: 'Other cap',
                    price: '3',
                    durationAmount: '3',
                    durationUnits: CapExpiryUnit.MONTH,
                },
            },
        ]);

        const getCapByNocAndIdSpy = jest.spyOn(db, 'getCapByNocAndId');
        getCapByNocAndIdSpy.mockResolvedValueOnce({
            id: 2,
            capDetails: {
                name: 'Best cap',
                price: '2',
                durationAmount: '2',
                durationUnits: CapExpiryUnit.MONTH,
            },
        });

        it('should extract the start date and end date from the PRODUCT_DATE_ATTRIBUTE when the user has entered both', async () => {
            const ctx = getMockContext({
                session: {
                    [PRODUCT_DATE_ATTRIBUTE]: {
                        startDate: mockStartDate,
                        endDate: mockEndDate,
                        dateInput: mockDateInput,
                    },
                    [CAPS_DEFINITION_ATTRIBUTE]: [
                        {
                            id: 2,
                        },
                    ],
                },
            });
            const expectedProps = {
                ...baseExpectedProps,
                startDate: mockStartDate,
                endDate: mockEndDate,
                fareType: 'single',
                hasCaps: true,
                selectedCaps: [
                    {
                        id: 2,
                        capDetails: {
                            name: 'Best cap',
                            price: '2',
                            durationAmount: '2',
                            durationUnits: CapExpiryUnit.MONTH,
                        },
                    },
                ],
                isCarnet: false,
            };
            const actualProps = await getServerSideProps(ctx);
            expect((actualProps as { props: SalesConfirmationProps }).props).toEqual(expectedProps);
        });
    });

    describe('buildSalesConfirmationElements', () => {
        it('builds confirmation elements for the sales information', () => {
            const result = buildSalesConfirmationElements(
                [
                    {
                        id: 1,
                        name: 'A sales offer package',
                        description: 'my way of selling tickets',
                        purchaseLocations: ['at stop', 'website'],
                        paymentMethods: ['cash'],
                        ticketFormats: ['paper'],
                        isCapped: false,
                    },
                    {
                        id: 2,
                        name: 'Another sales offer package',
                        description: 'another way of selling tickets',
                        purchaseLocations: ['in station', 'phone'],
                        paymentMethods: ['mobileDevice'],
                        ticketFormats: ['phone'],
                        isCapped: false,
                    },
                ],
                dayjs().toISOString(),
                dayjs().add(100, 'years').toISOString(),
                'single',
                true,
                false,
                [
                    {
                        id: 2,
                        capDetails: {
                            name: 'cappy cap',
                            price: '2',
                            durationAmount: '2',
                            durationUnits: CapExpiryUnit.MONTH,
                        },
                    },
                ],
            );
            expect(result).toStrictEqual([
                {
                    content: 'my way of selling tickets',
                    href: 'selectPurchaseMethods',
                    name: 'Sales offer package 1 - A sales offer package',
                },
                {
                    content: 'another way of selling tickets',
                    href: 'selectPurchaseMethods',
                    name: 'Sales offer package 2 - Another sales offer package',
                },
                {
                    content: dayjs().format('DD-MM-YYYY'),
                    href: 'productDateInformation',
                    name: 'Ticket start date',
                },
                {
                    content: dayjs().add(100, 'years').format('DD-MM-YYYY'),
                    href: 'productDateInformation',
                    name: 'Ticket end date',
                },
                {
                    content: 'cappy cap',
                    href: 'selectCaps',
                    name: 'Caps',
                },
            ]);
        });

        it('builds confirmation elements for multi product fares', () => {
            const now = dayjs('2021-06-20');

            const result = buildSalesConfirmationElements(
                [
                    {
                        productName: 'product one',
                        salesOfferPackages: [
                            {
                                id: 1,
                                name: 'A sales offer package',
                                description: 'my way of selling tickets',
                                purchaseLocations: ['at stop', 'website'],
                                paymentMethods: ['cash'],
                                ticketFormats: ['paperTicket'],
                                isCapped: false,
                            },
                        ],
                    },
                    {
                        productName: 'another one',
                        salesOfferPackages: [
                            {
                                id: 1,
                                name: 'A sales offer package',
                                description: 'my way of selling tickets',
                                purchaseLocations: ['at stop', 'website'],
                                paymentMethods: ['cash'],
                                ticketFormats: ['paperTicket'],
                                price: '1.99',
                                isCapped: false,
                            },
                            {
                                id: 2,
                                name: 'Another sales offer package',
                                description: 'another way of selling tickets',
                                purchaseLocations: ['in station', 'phone'],
                                paymentMethods: ['mobileDevice'],
                                ticketFormats: ['mobileApp'],
                                price: '2.49',
                                isCapped: false,
                            },
                        ],
                    },
                ],
                now.toISOString(),
                now.add(100, 'years').toISOString(),
                'single',
                true,
                false,
                null,
            );
            expect(result).toStrictEqual([
                {
                    content: 'Product one',
                    href: 'selectPurchaseMethods',
                    name: 'Product',
                },
                {
                    content: [
                        'Name: A sales offer package',
                        'Purchase location: At stop, Website',
                        'Payment method(s): Cash',
                        'Ticket formats: Paper ticket',
                    ],
                    href: 'selectPurchaseMethods',
                    name: 'Sales offer package',
                },
                {
                    content: 'Another one',
                    href: 'selectPurchaseMethods',
                    name: 'Product',
                },
                {
                    content: [
                        'Name: A sales offer package',
                        'Price: £1.99',
                        'Purchase location: At stop, Website',
                        'Payment method(s): Cash',
                        'Ticket formats: Paper ticket',
                    ],
                    href: 'selectPurchaseMethods',
                    name: 'Sales offer package',
                },
                {
                    content: [
                        'Name: Another sales offer package',
                        'Price: £2.49',
                        'Purchase location: In station, Phone',
                        'Payment method(s): Mobile device',
                        'Ticket formats: Mobile app',
                    ],
                    href: 'selectPurchaseMethods',
                    name: 'Sales offer package',
                },
                {
                    content: '20-06-2021',
                    href: 'productDateInformation',
                    name: 'Ticket start date',
                },
                {
                    content: '20-06-2121',
                    href: 'productDateInformation',
                    name: 'Ticket end date',
                },
                {
                    content: 'N/A',
                    href: 'selectCaps',
                    name: 'Caps',
                },
            ]);
        });
    });

    describe('sopDisplayValueConverter', () => {
        it('formats a string array with one item', () => {
            expect(sopTicketFormatConverter(['electronic_document'])).toEqual('Digital');
        });
        it('formats a string array with multiple items', () => {
            expect(sopTicketFormatConverter(['paperTicket', 'mobileApp', 'smartCard', 'electronic_document'])).toEqual(
                'Paper ticket, Mobile app, Smart card, Digital',
            );
        });
    });
});
