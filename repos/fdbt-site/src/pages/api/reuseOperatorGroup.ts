import { NextApiResponse } from 'next';
import { getAndValidateNoc, isSchemeOperator, redirectTo, redirectToError } from '../../utils/apiUtils/index';
import { getOperatorGroupByNocAndId } from '../../data/auroradb';
import {
    FARE_TYPE_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE,
    REUSE_OPERATOR_GROUP_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../constants/attributes';
import { NextApiRequestWithSession, TicketRepresentationAttribute, FareType } from '../../interfaces';
import { updateSessionAttribute, getSessionAttribute } from '../../utils/sessions';
import { putUserDataInProductsBucketWithFilePath } from '../../utils/apiUtils/userData';
import { AdditionalOperator } from '../../interfaces/matchingJsonTypes';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const operatorGroupId = Number(req.body.operatorGroupId);
        const noc = getAndValidateNoc(req, res);

        if (!operatorGroupId) {
            updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
                errors: [{ errorMessage: 'Choose an operator group from the options below', id: 'operatorGroup' }],
            });
            redirectTo(res, '/reuseOperatorGroup');
            return;
        }

        const multipleOperators = await getOperatorGroupByNocAndId(operatorGroupId, noc);

        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);
        const fareType = (getSessionAttribute(req, FARE_TYPE_ATTRIBUTE) as FareType | undefined)?.fareType;

        if (multipleOperators) {
            if (fareType === 'multiOperatorExt') {
                const multiOperatorsData: AdditionalOperator[] = multipleOperators.operators.map((operator) => ({
                    nocCode: operator.nocCode,
                    selectedServices: [],
                }));
                updateSessionAttribute(req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE, multiOperatorsData);
            }

            if (ticket && matchingJsonMetaData) {
                // edit mode
                const updatedTicket = {
                    ...ticket,
                    additionalNocs: multipleOperators.operators.map((operator) => operator.nocCode),
                };

                // put the now updated matching json into s3
                // overriding the existing object
                await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonMetaData.matchingJsonLink);

                updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, undefined);

                redirectTo(res, `/products/productDetails?productId=${matchingJsonMetaData?.productId}`);
                return;
            }
            updateSessionAttribute(req, MULTIPLE_OPERATOR_ATTRIBUTE, {
                selectedOperators: multipleOperators.operators,
                id: multipleOperators.id,
            });
            updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, { operatorGroupId });
        } else {
            updateSessionAttribute(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
                errors: [{ errorMessage: 'Select a valid operator group', id: 'operatorGroup' }],
            });
            redirectTo(res, '/reuseOperatorGroup');
            return;
        }

        if (isSchemeOperator(req, res) && fareType === 'flatFare') {
            redirectTo(res, '/multiOperatorServiceList');
            return;
        }
        const ticketRepresentation = (
            getSessionAttribute(req, TICKET_REPRESENTATION_ATTRIBUTE) as TicketRepresentationAttribute
        ).name;
        redirectTo(
            res,
            (ticketRepresentation === 'multipleServices' ||
                ticketRepresentation === 'multipleServicesFlatFareMultiOperator') &&
                fareType !== 'multiOperatorExt'
                ? '/multiOperatorServiceList'
                : '/multipleProducts',
        );
        return;
    } catch (error) {
        const message = 'There was a problem with the user selecting their premade operator group:';
        redirectToError(res, message, 'api.reuseOperatorGroup', error);
    }
};
