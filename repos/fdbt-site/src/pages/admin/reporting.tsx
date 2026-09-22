import { ReactElement } from 'react';
import { BaseLayout } from '../../layout/Layout';
import { NextPageContextWithSession } from '../../interfaces';
import { isAdmin } from '../../utils';
import { listUsers } from '../../data/cognito';
import { listBucketObjects } from '../../data/s3';
import { NETEX_BUCKET_NAME, PRODUCTS_DATA_BUCKET_NAME } from '../../constants';
import { isTestUser } from '../../utils/adminUsers';
import {
    buildCsvDownloadHref,
    createGraphData,
    formatGraphDataForCsv,
    getProductCount,
    GraphData,
    mapIntoArrayOfArrays,
    netexFilesGenerated,
    productsCreated,
    typesOfProductsCreated,
} from '../../utils/adminReporting';

const title = 'Reporting - Create Fares Data Service';
const description = 'Admin reporting page for the Create Fares Data Service';

interface ReportingProps {
    registeredUserCount: number;
    registeredNocs: string[];
    nocsWhoCreatedProducts: string[];
    thirtyDayNetex: string[];
    yearNetex: string[];
    graphData: GraphData[];
}

const NocListDetail = ({
    summary,
    nocs,
    filename,
}: {
    summary: string;
    nocs: string[];
    filename: string;
}): ReactElement => (
    <details className="govuk-details">
        <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">{summary}</span>
        </summary>
        <div className="govuk-details__text">
            {nocs.length > 0 && (
                <p className="govuk-body">
                    <a href={buildCsvDownloadHref(mapIntoArrayOfArrays(nocs))} download={filename}>
                        Download as csv
                    </a>
                </p>
            )}
            {nocs.join(', ')}
        </div>
    </details>
);

const Reporting = ({
    registeredUserCount,
    registeredNocs,
    nocsWhoCreatedProducts,
    thirtyDayNetex,
    yearNetex,
    graphData,
}: ReportingProps): ReactElement => {
    const totalProducts = getProductCount(graphData);

    return (
        <BaseLayout title={title} description={description} showNavigation>
            <h1 className="govuk-heading-xl">Reporting</h1>

            <table className="govuk-table">
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">Registered users, discounting any privileged accounts</td>
                        <td className="govuk-table__cell">{registeredUserCount}</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">
                            <NocListDetail
                                summary="Registered NOCs"
                                nocs={registeredNocs}
                                filename="registeredNocs.csv"
                            />
                        </td>
                        <td className="govuk-table__cell">{registeredNocs.length}</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">
                            <NocListDetail
                                summary="NOCs who have created products"
                                nocs={nocsWhoCreatedProducts}
                                filename="nocsWhoMadeProducts.csv"
                            />
                        </td>
                        <td className="govuk-table__cell">{nocsWhoCreatedProducts.length}</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">
                            <NocListDetail
                                summary="NOCs who have generated NeTEx in the last 30 days"
                                nocs={thirtyDayNetex}
                                filename="thirtyDayNetexNocs.csv"
                            />
                        </td>
                        <td className="govuk-table__cell">{thirtyDayNetex.length}</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">
                            <NocListDetail
                                summary="NOCs who have generated NeTEx in the last year"
                                nocs={yearNetex}
                                filename="yearNetexNocs.csv"
                            />
                        </td>
                        <td className="govuk-table__cell">{yearNetex.length}</td>
                    </tr>
                </tbody>
            </table>

            {totalProducts > 0 && (
                <>
                    <h2 className="govuk-heading-m">Created products (not necessarily exported)</h2>
                    <p className="govuk-body">{totalProducts} total products</p>
                    <table className="govuk-table">
                        <thead className="govuk-table__head">
                            <tr className="govuk-table__row">
                                <th scope="col" className="govuk-table__header">
                                    Fare type
                                </th>
                                <th scope="col" className="govuk-table__header">
                                    Count
                                </th>
                            </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                            {graphData.map((data) => (
                                <tr className="govuk-table__row" key={data.title}>
                                    <td className="govuk-table__cell">{data.title}</td>
                                    <td className="govuk-table__cell">{data.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="govuk-body">
                        <a href={buildCsvDownloadHref(formatGraphDataForCsv(graphData))} download="createdProducts.csv">
                            Download as csv
                        </a>
                    </p>
                </>
            )}
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ReportingProps } | { redirect: { destination: string; permanent: boolean } }> => {
    if (!isAdmin(ctx)) {
        return { redirect: { destination: '/home', permanent: false } };
    }

    const users = await listUsers();

    const reportableUsers = users.filter(
        (user) =>
            user.status === 'CONFIRMED' &&
            !isTestUser(user) &&
            !user.email.toLowerCase().includes('kpmg') &&
            !user.email.toLowerCase().includes('dft.gov.uk'),
    );

    const registeredNocs = Array.from(
        new Set(reportableUsers.flatMap((user) => user.nocs.split('|').filter((noc) => noc))),
    ).sort();

    const [netexObjects, productObjects] = await Promise.all([
        listBucketObjects(NETEX_BUCKET_NAME),
        listBucketObjects(PRODUCTS_DATA_BUCKET_NAME),
    ]);

    const nocsWhoCreatedProducts = productsCreated(registeredNocs, productObjects);
    const thirtyDayNetex = netexFilesGenerated(registeredNocs, netexObjects, 30);
    const yearNetex = netexFilesGenerated(registeredNocs, netexObjects, 365);
    const graphData = createGraphData(typesOfProductsCreated(productObjects));

    return {
        props: {
            registeredUserCount: reportableUsers.length,
            registeredNocs,
            nocsWhoCreatedProducts,
            thirtyDayNetex,
            yearNetex,
            graphData,
        },
    };
};

export default Reporting;
