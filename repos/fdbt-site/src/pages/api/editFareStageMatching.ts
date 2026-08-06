import { NextApiResponse } from 'next';
import {
    getFareZonesEditTicket,
    getMatchingFareZonesAndUnassignedStopsFromForm,
    isAnyFareStageUnassigned,
} from '../../utils/apiUtils/matching';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
    DIRECTION_ATTRIBUTE,
} from '../../constants/attributes';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { redirectTo, redirectToError } from '../../utils/apiUtils';
import { putUserDataInProductsBucketWithFilePath } from '../../utils/apiUtils/userData';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { getFareStagesFromTicket } from '../editFareStageMatching';
import { ReturnTicket, SingleTicket, WithIds } from '../../interfaces/matchingJsonTypes';
import { isReturnTicket } from '../../utils';
import { MatchingFareZonesData } from '../../interfaces/matchingInterface';

const getSelectedFareStages = (matchingFareZones: MatchingFareZonesData[]): { [key: string]: string } => {
    const selectedFareStages: { [key: string]: string } = {};

    matchingFareZones.forEach((fareZone) => {
        fareZone.stops.forEach((stop) => {
            selectedFareStages[stop.atcoCode] = fareZone.name;
        });
    });
    return selectedFareStages;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE) as
            WithIds<SingleTicket> | WithIds<ReturnTicket> | undefined;
        const ticketMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);
        const { overrideWarning } = req.body;
        const directionAttribute = getSessionAttribute(req, DIRECTION_ATTRIBUTE);

        // edit mode
        if (!ticket || !ticketMetaData || !(ticket.type === 'single' || isReturnTicket(ticket))) {
            throw new Error('Ticket invalid or not found');
        }

        const parsedInputs = getMatchingFareZonesAndUnassignedStopsFromForm(req);

        const { matchingFareZones, unassignedStops } = parsedInputs;

        const userFareStages = getFareStagesFromTicket(ticket);

        if (isAnyFareStageUnassigned(userFareStages, matchingFareZones)) {
            const errors: ErrorInfo[] = [
                {
                    errorMessage: 'One or more fare stages have not been assigned, assign each fare stage to a stop',
                    id: 'option-0',
                },
            ];

            const selectedFareStages = getSelectedFareStages(Object.values(matchingFareZones));
            if (isReturnTicket(ticket)) {
                if (!overrideWarning) {
                    updateSessionAttribute(req, EDIT_FARE_STAGE_MATCHING_ATTRIBUTE, {
                        selectedFareStages,
                        warning: true,
                        errors: [],
                    });
                    redirectTo(res, '/editFareStageMatching');
                    return;
                }
            } else {
                updateSessionAttribute(req, EDIT_FARE_STAGE_MATCHING_ATTRIBUTE, {
                    selectedFareStages,
                    errors,
                    warning: false,
                });
                redirectTo(res, '/editFareStageMatching');
                return;
            }
        }

        if (ticket.type === 'single') {
            const formattedMatchingFareZones = getFareZonesEditTicket(
                userFareStages,
                matchingFareZones,
                ticket.fareZones,
            );

            const updatedTicket = {
                ...ticket,
                fareZones: formattedMatchingFareZones,
                unassignedStops: {
                    singleUnassignedStops: unassignedStops,
                },
            };
            await putUserDataInProductsBucketWithFilePath(updatedTicket, ticketMetaData.matchingJsonLink);
        } else {
            if (directionAttribute && 'direction' in directionAttribute && directionAttribute.direction === 'inbound') {
                const formattedMatchingFareZones = getFareZonesEditTicket(
                    userFareStages,
                    matchingFareZones,
                    ticket.inboundFareZones,
                );

                const updatedTicket = {
                    ...ticket,
                    inboundFareZones: formattedMatchingFareZones,
                    unassignedStops: {
                        inboundUnassignedStops: unassignedStops,
                    },
                };
                await putUserDataInProductsBucketWithFilePath(updatedTicket, ticketMetaData.matchingJsonLink);
            } else {
                const formattedMatchingFareZones = getFareZonesEditTicket(
                    userFareStages,
                    matchingFareZones,
                    ticket.outboundFareZones,
                );

                const updatedTicket: WithIds<ReturnTicket> = {
                    ...ticket,
                    outboundFareZones: formattedMatchingFareZones,
                    unassignedStops: {
                        outboundUnassignedStops: unassignedStops,
                    },
                };

                updateSessionAttribute(req, MATCHING_JSON_ATTRIBUTE, updatedTicket);
                updateSessionAttribute(req, DIRECTION_ATTRIBUTE, { direction: 'inbound' });
                updateSessionAttribute(req, EDIT_FARE_STAGE_MATCHING_ATTRIBUTE, undefined);
                redirectTo(res, '/editFareStageMatching');
                return;
            }
        }

        updateSessionAttribute(req, EDIT_FARE_STAGE_MATCHING_ATTRIBUTE, undefined);
        updateSessionAttribute(req, DIRECTION_ATTRIBUTE, undefined);

        redirectTo(
            res,
            `/products/productDetails?productId=${ticketMetaData?.productId}${
                ticketMetaData.serviceId ? `&serviceId=${ticketMetaData?.serviceId}` : ''
            }`,
        );
        return;
    } catch (error) {
        const message = 'There was a problem mapping the fare stage for edit ticket';
        redirectToError(res, message, 'api.editFareStageMatching', error);
    }
};
