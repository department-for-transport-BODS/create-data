import { NextApiResponse } from 'next';
import { redirectTo, redirectToError, getSelectedStages } from '../../utils/apiUtils';
import { MATCHING_ATTRIBUTE, UNASSIGNED_STOPS_ATTRIBUTE } from '../../constants/attributes';
import { MatchingFareZones, MatchingInfo, MatchingWithErrors } from '../../interfaces/matchingInterface';
import {
    getFareZones,
    getMatchingFareZonesAndUnassignedStopsFromForm,
    isFareStageUnassigned,
} from '../../utils/apiUtils/matching';
import { updateSessionAttribute } from '../../utils/sessions';
import { NextApiRequestWithSession, BasicService, UserFareStages } from '../../interfaces';

export default (req: NextApiRequestWithSession, res: NextApiResponse): void => {
    try {
        const { overrideWarning } = req.body;
        if (!req.body.service || !req.body.userfarestages) {
            throw new Error('No service or userfarestages info found');
        }

        const service: BasicService = JSON.parse(req.body.service);
        const userFareStages: UserFareStages = JSON.parse(req.body.userfarestages);
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

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingAttributeError);

            redirectTo(res, '/outboundMatching');
            return;
        } else if (isFareStageUnassigned(userFareStages, matchingFareZones) && !overrideWarning) {
            const selectedStagesList: string[][] = getSelectedStages(req);
            const matchingAttributeError: MatchingWithErrors = {
                warning: true,
                selectedFareStages: selectedStagesList,
            };

            updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingAttributeError);

            redirectTo(res, '/outboundMatching');

            return;
        }

        const formatMatchingFareZones = getFareZones(userFareStages, matchingFareZones);

        const matchedFareZones: MatchingFareZones = {};
        formatMatchingFareZones.forEach((fareStage) => {
            matchedFareZones[fareStage.name] = fareStage;
        });

        const matchingValues: MatchingInfo = {
            service,
            userFareStages,
            matchingFareZones: matchedFareZones,
        };

        updateSessionAttribute(req, UNASSIGNED_STOPS_ATTRIBUTE, unassignedStops);
        updateSessionAttribute(req, MATCHING_ATTRIBUTE, matchingValues);
        redirectTo(res, '/inboundMatching');
    } catch (error) {
        const message = 'There was a problem generating the matching JSON:';
        redirectToError(res, message, 'api.outboundMatching', error);
    }
};
