import {
    UNASSIGNED_INBOUND_STOPS_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
} from './../../constants/attributes';
import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getSelectedStages, getFareTypeFromFromAttributes } from '../../utils/apiUtils';
import { NextApiRequestWithSession, UserFareStages } from '../../interfaces';
import {
    fareStageIsUnused,
    getMatchingFareZonesAndUnassignedStopsFromForm,
    isFareStageUnassigned,
} from '../../utils/apiUtils/matching';
import { CARNET_FARE_TYPE_ATTRIBUTE, INBOUND_MATCHING_ATTRIBUTE } from '../../constants/attributes';
import { getRequiredSessionAttribute, getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { MatchingWithErrors, InboundMatchingInfo } from '../../interfaces/matchingInterface';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const { overrideWarning } = req.body;
        if (!req.body.service || !req.body.userfarestages) {
            throw new Error('No service or userfarestages info found');
        }

        const uploadedUserFareStages: UserFareStages = JSON.parse(req.body.userfarestages);

        const parsedInputs = getMatchingFareZonesAndUnassignedStopsFromForm(req);
        const { matchingFareZones, unassignedStops } = parsedInputs;

        // Deleting these keys from the object in order to facilitate looping through the fare stage values in the body
        delete req.body.service;
        delete req.body.userfarestages;

        if (!Object.keys(matchingFareZones).find((fareZone) => fareZone !== 'notApplicable')) {
            const selectedStagesList: string[][] = getSelectedStages(req);
            const matchingAttributeError: MatchingWithErrors = {
                error: 'No fare stages have been assigned, assign each fare stage to a stop',
                selectedFareStages: selectedStagesList,
            };
            updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeError);

            redirectTo(res, '/inboundMatching');
            return;
        } else if (isFareStageUnassigned(uploadedUserFareStages, matchingFareZones) && !overrideWarning) {
            const selectedStagesList: string[][] = getSelectedStages(req);
            const matchingAttributeError: MatchingWithErrors = {
                warning: true,
                selectedFareStages: selectedStagesList,
            };
            updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeError);

            redirectTo(res, '/inboundMatching');

            return;
        } else {
            const outboundMatchingUserFareStages = getRequiredSessionAttribute(req, MATCHING_ATTRIBUTE);
            const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);
            if (
                !operatorAttribute ||
                !('uuid' in operatorAttribute) ||
                !operatorAttribute.uuid ||
                !('userFareStages' in outboundMatchingUserFareStages)
            ) {
                throw new Error('Necessary attributes were not found in session');
            }
            const allUsedFareStageNames = Object.keys(matchingFareZones).concat(
                Object.keys(outboundMatchingUserFareStages.matchingFareZones),
            );

            if (fareStageIsUnused(allUsedFareStageNames, uploadedUserFareStages)) {
                const selectedStagesList: string[][] = getSelectedStages(req);
                const matchingAttributeError = {
                    selectedFareStages: selectedStagesList,
                };
                updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeError);
                redirectTo(res, '/inboundMatching?unusedStage=true');
                return;
            }
        }

        updateSessionAttribute(req, UNASSIGNED_INBOUND_STOPS_ATTRIBUTE, unassignedStops);

        const matchingAttributeValue: InboundMatchingInfo = {
            inboundUserFareStages: uploadedUserFareStages,
            inboundMatchingFareZones: matchingFareZones,
        };
        updateSessionAttribute(req, INBOUND_MATCHING_ATTRIBUTE, matchingAttributeValue);

        const carnetFareType = getSessionAttribute(req, CARNET_FARE_TYPE_ATTRIBUTE);

        if (carnetFareType) {
            redirectTo(res, '/carnetProductDetails');
            return;
        }

        if (getFareTypeFromFromAttributes(req) === 'period') {
            redirectTo(res, '/pointToPointPeriodProduct');
            return;
        }

        redirectTo(res, '/returnValidity');
    } catch (error) {
        const message = 'There was a problem with the inputted inbound fare stage matching info';
        redirectToError(res, message, 'api.inboundMatching', error);
    }
};
