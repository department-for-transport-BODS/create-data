import lowerCase from 'lodash/lowerCase';
import upperFirst from 'lodash/upperFirst';
import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getAndValidateNoc, checkEmailValid } from '../../utils/apiUtils';
import { updateSessionAttribute } from '../../utils/sessions';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { GS_OPERATOR_DETAILS_ATTRIBUTE } from '../../constants/attributes';
import { invalidCharactersArePresent, invalidUrlInput, removeExcessWhiteSpace } from '../../utils/apiUtils/validator';
import { upsertOperatorDetails } from '../../data/auroradb';
import { OperatorDetails } from '../../interfaces/matchingJsonTypes';

export const collectErrors = (operatorDetails: OperatorDetails): ErrorInfo[] => {
    const errors: ErrorInfo[] = Object.entries(operatorDetails)
        .filter((entry) => entry[1].length > 200)
        .map((entry) => ({
            id: entry[0],
            errorMessage: upperFirst(`${lowerCase(entry[0])} cannot exceed 200 characters`),
        }));

    Object.entries(operatorDetails)
        .filter((entry) => ['operatorName', 'street', 'town', 'postcode'].includes(entry[0]) && entry[1].length < 1)
        .forEach((entry) =>
            errors.push({ id: entry[0], errorMessage: upperFirst(`${lowerCase(entry[0])} is required`) }),
        );

    Object.entries(operatorDetails)
        .filter((entry) => !entry[0].includes('url'))
        .filter((entry) => {
            const inputValue = entry[1];
            const entryHasInvalidCharacters = invalidCharactersArePresent(inputValue);
            return entryHasInvalidCharacters;
        })
        .forEach((entry) =>
            errors.push({ id: entry[0], errorMessage: upperFirst(`${lowerCase(entry[0])} has an invalid character`) }),
        );

    if (
        Object.entries(operatorDetails).filter(
            (entry) => ['contactNumber', 'email', 'url'].includes(entry[0]) && entry[1].length > 0,
        ).length < 1
    ) {
        errors.push({ id: 'contactNumber', errorMessage: 'At least one of contact number, email or URL are required' });
    }

    if (operatorDetails.contactNumber && !/^[0-9+() ]+$/.exec(operatorDetails.contactNumber)) {
        errors.push({ id: 'contactNumber', errorMessage: 'Provide a valid phone number' });
    }

    if (operatorDetails.email && !checkEmailValid(operatorDetails.email)) {
        errors.push({ id: 'email', errorMessage: 'Provide a valid email' });
    }
    if (operatorDetails.url && invalidUrlInput(operatorDetails.url)) {
        errors.push({ id: 'url', errorMessage: 'Provide a valid URL' });
    }

    if (operatorDetails.postcode && !/^[a-zA-Z0-9]+ [a-zA-Z0-9]+$/.exec(operatorDetails.postcode)) {
        errors.push({ id: 'postcode', errorMessage: 'Provide a valid postcode' });
    }

    return errors;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { operatorName, contactNumber, email, url, street, town, county, postcode } = req.body;

        const trimmedOperatorDetails: OperatorDetails = {
            operatorName: removeExcessWhiteSpace(operatorName),
            contactNumber: removeExcessWhiteSpace(contactNumber),
            email: removeExcessWhiteSpace(email),
            url: removeExcessWhiteSpace(url),
            street: removeExcessWhiteSpace(street),
            town: removeExcessWhiteSpace(town),
            county: removeExcessWhiteSpace(county),
            postcode: removeExcessWhiteSpace(postcode),
        };

        const errors = collectErrors(trimmedOperatorDetails);

        if (errors.length > 0) {
            updateSessionAttribute(req, GS_OPERATOR_DETAILS_ATTRIBUTE, {
                input: trimmedOperatorDetails,
                errors: errors,
            });
        } else {
            const noc = getAndValidateNoc(req, res);
            await upsertOperatorDetails(noc, trimmedOperatorDetails);

            updateSessionAttribute(req, GS_OPERATOR_DETAILS_ATTRIBUTE, { saved: true });
        }

        redirectTo(res, `/manageOperatorDetails`);
    } catch (err) {
        const message = 'There was a problem in the manage operator details API.';
        redirectToError(res, message, 'api.manageOperatorDetails', err);
    }
};
