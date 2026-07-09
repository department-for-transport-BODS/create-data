import { NextApiResponse } from 'next';
import {
    CAPS_DEFINITION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../../constants/attributes';
import { getCapByNocAndId } from '../../data/auroradb';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils/index';
import { Cap, NextApiRequestWithSession } from '../../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { putUserDataInProductsBucketWithFilePath } from '../../utils/apiUtils/userData';

const getCapContent = async (cap: number, noc: string): Promise<Cap & { id: number }> => {
    const result = await getCapByNocAndId(noc, cap);

    if (!result) {
        throw new Error('No premade caps saved under the provided name');
    }

    return result;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { capChoice, caps } = req.body;
        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);

        if (!capChoice) {
            const errors = {
                errors: [{ errorMessage: 'Choose one of the options below', id: 'no-caps' }],
            };

            updateSessionAttribute(req, CAPS_DEFINITION_ATTRIBUTE, errors);
            redirectTo(res, '/selectCaps');
            return;
        }

        if (capChoice === 'no' && !(ticket && matchingJsonMetaData)) {
            updateSessionAttribute(req, CAPS_DEFINITION_ATTRIBUTE, undefined);
            redirectTo(res, '/selectPurchaseMethods');
            return;
        }

        const noc = getAndValidateNoc(req, res);

        if (capChoice === 'yes' && !caps) {
            const errors = {
                errors: [{ errorMessage: 'Choose one of the premade caps', id: 'caps' }],
            };

            updateSessionAttribute(req, CAPS_DEFINITION_ATTRIBUTE, errors);
            redirectTo(res, '/selectCaps');
            return;
        }

        let capData = caps;
        if (caps && !Array.isArray(caps)) {
            capData = [caps];
        }
        if (Array.isArray(capData) && !capData.every((c) => Number.isInteger(Number(c)))) {
            throw Error(`Received invalid caps: ${caps}`);
        }

        const selectedCaps = await Promise.all((capData as number[]).map(async (c) => await getCapContent(c, noc)));

        // if in edit mode
        if (ticket && matchingJsonMetaData) {
            const updatedTicket = {
                ...ticket,
                caps:
                    capChoice === 'yes' && !!selectedCaps && selectedCaps.length > 0
                        ? selectedCaps.map((cap) => ({ id: cap.id }))
                        : undefined,
            };

            await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonMetaData.matchingJsonLink);
            updateSessionAttribute(req, CAPS_DEFINITION_ATTRIBUTE, undefined);

            redirectTo(
                res,
                `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                    matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
                }`,
            );
            return;
        }
        // end of edit mode

        if (capChoice === 'yes' && !!selectedCaps && selectedCaps.length > 0) {
            updateSessionAttribute(
                req,
                CAPS_DEFINITION_ATTRIBUTE,
                selectedCaps.map((cap) => ({ id: cap.id })),
            );
            redirectTo(res, '/selectPurchaseMethods');
            return;
        }
    } catch (error) {
        const message = 'There was a problem in the selectCaps API.';
        redirectToError(res, message, 'api.selectCaps', error);
    }
};
