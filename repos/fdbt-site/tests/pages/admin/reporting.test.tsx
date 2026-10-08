import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Reporting, { getServerSideProps } from '../../../src/pages/admin/reporting';
import * as cognito from '../../../src/data/cognito';
import * as s3 from '../../../src/data/s3';
import { buildIdToken, getMockContext } from '../../testData/mockData';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/admin/reporting' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('admin reporting page', () => {
    const listUsersSpy = jest.spyOn(cognito, 'listUsers');
    const listBucketObjectsSpy = jest.spyOn(s3, 'listBucketObjects');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should render correctly', () => {
        const tree = renderToFragment(
            <Reporting
                registeredUserCount={2}
                registeredNocs={['NOC1', 'NOC2']}
                nocsWhoCreatedProducts={['NOC1']}
                thirtyDayNetex={['NOC1']}
                yearNetex={['NOC1', 'NOC2']}
                graphData={[{ title: 'single', value: 1, color: '#196f3d' }]}
            />,
        );
        expect(tree).toMatchSnapshot();
    });

    it('should render chart bars on the server without inline styles', () => {
        const markup = renderToStaticMarkup(
            <Reporting
                registeredUserCount={0}
                registeredNocs={[]}
                nocsWhoCreatedProducts={[]}
                thirtyDayNetex={[]}
                yearNetex={[]}
                graphData={[
                    { title: 'single', value: 8, color: '#196f3d' },
                    { title: 'multiOperatorExt', value: 0, color: '#7d3c98' },
                ]}
            />,
        );
        const chart = markup.slice(markup.indexOf('<svg'), markup.indexOf('</svg>') + 6);

        expect(chart).toContain('single: 8 products');
        expect(chart).toContain('multiOperatorExt: 0 products');
        expect(chart).toContain('width="510"');
        expect(chart).not.toContain('style=');
    });

    it('should render downloadable CSV data in the server response', () => {
        const markup = renderToStaticMarkup(
            <Reporting
                registeredUserCount={0}
                registeredNocs={['NOC1', 'NOC,2']}
                nocsWhoCreatedProducts={[]}
                thirtyDayNetex={[]}
                yearNetex={[]}
                graphData={[{ title: 'single', value: 1, color: '#196f3d' }]}
            />,
        );
        const csvHref = markup.match(/<a download="registeredNocs\.csv" href="([^"]+)"/);

        expect(csvHref).toBeTruthy();
        expect(decodeURIComponent(csvHref![1])).toBe('data:text/csv;charset=utf-8,NOC1\r\n"NOC,2"');
    });

    it('should not render an empty dropdown for NOCs who have created products', () => {
        const { getByText } = render(
            <Reporting
                registeredUserCount={0}
                registeredNocs={[]}
                nocsWhoCreatedProducts={[]}
                thirtyDayNetex={[]}
                yearNetex={[]}
                graphData={[]}
            />,
        );
        const productsNocLabel = getByText('NOCs who have created products');

        expect(productsNocLabel.closest('details')).toBeNull();
    });

    describe('getServerSideProps', () => {
        it('should redirect to /home when the user is not an admin', async () => {
            const ctx = getMockContext();
            const result = await getServerSideProps(ctx);
            expect(result).toEqual({ redirect: { destination: '/home', permanent: false } });
        });

        it('should build the reporting stats when the user is an admin', async () => {
            listUsersSpy.mockResolvedValueOnce([
                { username: 'a@example.com', email: 'a@example.com', nocs: 'NOC1', status: 'CONFIRMED' },
                { username: 'test@example.com', email: 'test@example.com', nocs: 'IWBusCo', status: 'CONFIRMED' },
                { username: 'kainos@kainos.com', email: 'kainos@kainos.com', nocs: 'NOC2', status: 'CONFIRMED' },
                {
                    username: 'lookalike@dft.gov.uk.example.com',
                    email: 'lookalike@dft.gov.uk.example.com',
                    nocs: 'NOC4',
                    status: 'CONFIRMED',
                },
                {
                    username: 'pending@example.com',
                    email: 'pending@example.com',
                    nocs: 'NOC3',
                    status: 'FORCE_CHANGE_PASSWORD',
                },
            ]);
            listBucketObjectsSpy.mockResolvedValueOnce([{ Key: 'NOC1/exports/export1.zip', LastModified: new Date() }]);
            listBucketObjectsSpy.mockResolvedValueOnce([{ Key: 'NOC1/single/product1.json' }]);

            const ctx = getMockContext({ cookies: { idToken: buildIdToken({ 'cognito:groups': ['admin'] }) } });
            const result = await getServerSideProps(ctx);

            expect(result).toEqual({
                props: {
                    registeredUserCount: 2,
                    registeredNocs: ['NOC1', 'NOC4'],
                    nocsWhoCreatedProducts: ['NOC1'],
                    thirtyDayNetex: ['NOC1'],
                    yearNetex: ['NOC1'],
                    graphData: expect.arrayContaining([expect.objectContaining({ title: 'single', value: 1 })]),
                },
            });
        });
    });
});
