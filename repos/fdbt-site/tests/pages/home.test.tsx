import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Home, { getServerSideProps } from '../../src/pages/home';
import { MULTI_MODAL_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import * as aurora from '../../src/data/auroradb';
import { OperatorAttribute } from '../../src/interfaces';
import { buildIdToken, getMockContext } from '../testData/mockData';
import { getSessionAttribute } from '../../src/utils/sessions';

const multiModalServices = [
    {
        id: 11,
        lineName: '123',
        lineId: '3h3vb32ik',
        startDate: '05/02/2020',
        description: 'IW Bus Service 123',
        serviceCode: 'NW_05_BLAC_123_1',
        origin: 'Manchester',
        destination: 'Leeds',
        dataSource: 'tnds',
        mode: 'ferry',
        endDate: null,
    },
    {
        id: 12,
        lineName: 'X1',
        lineId: '3h3vb32ik',
        startDate: '06/02/2020',
        description: 'Big Blue Bus Service X1',
        serviceCode: 'NW_05_BLAC_X1_1',
        origin: 'Bolton',
        destination: 'Wigan',
        dataSource: 'tnds',
        mode: 'coach',
        endDate: null,
    },
    {
        id: 13,
        lineName: 'Infinity Line',
        lineId: '3h3vb32ik',
        startDate: '07/02/2020',
        description: 'This is some kind of bus service',
        serviceCode: 'WY_13_IWBT_07_1',
        origin: 'Manchester',
        destination: 'York',
        dataSource: 'tnds',
        mode: 'tram',
        endDate: null,
    },
];

describe('pages', () => {
    describe('home page', () => {
        const renderToFragment = (component: ReactElement) => render(component).asFragment();

        const checkForServicesSpy = jest.spyOn(aurora, 'getAllServicesByNocCode');
        const getIncompleteMultiOperatorExternalProductsByNocSpy = jest.spyOn(
            aurora,
            'getIncompleteMultiOperatorExternalProductsByNoc',
        );

        it('should render correctly', () => {
            const tree = renderToFragment(
                <Home
                    csrfToken=""
                    showDeleteProductsLink
                    multiOperatorFaresRequiringAttentionCount={0}
                    isAdminUser={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for prod environment', () => {
            const tree = renderToFragment(
                <Home
                    csrfToken=""
                    showDeleteProductsLink={false}
                    multiOperatorFaresRequiringAttentionCount={0}
                    isAdminUser={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render with a information banner if user has one multi-operator product that require their attention', () => {
            const tree = renderToFragment(
                <Home
                    csrfToken=""
                    showDeleteProductsLink={false}
                    multiOperatorFaresRequiringAttentionCount={1}
                    isAdminUser={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render with a information banner if user has more than one multi-operator product that require their attention', () => {
            const tree = renderToFragment(
                <Home
                    csrfToken=""
                    showDeleteProductsLink={false}
                    multiOperatorFaresRequiringAttentionCount={2}
                    isAdminUser={false}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should not render the admin section when the user is not an admin', () => {
            const { queryByText } = render(
                <Home
                    csrfToken=""
                    showDeleteProductsLink={false}
                    multiOperatorFaresRequiringAttentionCount={0}
                    isAdminUser={false}
                />,
            );
            expect(queryByText('Manage users')).toBeNull();
        });

        it('should render the admin section when the user is an admin', () => {
            const { getByText, queryByRole } = render(
                <Home
                    csrfToken=""
                    showDeleteProductsLink={false}
                    multiOperatorFaresRequiringAttentionCount={0}
                    isAdminUser
                />,
            );
            expect(getByText('Manage users')).toBeTruthy();
            expect(getByText('View reporting')).toBeTruthy();
            expect(queryByRole('link', { name: 'Create NeTEx data for your fares' })).toBeNull();
            expect(queryByRole('link', { name: 'View and manage fares' })).toBeNull();
            expect(queryByRole('link', { name: 'View and manage multi-operator fares' })).toBeNull();
            expect(queryByRole('link', { name: 'Define and manage settings' })).toBeNull();

            const adminHeading = getByText('Admin');
            const relatedServicesHeading = getByText('Related services');
            expect(
                adminHeading.compareDocumentPosition(relatedServicesHeading) & Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
            expect(adminHeading.parentElement?.classList.contains('govuk-!-margin-top-7')).toBe(false);
        });

        it('should set the multi modal attribute when operator has no bods but tnds services', async () => {
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            checkForServicesSpy.mockResolvedValueOnce(multiModalServices);
            const ctx = getMockContext({
                cookies: {},
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                },
            });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            await getServerSideProps(ctx);

            expect(getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE)).toEqual(operatorData);
            expect(getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE)).toEqual({ modes: ['ferry', 'coach', 'tram'] });
        });

        it('should not set the multi modal attribute when operator has bods services', async () => {
            const services = [
                {
                    id: 11,
                    lineName: '123',
                    lineId: '3h3vb32ik',
                    startDate: '05/02/2020',
                    description: 'IW Bus Service 123',
                    serviceCode: 'NW_05_BLAC_123_1',
                    origin: 'Manchester',
                    destination: 'Leeds',
                    dataSource: 'bods',
                    mode: 'ferry',
                    endDate: '15/02/2020',
                },
            ];
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            checkForServicesSpy.mockResolvedValueOnce(services);
            const ctx = getMockContext({
                cookies: {},
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                },
            });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            await getServerSideProps(ctx);

            expect(getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE)).toEqual(operatorData);
            expect(getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE)).toEqual(undefined);
        });

        it('should not set the multi modal attribute when operator has bods and tnds services', async () => {
            const services = [
                {
                    id: 11,
                    lineName: '123',
                    lineId: '3h3vb32ik',
                    startDate: '05/02/2020',
                    description: 'IW Bus Service 123',
                    serviceCode: 'NW_05_BLAC_123_1',
                    origin: 'Manchester',
                    destination: 'Leeds',
                    dataSource: 'bods',
                    mode: 'ferry',
                    endDate: '25/02/2020',
                },
                {
                    id: 12,
                    lineName: 'X1',
                    lineId: '3h3vb32ik',
                    startDate: '06/02/2020',
                    description: 'Big Blue Bus Service X1',
                    serviceCode: 'NW_05_BLAC_X1_1',
                    origin: 'Bolton',
                    destination: 'Wigan',
                    dataSource: 'tnds',
                    mode: 'coach',
                    endDate: null,
                },
            ];
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            checkForServicesSpy.mockResolvedValueOnce(services);
            const ctx = getMockContext({
                cookies: {},
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                },
            });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            await getServerSideProps(ctx);

            expect(getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE)).toEqual(operatorData);
            expect(getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE)).toEqual(undefined);
        });

        it('should not set the multi modal attribute when operator has no bods or no tnds services', async () => {
            const operatorData: OperatorAttribute = {
                name: 'Test Op',
                nocCode: 'TEST',
            };

            checkForServicesSpy.mockResolvedValueOnce([]);
            const ctx = getMockContext({
                cookies: {},
                body: null,
                session: {
                    [OPERATOR_ATTRIBUTE]: operatorData,
                },
            });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            await getServerSideProps(ctx);

            expect(getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE)).toEqual(operatorData);
            expect(getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE)).toEqual(undefined);
        });

        it('should return isAdminUser false for a user not in the admin group', async () => {
            checkForServicesSpy.mockResolvedValueOnce([]);
            const ctx = getMockContext({ cookies: {}, body: null });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            const result = await getServerSideProps(ctx);

            expect(result).toEqual(expect.objectContaining({ props: expect.objectContaining({ isAdminUser: false }) }));
        });

        it('should return isAdminUser true for a user in the admin group', async () => {
            checkForServicesSpy.mockResolvedValueOnce([]);
            const ctx = getMockContext({
                cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) },
                body: null,
            });
            getIncompleteMultiOperatorExternalProductsByNocSpy.mockResolvedValueOnce([]);

            const result = await getServerSideProps(ctx);

            expect(result).toEqual(expect.objectContaining({ props: expect.objectContaining({ isAdminUser: true }) }));
        });
    });
});
