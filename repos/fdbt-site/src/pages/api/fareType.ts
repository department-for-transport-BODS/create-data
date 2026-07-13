import camelCase from 'lodash/camelCase';
import { NextApiResponse } from 'next';
import { redirectToError, redirectTo, getAndValidateNoc, isSchemeOperator } from '../../utils/apiUtils/index';
import { getSessionAttribute, regenerateSession, updateSessionAttribute } from '../../utils/sessions';
import {
    FARE_TYPE_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
} from '../../constants/attributes';
import { ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { getAllServicesByNocCode } from '../../data/auroradb';
import { SCHOOL_FARE_TYPE_ATTRIBUTE } from '../../constants/attributes';
import { buildUuid } from '../fareType';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const { fareType } = req.body;
        if (fareType) {
            regenerateSession(req);
            const schemeOp = isSchemeOperator(req, res);
            const nocCode = getAndValidateNoc(req, res);
            const services = await getAllServicesByNocCode(nocCode);
            const hasBodsServices = services.some((service) => service.dataSource && service.dataSource === 'bods');
            const multiModalAttribute = getSessionAttribute(req, MULTI_MODAL_ATTRIBUTE);

            if (!schemeOp && !hasBodsServices && !multiModalAttribute) {
                redirectTo(res, '/noServices');
                return;
            }

            updateSessionAttribute(req, TXC_SOURCE_ATTRIBUTE, {
                source: hasBodsServices ? 'bods' : 'tnds',
                hasBods: true,
                hasTnds: false,
            });

            if (
                typeof fareType === 'string' &&
                (fareType === 'carnet' || fareType === 'carnetPeriod' || fareType === 'carnetFlatFare')
            ) {
                updateSessionAttribute(req, CARNET_FARE_TYPE_ATTRIBUTE, true);
                if (fareType === 'carnet') {
                    updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, undefined);
                    redirectTo(res, '/carnetFareType');
                    return;
                }
                const reformedFareType = camelCase(fareType.split('carnet')[1]) as 'flatFare' | 'period';
                updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, { fareType: reformedFareType });

                const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);
                const uuid = buildUuid(nocCode);
                updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { ...operatorAttribute, uuid });

                redirectTo(res, '/selectPassengerType');
                return;
            }

            updateSessionAttribute(req, CARNET_FARE_TYPE_ATTRIBUTE, false);
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                fareType,
            });

            if (fareType === 'schoolService') {
                updateSessionAttribute(req, SCHOOL_FARE_TYPE_ATTRIBUTE, {
                    schoolFareType: 'period',
                });
            }

            const operatorAttribute = getSessionAttribute(req, OPERATOR_ATTRIBUTE);
            const uuid = buildUuid(nocCode);
            updateSessionAttribute(req, OPERATOR_ATTRIBUTE, { ...operatorAttribute, uuid });

            redirectTo(res, '/selectPassengerType');
            return;
        } else {
            const errors: ErrorInfo[] = [
                { id: 'radio-option-single', errorMessage: 'Choose a fare type from the options' },
            ];
            updateSessionAttribute(req, FARE_TYPE_ATTRIBUTE, {
                errors,
            });
            redirectTo(res, '/fareType');
            return;
        }
    } catch (error) {
        const message = 'There was a problem selecting the fare type.';
        redirectToError(res, message, 'api.fareType', error);
    }
};
