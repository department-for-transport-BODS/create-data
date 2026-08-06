import { NextApiResponse } from 'next';
import {
    deleteOperatorGroupByNocCodeAndId,
    getAllProductsByNoc,
    getOperatorGroupByNocAndId,
} from '../../data/auroradb';
import { redirectToError, redirectTo, getAndValidateNoc } from '../../utils/apiUtils/index';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { getProductsMatchingJson } from '../../data/s3';
import { updateSessionAttribute } from '../../utils/sessions';
import { VIEW_OPERATOR_GROUP_ERRORS } from '../../constants/attributes';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { query } = req;
        const id = Number(query?.id);

        if (!Number.isInteger(id)) {
            throw new Error('insufficient data provided for delete query');
        }
        const nocCode = getAndValidateNoc(req, res);

        const products = await getAllProductsByNoc(nocCode);
        const matchingJsonLinks = products.map((product) => product.matchingJsonLink);

        const tickets = await Promise.all(
            matchingJsonLinks.map(async (link) => {
                return await getProductsMatchingJson(link);
            }),
        );

        const ticketsWithOperatorGroup = tickets.filter(
            (ticket) => 'operatorGroupId' in ticket && ticket.operatorGroupId === id,
        );
        const productNames = ticketsWithOperatorGroup
            .map((ticket) =>
                ticket.products[0]
                    ? 'productName' in ticket.products[0]
                        ? ticket.products[0].productName
                        : 'missing'
                    : '',
            )
            .filter((product) => product !== 'missing');

        if (ticketsWithOperatorGroup && ticketsWithOperatorGroup.length > 0) {
            const operatorGroup = await getOperatorGroupByNocAndId(id, nocCode);

            const name = operatorGroup ? operatorGroup.name : '';
            const errorMessage = `You cannot delete ${name} operator group because ${
                productNames.length > 0
                    ? `it is part of the following product(s): ${productNames?.join(', ')}.`
                    : 'it is used in a product(s).'
            } `;
            const errors: ErrorInfo[] = [{ id: '/viewOperatorGroups', errorMessage }];

            updateSessionAttribute(req, VIEW_OPERATOR_GROUP_ERRORS, errors);
            redirectTo(res, `/viewOperatorGroups`);
            return;
        }

        await deleteOperatorGroupByNocCodeAndId(id, nocCode);

        redirectTo(res, '/viewOperatorGroups');
    } catch (error) {
        const message = 'There was a problem deleting the selected operator group:';

        redirectToError(res, message, 'api.deleteOperatorGroup', error as Error);
    }
};
