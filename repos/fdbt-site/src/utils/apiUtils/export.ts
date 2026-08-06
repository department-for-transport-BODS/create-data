import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { ExportLambdaBody, ZipperLambdaBody } from '../../interfaces/integrationTypes';
import { getProductStatus } from '../../pages/products/services';
import { DbProduct } from '../../interfaces/dbTypes';

const lambda = new LambdaClient({ region: 'eu-west-2' });

export const triggerExport = async (params: ExportLambdaBody): Promise<void> => {
    if (process.env.STAGE !== 'dev') {
        await lambda.send(
            new InvokeCommand({
                FunctionName: `exporter-${process.env.STAGE}`,
                Payload: Buffer.from(JSON.stringify(params)),
                InvocationType: 'Event',
            }),
        );
    }
};

export const triggerZipper = async (params: ZipperLambdaBody): Promise<void> => {
    if (process.env.STAGE !== 'dev') {
        await lambda.send(
            new InvokeCommand({
                FunctionName: `zipper-${process.env.STAGE}`,
                Payload: Buffer.from(JSON.stringify(params)),
                InvocationType: 'Event',
            }),
        );
    }
};

/**
 * Filters out expired product and returns only the non-expired products.
 *
 * @param products the unfiltered products list
 *
 * @returns only non-expired products are an array.
 */
export const getActiveOrPendingProducts = (products: DbProduct[]): DbProduct[] => {
    return products.filter((product) => {
        const status = getProductStatus(product.incomplete, product.startDate, product.endDate);
        return status === 'active' || status === 'pending';
    });
};
