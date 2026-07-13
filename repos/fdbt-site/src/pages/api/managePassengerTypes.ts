import isArray from 'lodash/isArray';
import { NextApiResponse } from 'next';
import { MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE } from '../../constants/attributes';
import {
    getSinglePassengerTypeByNameAndNocCode,
    insertSinglePassengerType,
    updateSinglePassengerType,
} from '../../data/auroradb';
import { ErrorInfo, ManagePassengerTypeWithErrors, NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils';
import {
    checkIntegerIsValid,
    invalidCharactersArePresent,
    removeExcessWhiteSpace,
} from '../../utils/apiUtils/validator';
import { SinglePassengerType } from '../../interfaces/dbTypes';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const nationalOperatorCode = getAndValidateNoc(req, res);

        const [isEditMode, singlePassengerType, errors] = await formatRequestBody(req, nationalOperatorCode);

        if (errors.length) {
            const sessionInfo: ManagePassengerTypeWithErrors = {
                errors,
                inputs: singlePassengerType,
            };

            updateSessionAttribute(req, MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE, sessionInfo);

            const location = isEditMode
                ? `/managePassengerTypes?id=${singlePassengerType.id}`
                : '/managePassengerTypes';

            redirectTo(res, location);

            return;
        }

        updateSessionAttribute(req, MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE, undefined);

        if (isEditMode) {
            await updateSinglePassengerType(nationalOperatorCode, singlePassengerType);
        } else {
            await insertSinglePassengerType(
                nationalOperatorCode,
                singlePassengerType.passengerType,
                singlePassengerType.name,
            );
        }

        redirectTo(res, '/viewPassengerTypes');
    } catch (error) {
        const message = 'There was a problem in the managePassengerTypes API.';

        redirectToError(res, message, 'api.managePassengerTypes', error);
    }
};

const formatRequestBody = async (
    req: NextApiRequestWithSession,
    nationalOperatorCode: string,
): Promise<[boolean, SinglePassengerType, ErrorInfo[]]> => {
    const errors: ErrorInfo[] = [];
    const id = req.body.id && Number(req.body.id);
    const name = req.body.name;
    const type = req.body.type;
    const ageRangeMin = req.body.ageRangeMin;
    const ageRangeMax = req.body.ageRangeMax;
    const proofDocuments = isArray(req.body.proofDocuments)
        ? req.body.proofDocuments
        : req.body.proofDocuments
          ? [req.body.proofDocuments]
          : undefined;

    if (typeof name !== 'string' || typeof ageRangeMin !== 'string' || typeof ageRangeMax !== 'string') {
        throw Error('one of the parameters is not a string!');
    }

    if (typeof type !== 'string' || !type) {
        errors.push({ id: 'type', errorMessage: 'You must select a passenger type' });
    }

    const isInEditMode = id && Number.isInteger(id);

    const trimmedName = removeExcessWhiteSpace(name);

    const nameHasInvalidCharacters = invalidCharactersArePresent(trimmedName);

    if (nameHasInvalidCharacters) {
        errors.push({ id: 'name', errorMessage: 'Passenger type name has an invalid character' });
    }

    const ageRangeMinHasInvalidCharacters = invalidCharactersArePresent(ageRangeMin);

    if (ageRangeMinHasInvalidCharacters) {
        errors.push({ id: 'age-range-min', errorMessage: 'Minimum age has an invalid character' });
    }

    const ageRangeMaxHasInvalidCharacters = invalidCharactersArePresent(ageRangeMax);

    if (ageRangeMaxHasInvalidCharacters) {
        errors.push({ id: 'age-range-max', errorMessage: 'Maximum age has an invalid character' });
    }

    const passengerType: SinglePassengerType = {
        id,
        name: trimmedName,
        passengerType: {
            id,
            passengerType: type,
            ageRangeMin: ageRangeMin,
            ageRangeMax: ageRangeMax,
            proofDocuments: proofDocuments,
        },
    };

    if (trimmedName.length < 1) {
        errors.push({ id: 'name', errorMessage: 'Name must be provided' });
    }

    if (trimmedName.length >= 50) {
        errors.push({ id: 'name', errorMessage: 'Name must be 50 characters or under' });
    }

    const invalidAgeRangeMin = ageRangeMin && checkIntegerIsValid(ageRangeMin, 'Age', 0, 150);

    if (invalidAgeRangeMin) {
        errors.push({ id: 'age-range-min', errorMessage: invalidAgeRangeMin });
    }

    const invalidAgeRangeMax = ageRangeMax && checkIntegerIsValid(ageRangeMax, 'Age', 0, 150);

    if (invalidAgeRangeMax) {
        errors.push({ id: 'age-range-max', errorMessage: invalidAgeRangeMax });
    }

    if (Number.parseInt(ageRangeMin) > Number.parseInt(ageRangeMax)) {
        errors.push({ id: 'age-range-min', errorMessage: 'Minimum age cannot be greater than maximum age' });
    }

    const singlePassengerType = await getSinglePassengerTypeByNameAndNocCode(nationalOperatorCode, trimmedName, false);

    if (singlePassengerType !== undefined) {
        if (id !== singlePassengerType.id) {
            errors.push({ id: 'name', errorMessage: `${trimmedName} already exists as a passenger type` });
        }
    }

    return [isInEditMode, passengerType, errors];
};
