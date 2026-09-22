import { _Object } from '@aws-sdk/client-s3';

export interface FareTypeCount {
    single: number;
    return: number;
    flatFare: number;
    period: number;
    multiOperator: number;
    multiOperatorExt: number;
}

export interface GraphData {
    title: string;
    value: number;
    color: string;
}

export const mapIntoArrayOfArrays = (input: string[]): string[][] => input.map((item) => [item]);

export const dateIsWithinNumberOfDays = (date: Date, numberOfDays: number): boolean => {
    const msBetweenDates = Math.abs(date.getTime() - new Date().getTime());
    const daysBetweenDates = msBetweenDates / (24 * 60 * 60 * 1000);

    return daysBetweenDates < numberOfDays;
};

const netexFileMatchesNoc = (fileName: string, noc: string): boolean => fileName.split('/exports/')[0] === noc;

export const netexFilesGenerated = (activeNocs: string[], netexFiles: _Object[], timeframe: 30 | 365): string[] =>
    activeNocs.filter((noc) =>
        netexFiles.some(
            (file) =>
                file.Key &&
                file.LastModified &&
                netexFileMatchesNoc(file.Key, noc) &&
                dateIsWithinNumberOfDays(file.LastModified, timeframe),
        ),
    );

const productMatchesNoc = (fileName: string, noc: string): boolean => fileName.split('/')[0] === noc;

export const productsCreated = (activeNocs: string[], products: _Object[]): string[] =>
    activeNocs.filter((noc) => products.some((file) => file.Key && productMatchesNoc(file.Key, noc)));

// SYRK is used for testing, so is discounted from the reported product counts
const NOCS_TO_IGNORE_IN_PRODUCT_COUNTS = ['IWBusCo', 'SYRK'];

export const typesOfProductsCreated = (products: _Object[]): FareTypeCount => {
    const count: FareTypeCount = {
        single: 0,
        return: 0,
        flatFare: 0,
        period: 0,
        multiOperator: 0,
        multiOperatorExt: 0,
    };

    products.forEach((product) => {
        const productPath = product.Key ?? '';

        if (NOCS_TO_IGNORE_IN_PRODUCT_COUNTS.some((noc) => productPath.includes(noc))) {
            return;
        }

        const fareTypePart = productPath.split('/')[1] as keyof FareTypeCount | undefined;

        if (fareTypePart && fareTypePart in count) {
            count[fareTypePart] += 1;
        }
    });

    return count;
};

const GRAPH_COLOURS = ['#196f3d', '#a93226', '#1f618d', '#2e4053', '#d35400', '#7d3c98'];

export const createGraphData = (fareTypeCount: FareTypeCount): GraphData[] =>
    (Object.keys(fareTypeCount) as (keyof FareTypeCount)[]).map((fareType, index) => ({
        title: fareType,
        value: fareTypeCount[fareType],
        color: GRAPH_COLOURS[index % GRAPH_COLOURS.length],
    }));

export const getProductCount = (graphData: GraphData[]): number => graphData.reduce((sum, data) => sum + data.value, 0);

export const formatGraphDataForCsv = (graphData: GraphData[]): string[][] => [
    ['Faretype', 'Count'],
    ...graphData.map((data) => [data.title, data.value.toString()]),
];

export const buildCsvDownloadHref = (rows: string[][]): string =>
    `data:text/csv;charset=utf-8,${encodeURIComponent(rows.map((row) => row.join(',')).join('\n'))}`;
