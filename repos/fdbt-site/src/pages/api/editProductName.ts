import { NextApiResponse } from 'next';
import { redirectToError, redirectTo } from '../../utils/apiUtils';
import { NextApiRequestWithSession } from '../../interfaces';
import { getSessionAttribute } from '../../utils/sessions';
import { MATCHING_JSON_ATTRIBUTE, MATCHING_JSON_META_DATA_ATTRIBUTE } from '../../constants/attributes';
import { putUserDataInProductsBucketWithFilePath } from '../../../src/utils/apiUtils/userData';
import { checkProductOrCapNameIsValid } from '../../../src/utils/apiUtils/validator';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const id = Number(req.query.id);
        const productName = req.query.productName;
        const serviceId = req.query.serviceId;

        if (serviceId && typeof serviceId !== 'string') {
            throw new Error('Service id passed is not a string.');
        }

        if (!Number.isInteger(id) || typeof productName !== 'string') {
            throw new Error('Insufficient data provided for edit product name query.');
        }

        if (checkProductOrCapNameIsValid(productName, 'product')) {
            throw new Error('User has inputted a product name too short, too long or with invalid characters.');
        }

        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const metaDataAttribute = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);

        if (!ticket || !metaDataAttribute) {
            throw new Error('Cannot delete product name as attributes not set.');
        }

        const { matchingJsonLink, productId } = metaDataAttribute;

        if (Number(productId) !== id) {
            throw new Error('Product id in request does not match product id in session.');
        }

        const updatedTicket = {
            ...ticket,
            products: [{ ...ticket.products[0], productName }],
        };

        await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonLink);
        redirectTo(res, `/products/productDetails?productId=${productId}${serviceId ? `&serviceId=${serviceId}` : ''}`);
    } catch (error) {
        redirectToError(res, 'There was a problem editing the selected product name', 'api.editProductName', error);
    }
};
