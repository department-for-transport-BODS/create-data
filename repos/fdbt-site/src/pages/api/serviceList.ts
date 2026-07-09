import { NextApiResponse } from 'next';
import isArray from 'lodash/isArray';
import {
    ErrorInfo,
    NextApiRequestWithSession,
    TicketRepresentationAttribute,
    UserFareZone,
} from '../../interfaces/index';
import { getAndValidateNoc, getFareTypeFromFromAttributes, redirectTo, redirectToError } from '../../utils/apiUtils';
import { putUserDataInProductsBucketWithFilePath } from '../../../src/utils/apiUtils/userData';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    STOPS_EXEMPTION_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../constants/attributes';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { SecondaryOperatorFareInfo, SelectedService, Stop } from '../../interfaces/matchingJsonTypes';
import { FileData, getServiceListFormData, processFileUpload } from '../../utils/apiUtils/fileUpload';
import uniq from 'lodash/uniq';
import { batchGetStopsByAtcoCode, updateProductAdditionalNoc } from '../../data/auroradb';
import { csvParser, getAtcoCodesForStops } from './csvZoneUpload';
import logger from '../../utils/logger';
import { STAGE } from '../../constants';
import { getAdditionalNocMatchingJsonLink } from '../../utils';
import { getProductsSecondaryOperatorInfo } from '../../data/s3';
import { AWSError } from 'aws-sdk';

// The below 'config' needs to be exported for the formidable library to work.
export const config = {
    api: {
        bodyParser: false,
    },
};

export const processCsv = async (fileContent: string): Promise<UserFareZone[]> => {
    let parsedFileContent: UserFareZone[];

    try {
        parsedFileContent = csvParser(fileContent);
    } catch (error) {
        logger.warn(error, {
            context: 'api.serviceList',
            message: 'failed to parse exempted stops CSV',
        });

        return [];
    }

    try {
        let csvValid = true;
        const rawUserFareZones = parsedFileContent
            .map((parsedItem) => {
                const item = {
                    FareZoneName: parsedFileContent?.[0]?.FareZoneName,
                    NaptanCodes: parsedItem.NaptanCodes,
                    AtcoCodes: parsedItem.AtcoCodes,
                };

                if (!item.FareZoneName || item.NaptanCodes === undefined || item.AtcoCodes === undefined) {
                    logger.warn('', {
                        context: 'api.serviceList',
                        message:
                            'the uploaded exempt stops was not of the correct format, one of the required columns of information is missing or misnamed',
                    });
                    csvValid = false;
                }

                return item;
            })
            .filter((parsedItem) => parsedItem.NaptanCodes !== '' || parsedItem.AtcoCodes !== '');

        if (rawUserFareZones.length === 0) {
            logger.warn('', {
                context: 'api.serviceList',
                message: 'the uploaded exempted stops contained no Naptan Codes or Atco Codes',
            });
            csvValid = false;
        }

        if (!csvValid) {
            return [];
        }

        let userFareZones = rawUserFareZones;
        const naptanCodesToQuery = rawUserFareZones
            .filter((rawUserFareZone) => rawUserFareZone.AtcoCodes === '')
            .map((rawUserFareZone) => rawUserFareZone.NaptanCodes);

        if (naptanCodesToQuery.length !== 0) {
            userFareZones = await getAtcoCodesForStops(rawUserFareZones, naptanCodesToQuery);
        }

        return userFareZones;
    } catch (error) {
        throw new Error(error.stack);
    }
};

