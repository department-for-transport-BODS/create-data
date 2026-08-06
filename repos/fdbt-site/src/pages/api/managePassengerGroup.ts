import isArray from 'lodash/isArray';
import { NextApiResponse } from 'next';
import { updateGroupPassengerType } from '../../data/auroradb';
import { GS_PASSENGER_GROUP_ATTRIBUTE } from '../../constants/attributes';
import { getGroupPassengerTypesFromGlobalSettings, insertGroupPassengerType } from '../../data/auroradb';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { updateSessionAttribute } from '../../utils/sessions';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils';
import {
    checkPassengerCountLimits,
    invalidCharactersArePresent,
    removeExcessWhiteSpace,
} from '../../utils/apiUtils/validator';
import logger from '../../utils/logger';
import { GroupPassengerTypeDb, CompanionReference } from '../../interfaces/dbTypes';

export const formatRequestBody = (req: NextApiRequestWithSession): GroupPassengerTypeDb => {
    const id = req.body.groupId && Number(req.body.groupId);

    if (id && !Number.isInteger(id)) {
        throw Error(`Received invalid id for passenger group [${req.body.groupId}]`);
    }

    const maxGroupSize = removeExcessWhiteSpace(req.body.maxGroupSize);
    const groupName = removeExcessWhiteSpace(req.body.passengerGroupName);

    const passengerTypeIds: string[] = !req.body.passengerTypes
        ? []
        : isArray(req.body.passengerTypes)
          ? req.body.passengerTypes
          : [req.body.passengerTypes];

    const companions: CompanionReference[] = passengerTypeIds.map((passengerTypeId) => {
        const name = req.body[`passengerType${passengerTypeId}`];
        const minNumber = req.body[`minimumPassengers${passengerTypeId}`];
        const maxNumber = req.body[`maximumPassengers${passengerTypeId}`];
        const id = Number(passengerTypeId);
        if (!Number.isInteger(id) || id < 1) {
            throw Error(`Received invalid id in passenger group [${passengerTypeId}]`);
        }

        return {
            id,
            name,
            minNumber,
            maxNumber,
        };
    });

    return {
        id,
        name: groupName,
        groupPassengerType: { name: groupName, maxGroupSize, companions },
    };
};

export const collectErrors = async (userInput: GroupPassengerTypeDb, nocCode: string): Promise<ErrorInfo[]> => {
    const errors: ErrorInfo[] = [];
    const integerCheck = checkPassengerCountLimits(
        userInput.groupPassengerType.maxGroupSize,
        'Maximum group size',
        1,
        30,
    );
    const editMode = !!userInput.id;
    const groupName = userInput.name;

    if (integerCheck) {
        errors.push({
            errorMessage: integerCheck,
            id: 'max-group-size',
            userInput: userInput.groupPassengerType.maxGroupSize || '',
        });
    }
    if (!userInput.groupPassengerType.companions?.length) {
        errors.push({
            errorMessage: 'Select at least one passenger type',
            id: 'passenger-type-0',
        });
    }

    if (
        userInput.groupPassengerType.companions &&
        userInput.groupPassengerType.companions.length &&
        userInput.groupPassengerType.maxGroupSize
    ) {
        userInput.groupPassengerType.companions.forEach((companion) => {
            if (companion.minNumber) {
                const minCheck = checkPassengerCountLimits(
                    companion.minNumber,
                    `Minimum amount of ${companion.name}`,
                    1,
                    Number(userInput.groupPassengerType.maxGroupSize),
                );
                if (minCheck) {
                    errors.push({
                        errorMessage: minCheck,
                        id: `minimum-passengers-${companion.id}`,
                        userInput: companion.minNumber || '',
                    });
                }

                const minNumberHasInvalidCharacters = invalidCharactersArePresent(companion.minNumber);

                if (minNumberHasInvalidCharacters) {
                    errors.push({
                        id: `minimum-passengers-${companion.id}`,
                        errorMessage: `Minimum value ${companion.name} has an invalid character`,
                    });
                }
            }

            if (!companion.maxNumber) {
                errors.push({
                    errorMessage: `Maximum amount of ${companion.name} passengers is required`,
                    id: `maximum-passengers-${companion.id}`,
                });
            } else {
                const maxCheck = checkPassengerCountLimits(
                    companion.maxNumber,
                    `Maximum amount of ${companion.name}`,
                    1,
                    Number(userInput.groupPassengerType.maxGroupSize),
                );
                if (maxCheck) {
                    errors.push({
                        errorMessage: maxCheck,
                        id: `maximum-passengers-${companion.id}`,
                        userInput: companion.maxNumber || '',
                    });
                }
                if (companion.minNumber && Number(companion.minNumber) > Number(companion.maxNumber)) {
                    errors.push({
                        errorMessage: `Minimum amount of passengers for ${companion.name} cannot be greater than maximum amount`,
                        id: `minumum-passengers-${companion.id}`,
                        userInput: companion.minNumber || '',
                    });
                }

                const maxNumberHasInvalidCharacters = invalidCharactersArePresent(companion.maxNumber);

                if (maxNumberHasInvalidCharacters) {
                    errors.push({
                        id: `maximum-passengers-${companion.id}`,
                        errorMessage: 'Maximum value has an invalid character',
                    });
                }
            }
        });
    }

    const groups = await getGroupPassengerTypesFromGlobalSettings(nocCode);
    const groupNameCheck = groups.find((group) => group.name === groupName);

    // checks to see if the duplicate name exists
    // OR
    // editMode is on and there is only one group with the same name, and it is the one being edited
    if ((groupNameCheck && !editMode) || (editMode && groupNameCheck && groupNameCheck.id !== userInput.id)) {
        errors.push({
            errorMessage: 'There is already a group with this name. Choose another',
            id: 'passenger-group-name',
            userInput: groupName,
        });
        return errors;
    }

    if (!groupName || groupName.length > 50 || groupName.length < 1) {
        errors.push({
            errorMessage: 'Enter a group name of up to 50 characters',
            id: 'passenger-group-name',
            userInput: groupName || '',
        });
    }

    const nameHasInvalidCharacters = invalidCharactersArePresent(groupName);

    if (nameHasInvalidCharacters) {
        errors.push({ id: 'passenger-group-name', errorMessage: 'Passenger group name has an invalid character' });
    }

    return errors;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const formattedRequest = formatRequestBody(req);
        const noc = getAndValidateNoc(req, res);
        const errors: ErrorInfo[] = await collectErrors(formattedRequest, noc);

        if (errors.length) {
            updateSessionAttribute(req, GS_PASSENGER_GROUP_ATTRIBUTE, {
                errors,
                inputs: formattedRequest,
            });

            redirectTo(res, `/managePassengerGroup${formattedRequest.id ? `?id=${formattedRequest.id}` : ''}`);

            return;
        }

        updateSessionAttribute(req, GS_PASSENGER_GROUP_ATTRIBUTE, undefined);

        if (formattedRequest.id) {
            await updateGroupPassengerType(noc, formattedRequest);
        } else {
            await insertGroupPassengerType(noc, formattedRequest.groupPassengerType, formattedRequest.name);
        }

        redirectTo(res, '/viewPassengerTypes');

        return;
    } catch (error) {
        logger.error(error, {
            context: 'api.managePassengerGroup',
            message: 'failed when calling the managePassengerGroup api',
        });

        const message = 'There was a problem in the managePassengerGroup API.';

        redirectToError(res, message, 'api.managePassengerGroup', error);
    }
};
