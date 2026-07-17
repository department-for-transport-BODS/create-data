import { NextApiResponse } from 'next';
import { getCaps, insertCaps, updateCaps } from '../../data/auroradb';
import { CREATE_CAPS_ATTRIBUTE } from '../../constants/attributes';
import { Cap, ErrorInfo, NextApiRequestWithSession } from '../../interfaces/index';
import { CapExpiryUnit, FromDb } from '../../interfaces/matchingJsonTypes';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils';
import {
    checkDurationIsValid,
    checkPriceIsValid,
    checkProductOrCapNameIsValid,
    isValidInputDuration,
    removeExcessWhiteSpace,
} from '../../utils/apiUtils/validator';
import { updateSessionAttribute } from '../../utils/sessions';

export interface InputtedCap {
    name: string | undefined;
    price: string | undefined;
    durationAmount: string | undefined;
    durationUnits: string | undefined;
}

export const validateAndFormatCapInputs = (inputtedCap: InputtedCap): { errors: ErrorInfo[]; createdCap: Cap } => {
    const errors: ErrorInfo[] = [];

    const trimmedCapName = removeExcessWhiteSpace(inputtedCap.name);
    const capNameError = checkProductOrCapNameIsValid(trimmedCapName, 'cap');

    if (capNameError) {
        errors.push({ errorMessage: capNameError, id: 'cap-name' });
    }

    const trimmedCapPrice = removeExcessWhiteSpace(inputtedCap.price);
    const capPriceError = checkPriceIsValid(trimmedCapPrice, 'cap');

    if (capPriceError) {
        errors.push({ errorMessage: capPriceError, id: 'cap-price' });
    }

    const trimmedCapDurationAmount = removeExcessWhiteSpace(inputtedCap.durationAmount);
    const capDurationAmountError = checkDurationIsValid(trimmedCapDurationAmount, 'cap');

    if (capDurationAmountError) {
        errors.push({ errorMessage: capDurationAmountError, id: 'cap-period-duration-quantity' });
    }

    const capDurationUnitsError = !isValidInputDuration(inputtedCap.durationUnits as string, false)
        ? 'Choose an option from the dropdown'
        : '';

    if (capDurationUnitsError) {
        errors.push({ errorMessage: capDurationUnitsError, id: 'cap-duration-unit' });
    }

    const cap = {
        name: trimmedCapName,
        price: trimmedCapPrice,
        durationAmount: trimmedCapDurationAmount,
        durationUnits: (inputtedCap.durationUnits as CapExpiryUnit) || '',
    };

    const createdCap: Cap = {
        capDetails: cap,
    };

    return {
        errors,
        createdCap,
    };
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const noc = getAndValidateNoc(req, res);
        const { capName, capPrice, capDuration, capDurationUnits } = req.body;
        const id = req.body.id && Number(req.body.id);

        const inputtedCap: InputtedCap = {
            name: capName,
            price: capPrice,
            durationAmount: capDuration,
            durationUnits: capDurationUnits,
        };

        const { createdCap, errors } = validateAndFormatCapInputs(inputtedCap);

        if (id && !Number.isInteger(id)) {
            throw Error(`Received invalid id for create caps ${id}`);
        }

        if (errors.length === 0) {
            const caps: FromDb<Cap>[] = await getCaps(noc);

            if (
                caps.some(
                    (cap) =>
                        cap.id !== id && cap.capDetails.name.toLowerCase() === createdCap.capDetails.name.toLowerCase(),
                )
            ) {
                errors.push({
                    errorMessage: `You already have a cap named ${capName}. Choose another name.`,
                    id: 'cap-name',
                });
            }
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, CREATE_CAPS_ATTRIBUTE, { errors, ...createdCap });
            redirectTo(res, `/createCaps${id ? `?id=${id}` : ''}`);
            return;
        }

        updateSessionAttribute(req, CREATE_CAPS_ATTRIBUTE, undefined);

        if (id) {
            await updateCaps(noc, id, createdCap);
        } else {
            await insertCaps(noc, createdCap);
        }

        redirectTo(res, '/viewCaps');
        return;
    } catch (error) {
        const message = 'There was a problem in the create caps API:';
        redirectToError(res, message, 'api.createCaps', error);
    }
};
