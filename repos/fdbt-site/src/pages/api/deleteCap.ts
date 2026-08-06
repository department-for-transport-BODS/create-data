import { NextApiResponse } from 'next';
import { deleteCap, getAllProductsByNoc, getCapByNocAndId } from '../../data/auroradb';
import { redirectToError, redirectTo, getAndValidateNoc } from '../../utils/apiUtils/index';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { getProductsMatchingJson } from '../../data/s3';
import { updateSessionAttribute } from '../../utils/sessions';
import { VIEW_CAP_ERRORS } from '../../constants/attributes';
import { TicketWithIds } from '../../interfaces/matchingJsonTypes';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { query } = req;

        const id = Number(query?.id);

        if (!Number.isInteger(id)) {
            throw new Error('Insufficient data provided for delete query');
        }

        const noc = getAndValidateNoc(req, res);
        const cap = await getCapByNocAndId(noc, id);

        if (!cap) {
            throw new Error('Unable to find cap with provided id');
        }

        const products = await getAllProductsByNoc(noc);
        const matchingJsonLinks = products.map((product) => product.matchingJsonLink);
        const tickets: TicketWithIds[] = await Promise.all(
            matchingJsonLinks.map(async (link) => {
                return await getProductsMatchingJson(link);
            }),
        );

        const productsUsingCap = tickets.filter(
            (ticket) => 'caps' in ticket && ticket.caps && ticket.caps.filter((c) => c.id === id),
        );

        if (productsUsingCap.length > 0) {
            const { name } = cap.capDetails;
            const errorMessage = `You cannot delete ${name} because it is being used in ${productsUsingCap.length} ticket(s).`;
            const errors: ErrorInfo[] = [{ id: 'cap-0', errorMessage }];
            updateSessionAttribute(req, VIEW_CAP_ERRORS, errors);
            redirectTo(res, `/viewCaps`);
            return;
        }

        await deleteCap(id, noc);

        redirectTo(res, '/viewCaps');
        return;
    } catch (error) {
        const message = 'There was a problem deleting the cap';
        redirectToError(res, message, 'api.deleteCap', error);
    }
};
