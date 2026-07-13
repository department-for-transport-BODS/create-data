import { NextApiResponse } from 'next';
import { redirectToError, redirectTo, getAndValidateNoc } from '../../utils/apiUtils';
import { NextApiRequestWithSession } from '../../interfaces';
import { insertDataToProductsBucketAndProductsTable } from '../../utils/apiUtils/userData';
import { getProductById, getProductIdByMatchingJsonLink } from '../../data/auroradb';
import { getProductsMatchingJson } from '../../data/s3';
import { buildUuid } from '../fareType';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const productId = Number(req.query.id);
        const serviceId = req.query.serviceId;

        if (!Number.isInteger(productId) || (serviceId && typeof serviceId !== 'string')) {
            throw new Error('Service id or product id is invalid.');
        }

        const noc = getAndValidateNoc(req, res);
        const { matchingJsonLink } = await getProductById(noc, productId.toString());
        const ticket = await getProductsMatchingJson(matchingJsonLink);
        const uuid = buildUuid(noc);

        const newJsonLink = await insertDataToProductsBucketAndProductsTable(ticket, noc, uuid, {
            req,
            res,
        });

        const newProductId = await getProductIdByMatchingJsonLink(noc, newJsonLink);

        redirectTo(
            res,
            `/products/productDetails?productId=${newProductId}&copied=true${
                serviceId ? `&serviceId=${serviceId}` : ''
            }`,
        );
    } catch (error) {
        redirectToError(res, 'There was a problem copying the selected product', 'api.copyProduct', error);
    }
};
