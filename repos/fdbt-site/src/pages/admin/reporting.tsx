import { ReactElement } from 'react';
import Papa from 'papaparse';
import { BaseLayout } from '../../layout/Layout';
import { NextPageContextWithSession } from '../../interfaces';
import { isAdmin } from '../../utils';
import { listUsers } from '../../data/cognito';
import { listBucketObjects } from '../../data/s3';
import { NETEX_BUCKET_NAME, PRODUCTS_DATA_BUCKET_NAME } from '../../constants';
import { isTestUser } from '../../utils/adminUsers';
import {
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

const PRODUCT_CHART_GEOMETRY = {
    viewBoxWidth: 800,
    plotStartX: 190,
    plotWidth: 510,
    rowHeight: 48,
    chartHeightPadding: 56,
    tickCount: 5,
    gridTop: 32,
    gridBottomPadding: 24,
    tickLabelY: 20,
    categoryLabelX: 180,
    rowStartY: 40,
    rowTextOffsetY: 20,
    barHeight: 30,
    valueLabelGap: 10,
} as const;

const ProductChart = ({ graphData }: { graphData: GraphData[] }): ReactElement => {
    const tickIntervals = PRODUCT_CHART_GEOMETRY.tickCount - 1;
    const tickStep = Math.max(
        1,
        Math.ceil(Math.max(...graphData.map((category) => category.value), 1) / tickIntervals),
    );
    const scaleMaximum = tickStep * tickIntervals;
    const chartHeight = graphData.length * PRODUCT_CHART_GEOMETRY.rowHeight + PRODUCT_CHART_GEOMETRY.chartHeightPadding;

    return (
        <svg
            className="admin-reporting-chart"
            viewBox={`0 0 ${PRODUCT_CHART_GEOMETRY.viewBoxWidth} ${chartHeight}`}
            role="img"
            aria-labelledby="product-chart-title product-chart-description"
        >
            <title id="product-chart-title">Created products by fare type</title>
            <desc id="product-chart-description">
                {graphData.map((category) => `${category.title}: ${category.value}`).join(', ')}
            </desc>
            {Array.from({ length: PRODUCT_CHART_GEOMETRY.tickCount }, (_, index) => {
                const position =
                    PRODUCT_CHART_GEOMETRY.plotStartX + (index / tickIntervals) * PRODUCT_CHART_GEOMETRY.plotWidth;

                return (
                    <g key={index}>
                        <line
                            className="admin-reporting-chart__grid"
                            x1={position}
                            x2={position}
                            y1={PRODUCT_CHART_GEOMETRY.gridTop}
                            y2={chartHeight - PRODUCT_CHART_GEOMETRY.gridBottomPadding}
                        />
                        <text
                            className="admin-reporting-chart__tick"
                            x={position}
                            y={PRODUCT_CHART_GEOMETRY.tickLabelY}
                            textAnchor="middle"
                        >
                            {index * tickStep}
                        </text>
                    </g>
                );
            })}
            {graphData.map((category, index) => {
                const position = PRODUCT_CHART_GEOMETRY.rowStartY + index * PRODUCT_CHART_GEOMETRY.rowHeight;
                const barWidth = (category.value / scaleMaximum) * PRODUCT_CHART_GEOMETRY.plotWidth;

                return (
                    <g key={category.title}>
                        <title>{`${category.title}: ${category.value} products`}</title>
                        <text
                            x={PRODUCT_CHART_GEOMETRY.categoryLabelX}
                            y={position + PRODUCT_CHART_GEOMETRY.rowTextOffsetY}
                            textAnchor="end"
                        >
                            {category.title}
                        </text>
                        <rect
                            x={PRODUCT_CHART_GEOMETRY.plotStartX}
                            y={position}
                            width={barWidth}
                            height={PRODUCT_CHART_GEOMETRY.barHeight}
                            fill={category.color}
                        />
                        <text
                            x={PRODUCT_CHART_GEOMETRY.plotStartX + PRODUCT_CHART_GEOMETRY.valueLabelGap + barWidth}
                            y={position + PRODUCT_CHART_GEOMETRY.rowTextOffsetY}
                        >
                            {category.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

const CsvDownloadLink = ({
    filename,
    data,
    children,
}: {
    filename: string;
    data: string[][];
    children: ReactElement | string;
}): ReactElement => (
    <a download={filename} href={`data:text/csv;charset=utf-8,${encodeURIComponent(Papa.unparse(data))}`}>
        {children}
    </a>
);

const NocListDetail = ({
    summary,
    nocs,
    filename,
}: {
    summary: string;
    nocs: string[];
    filename: string;
}): ReactElement => {
    if (nocs.length === 0) {
        return <span>{summary}</span>;
    }

    return (
        <details className="govuk-details">
            <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">{summary}</span>
            </summary>
            <div className="govuk-details__text">
                <p className="govuk-body">
                    <CsvDownloadLink filename={filename} data={mapIntoArrayOfArrays(nocs)}>
                        Download as csv
                    </CsvDownloadLink>
                </p>
                {nocs.join(', ')}
            </div>
        </details>
    );
};

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
                    <p className="govuk-body">Hover over bars to see fare type and count</p>
                    <ProductChart graphData={graphData} />
                    <p className="govuk-body">
                        <CsvDownloadLink filename="createdProducts.csv" data={formatGraphDataForCsv(graphData)}>
                            Download as csv
                        </CsvDownloadLink>
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
            !user.email.toLowerCase().endsWith('@kainos.com') &&
            !user.email.toLowerCase().endsWith('@dft.gov.uk'),
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