export const processServices = (
    formData: FileData,
): {
    serviceErrors: ErrorInfo[];
    selectedServices: SelectedService[];
    clickedYes: boolean;
    wantsToEditExemptStops: boolean;
    secondaryOperatorNoc?: string;
} => {
    const fields = formData.fields;

    if (!fields) {
        throw new Error('Unable to fetch the form data');
    }
    const exemptValue = fields['exempt'];
    const clickedYes = 'exempt' in fields && (Array.isArray(exemptValue) ? exemptValue[0] : exemptValue) === 'yes';
    const editExemptValue = fields['edit-exempt'];
    const wantsToEditExemptStops =
        'edit-exempt' in fields && (Array.isArray(editExemptValue) ? editExemptValue[0] : editExemptValue) === 'yes';
    const secondaryOperatorNocRaw = fields['secondary-operator-noc'];
    const secondaryOperatorNoc = Array.isArray(secondaryOperatorNocRaw)
        ? secondaryOperatorNocRaw[0]
        : secondaryOperatorNocRaw;

    const dataFields: { [key: string]: string[] } = Object.fromEntries(
        Object.entries(fields).filter((entry): entry is [string, string[]] => entry[1] !== undefined),
    );
    delete dataFields['exempt'];
    delete dataFields['edit-exempt'];
    delete dataFields['secondary-operator-noc'];

    const selectedServices: SelectedService[] = [];

    Object.entries(dataFields).forEach((entry) => {
        if (entry[0] !== 'csv-upload') {
            const lineNameLineIdServiceCodeStartDate = entry[0];
            const description = entry[1];
            let serviceDescription: string;
            if (isArray(description)) {
                [serviceDescription] = description;
            } else {
                serviceDescription = description;
            }
            const splitData = lineNameLineIdServiceCodeStartDate.split('#');
            selectedServices.push({
                lineName: splitData[0],
                lineId: splitData[1],
                serviceCode: splitData[2],
                startDate: splitData[3],
                serviceDescription,
            });
        }
    });

    if (selectedServices.length !== 0) {
        return { selectedServices, clickedYes, wantsToEditExemptStops, secondaryOperatorNoc, serviceErrors: [] };
    }

    return {
        selectedServices,
        clickedYes,
        wantsToEditExemptStops,
        secondaryOperatorNoc,
        serviceErrors: [{ id: 'checkbox-0', errorMessage: 'Choose at least one service from the options' }],
    };
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const nocCode = getAndValidateNoc(req, res);
        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);
        const inEditMode = !!ticket && !!matchingJsonMetaData;
        const formData = await getServiceListFormData(req);
        const { serviceErrors, selectedServices, clickedYes, wantsToEditExemptStops, secondaryOperatorNoc } =
            processServices(formData);

        const isLeadOpEditingSecondaryOp = !!secondaryOperatorNoc && secondaryOperatorNoc !== nocCode;

        const errors: ErrorInfo[] = serviceErrors;
        let exemptStops: Stop[] = [];

        if (inEditMode && !wantsToEditExemptStops && clickedYes) {
            // do nothing
        } else if (clickedYes) {
            const { fileContents, fileError } = await processFileUpload(formData, 'csv-upload');

            if (fileError) {
                errors.push({
                    id: 'csv-upload',
                    errorMessage: fileError,
                });

                updateSessionAttribute(req, STOPS_EXEMPTION_ATTRIBUTE, {
                    errors,
                });

                if (selectedServices.length > 0) {
                    updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, { selectedServices });
                } else {
                    updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, undefined);
                }

                redirectTo(res, '/serviceList');
                return;
            }

            const processedStops = await processCsv(fileContents);

            if (processedStops.length === 0) {
                errors.push({ id: 'csv-upload', errorMessage: 'The selected file must use the template' });
            } else {
                const atcoCodes: string[] = processedStops.map((fareZone) => fareZone.AtcoCodes);
                const deduplicatedAtcoCodes = uniq(atcoCodes);

                let stops: Stop[] = [];
                try {
                    stops = await batchGetStopsByAtcoCode(deduplicatedAtcoCodes);
                } catch (error) {
                    errors.push({
                        id: 'csv-upload',
                        errorMessage: 'Incorrect ATCO/NaPTAN codes detected in file. All codes must be correct.',
                    });
                }
                exemptStops = stops;
            }
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, {
                errors,
            });
            updateSessionAttribute(req, STOPS_EXEMPTION_ATTRIBUTE, undefined);
            redirectTo(res, '/serviceList');
            return;
        }

        if (inEditMode && 'selectedServices' in ticket) {
            const isNonLeadOperatorEditing =
                'nocCode' in ticket && ticket.nocCode !== nocCode && ticket.type === 'multiOperatorExt';

            if (isLeadOpEditingSecondaryOp || isNonLeadOperatorEditing) {
                const additionalNocMatchingJsonLink = getAdditionalNocMatchingJsonLink(
                    matchingJsonMetaData.matchingJsonLink,
                    isLeadOpEditingSecondaryOp ? secondaryOperatorNoc : nocCode,
                );

                let existingSecondaryOperatorFareInfo: SecondaryOperatorFareInfo | undefined = undefined;

                try {
                    existingSecondaryOperatorFareInfo = await getProductsSecondaryOperatorInfo(
                        additionalNocMatchingJsonLink,
                    );
                } catch (error) {
                    if ((error as AWSError).code === 'NoSuchKey') {
                        existingSecondaryOperatorFareInfo = undefined;
                    } else {
                        logger.warn(error, {
                            context: 'api.serviceList',
                            message: 'failed to get secondary operator fare info',
                        });
                    }
                }

                const updatedSecondaryOperatorFareInfo: SecondaryOperatorFareInfo = {
                    ...existingSecondaryOperatorFareInfo,
                    selectedServices,
                    ...(exemptStops.length > 0 && { exemptStops }),
                };

                if (!clickedYes) {
                    updatedSecondaryOperatorFareInfo.exemptStops = undefined;
                }

                await putUserDataInProductsBucketWithFilePath(
                    updatedSecondaryOperatorFareInfo,
                    additionalNocMatchingJsonLink,
                );

                if (ticket.type === 'multiOperatorExt') {
                    await updateProductAdditionalNoc(
                        matchingJsonMetaData.productId,
                        isLeadOpEditingSecondaryOp ? secondaryOperatorNoc : nocCode,
                        selectedServices.length === 0,
                    );
                }
            } else {
                const updatedTicket = {
                    ...ticket,
                    selectedServices,
                    ...(exemptStops.length > 0 && { exemptStops }),
                };

                if (!clickedYes) {
                    updatedTicket.exemptStops = undefined;
                }

                await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonMetaData.matchingJsonLink);
            }

            updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, undefined);
            updateSessionAttribute(req, STOPS_EXEMPTION_ATTRIBUTE, undefined);

            redirectTo(
                res,
                `/products/productDetails?productId=${matchingJsonMetaData.productId}${
                    matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
                }`,
            );
            return;
        }

        updateSessionAttribute(req, SERVICE_LIST_ATTRIBUTE, { selectedServices });
        updateSessionAttribute(req, STOPS_EXEMPTION_ATTRIBUTE, exemptStops.length > 0 ? { exemptStops } : undefined);

        const fareType = getFareTypeFromFromAttributes(req);

        const ticketType = (getSessionAttribute(req, TICKET_REPRESENTATION_ATTRIBUTE) as TicketRepresentationAttribute)
            .name;

        if (fareType === 'multiOperator' || fareType === 'multiOperatorExt') {
            redirectTo(res, '/reuseOperatorGroup');
            return;
        }

        if (ticketType === 'multipleServicesPricedByDistance' && STAGE === 'dev') {
            redirectTo(res, '/definePricingPerDistance');
            return;
        }
        redirectTo(res, '/multipleProducts');
        return;
    } catch (error) {
        const message = 'There was a problem processing the selected services from the servicesList page:';
        redirectToError(res, message, 'api.serviceList', error);
    }
};
