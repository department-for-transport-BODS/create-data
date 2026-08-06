import { NextApiResponse } from 'next';
import uniq from 'lodash/uniq';
import Papa from 'papaparse';
import { putDataInS3 } from '../../data/s3';
import { NextApiRequestWithSession, ErrorInfo, UserFareStages } from '../../interfaces';
import { redirectToError, redirectTo, getUuidFromSession, getAndValidateNoc } from '../../utils/apiUtils';
import {
    INPUT_METHOD_ATTRIBUTE,
    CSV_UPLOAD_ATTRIBUTE,
    DIRECTION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../../constants/attributes';
import { getFormData, processFileUpload } from '../../utils/apiUtils/fileUpload';
import logger from '../../utils/logger';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { getFareZones } from '../../../src/utils/apiUtils/matching';
import { MatchingFareZones } from '../../../src/interfaces/matchingInterface';
import { putUserDataInProductsBucketWithFilePath } from '../../../src/utils/apiUtils/userData';
import { updateProductFareTriangleModifiedByNocCodeAndId } from '../../data/auroradb';
import dayjs from '../../utils/dayjs';
import { WithIds, SingleTicket, ReturnTicket } from '../../interfaces/matchingJsonTypes';

const errorId = 'csv-upload';

interface FareTriangleData {
    fareStages: {
        stageName: string;
        prices: {
            [key: string]: {
                price: string;
                fareZones: string[];
            };
        };
    }[];
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export const setCsvUploadAttributeAndRedirect = (
    req: NextApiRequestWithSession,
    res: NextApiResponse,
    errors: ErrorInfo[],
    poundsOrPence?: string,
): void => {
    updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { errors, poundsOrPence });

    redirectTo(res, '/csvUpload');
};

export const containsDuplicateFareStages = (fareStageNames: string[]): boolean =>
    uniq(fareStageNames).length !== fareStageNames.length;

export const isNotTicketerFormat = (fareStageLines: string[][]): boolean => {
    const items = fareStageLines[0];
    const trimmedItems = items.map((item) => item.trim());

    return !trimmedItems[0] || trimmedItems[0] === '';
};

export const faresTriangleDataMapper = (
    dataToMap: string,
    req: NextApiRequestWithSession,
    res: NextApiResponse,
    poundsOrPence: string,
): UserFareStages | null => {
    const fareTriangle: FareTriangleData = {
        fareStages: [],
    };

    const fareStageLines = Papa.parse(dataToMap, { skipEmptyLines: 'greedy' }).data as string[][];
    const fareStageCount = fareStageLines.length;
    const isPence = poundsOrPence === 'pence';

    if (fareStageCount < 2) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: `At least 2 fare stages are needed, only ${fareStageCount} found`,
        });
        const errors: ErrorInfo[] = [{ id: errorId, errorMessage: 'At least 2 fare stages are needed' }];
        setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);

        return null;
    }

    if (fareStageCount !== fareStageLines[0].length) {
        if (!(isNotTicketerFormat(fareStageLines) && fareStageCount === fareStageLines[0].length - 1)) {
            logger.warn('', {
                context: 'api.csvUpload',
                message: `Uploaded CSV does not follow correct template`,
            });
            const errors: ErrorInfo[] = [{ id: errorId, errorMessage: 'The selected file must use the template' }];
            setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);

            return null;
        }
    }

    const notTicketerFormat = isNotTicketerFormat(fareStageLines);
    let pricesSet = false;

    for (let rowNum = 0; rowNum < fareStageLines.length; rowNum += 1) {
        const items = fareStageLines[rowNum] || [];
        const trimmedItems = items.map((item) => item.trim().replace(/^"(.*)"$/, '$1'));
        const stageName = notTicketerFormat ? trimmedItems[rowNum + 1] : trimmedItems[rowNum];

        if (!stageName) {
            logger.warn('', {
                context: 'api.csvUpload',
                message: `Empty fare stage name found in uploaded file`,
            });
            const errors: ErrorInfo[] = [{ id: errorId, errorMessage: 'Fare stage names must not be empty' }];
            setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);

            return null;
        }

        if (trimmedItems.every((item) => item === '' || item === null)) {
            break;
        }

        fareTriangle.fareStages[rowNum] = {
            stageName,
            prices: {},
        };

        for (let colNum = 0; colNum < rowNum; colNum += 1) {
            const price = notTicketerFormat ? trimmedItems[colNum + 1] : trimmedItems[colNum];

            // Check explicitly for number to account for invalid fare data
            if (price && stageName) {
                pricesSet = true;

                if (Number.isNaN(Number(price))) {
                    logger.warn('', {
                        context: 'api.csvUpload',
                        message: `invalid price in CSV upload`,
                    });
                    const errors: ErrorInfo[] = [
                        { id: errorId, errorMessage: 'The selected file contains an invalid price' },
                    ];
                    setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);
                    return null;
                }

                if (isPence && Number(price) % 1 !== 0) {
                    logger.warn('', {
                        context: 'api.csvUpload',
                        message: `decimal price in CSV upload`,
                    });
                    const errors: ErrorInfo[] = [
                        {
                            id: errorId,
                            errorMessage: 'The selected file contains a decimal price, all prices must be in pence',
                        },
                    ];
                    setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);
                    return null;
                }

                const formattedPrice = isPence ? (parseFloat(price) / 100).toFixed(2) : parseFloat(price).toFixed(2);

                if (fareTriangle.fareStages?.[colNum].prices?.[formattedPrice]?.fareZones) {
                    fareTriangle.fareStages[colNum].prices[formattedPrice].fareZones.push(stageName);
                } else {
                    fareTriangle.fareStages[colNum].prices[formattedPrice] = {
                        price: formattedPrice,
                        fareZones: [stageName],
                    };
                }
            }
        }
    }

    if (!pricesSet) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: 'No prices set in uploaded fares triangle',
        });
        const errors: ErrorInfo[] = [
            { id: errorId, errorMessage: 'At least one price must be set in the uploaded fares triangle' },
        ];
        setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);

        return null;
    }

    const mappedFareTriangle: UserFareStages = {
        fareStages: fareTriangle.fareStages.map((item) => ({
            ...item,
            prices: Object.values(item.prices),
        })),
    };

    const fareStageNames: string[] = mappedFareTriangle.fareStages.map((fareStage) => fareStage.stageName);

    if (containsDuplicateFareStages(fareStageNames)) {
        logger.warn('', {
            context: 'api.csvUpload',
            message: `Duplicate fare stage names found, fare stage names: ${fareStageNames}`,
        });
        const errors: ErrorInfo[] = [{ id: errorId, errorMessage: 'Fare stage names cannot be the same' }];
        setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);
        return null;
    }

    return mappedFareTriangle;
};

export const getNamesOfFareZones = (ticket: WithIds<SingleTicket> | WithIds<ReturnTicket>): string[] | undefined => {
    let fareZoneNames;

    if ('fareZones' in ticket) {
        fareZoneNames = ticket.fareZones.map((fz) => fz.name);
    } else if ('inboundFareZones' in ticket && 'outboundFareZones' in ticket) {
        const combinedFareZones = ticket.outboundFareZones.concat(ticket.inboundFareZones);

        const combinedNamesOnly = combinedFareZones.map((x) => x.name);

        // get rid of duplicates
        fareZoneNames = [...new Set(combinedNamesOnly)];
    }

    return fareZoneNames;
};

export const thereIsAFareStageNameMismatch = (fareTriangleData: UserFareStages, fareZoneNames: string[]): boolean =>
    fareTriangleData.fareStages.some((fs) => {
        return !fareZoneNames.includes(fs.stageName);
    });

const stageCountMismatchError: ErrorInfo = {
    id: errorId,
    errorMessage:
        'The number of fare stages of your updated fares triangle do not match the one you have previously uploaded. Update your triangle, ensuring the number of fare stages match before trying to upload again',
};

const nameMismatchError: ErrorInfo = {
    id: errorId,
    errorMessage:
        'The name of one or more fare stages of your updated fares triangle does not match what you had have previously uploaded. Update your triangle, ensuring the names of fare stages match before trying to upload again',
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const formData = await getFormData(req);
        const noc = getAndValidateNoc(req, res);
        const { fields } = formData;

        if (!fields?.poundsOrPence) {
            const errors: ErrorInfo[] = [
                { id: 'pounds', errorMessage: 'You must select whether the prices are in pounds or pence' },
            ];

            setCsvUploadAttributeAndRedirect(req, res, errors);

            return;
        }

        const poundsOrPence = Array.isArray(fields.poundsOrPence) ? fields.poundsOrPence[0] : fields.poundsOrPence;

        const { fileContents, fileError } = await processFileUpload(formData, 'csv-upload');

        if (fileError) {
            const errors: ErrorInfo[] = [{ id: errorId, errorMessage: fileError }];

            setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);

            return;
        }

        if (fileContents) {
            const fareTriangleData = faresTriangleDataMapper(fileContents, req, res, poundsOrPence as string);

            if (!fareTriangleData) {
                return;
            }

            const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE) as
                WithIds<SingleTicket> | WithIds<ReturnTicket> | undefined;

            const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);

            // check to see if we are in edit mode
            if (ticket && matchingJsonMetaData) {
                const fareZoneNames = getNamesOfFareZones(ticket);

                if (!fareZoneNames) {
                    return;
                }

                const errors: ErrorInfo[] = [];

                const thereIsANameMismatch = thereIsAFareStageNameMismatch(fareTriangleData, fareZoneNames);

                // check to see if the the number of fare stages does not match
                if (fareTriangleData.fareStages.length !== fareZoneNames.length) {
                    errors.push(stageCountMismatchError);
                } else if (thereIsANameMismatch) {
                    errors.push(nameMismatchError);
                }

                // check to see if we had errors
                if (errors.length > 0) {
                    setCsvUploadAttributeAndRedirect(req, res, errors, poundsOrPence);
                    return;
                }

                // clear the errors from the session
                updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { errors: [] });

                // update the fare zones on the matching json
                if ('fareZones' in ticket) {
                    ticket.fareZones = getFareZones(
                        fareTriangleData,
                        ticket.fareZones.reduce<MatchingFareZones>((matchingFareZones, currentFareZone) => {
                            matchingFareZones[currentFareZone.name] = currentFareZone;
                            return matchingFareZones;
                        }, {}),
                    );
                } else {
                    ticket.inboundFareZones = getFareZones(
                        fareTriangleData,
                        ticket.inboundFareZones.reduce<MatchingFareZones>((matchingFareZones, currentFareZone) => {
                            matchingFareZones[currentFareZone.name] = currentFareZone;
                            return matchingFareZones;
                        }, {}),
                    );

                    ticket.outboundFareZones = getFareZones(
                        fareTriangleData,
                        ticket.outboundFareZones.reduce<MatchingFareZones>((matchingFareZones, currentFareZone) => {
                            matchingFareZones[currentFareZone.name] = currentFareZone;
                            return matchingFareZones;
                        }, {}),
                    );
                }

                // overriding the existing object
                await putUserDataInProductsBucketWithFilePath(ticket, matchingJsonMetaData.matchingJsonLink);
                const fareTriangleModified = dayjs.utc().toDate();
                const productId = Number(matchingJsonMetaData.productId);
                // updating fareTriangleModified in products table
                await updateProductFareTriangleModifiedByNocCodeAndId(productId, noc, fareTriangleModified);
                redirectTo(
                    res,
                    `/products/productDetails?productId=${matchingJsonMetaData?.productId}&serviceId=${matchingJsonMetaData?.serviceId}`,
                );
                return;
            } else {
                const uuid = getUuidFromSession(req);

                await putDataInS3(fileContents, `${uuid}.csv`, false);

                await putDataInS3(fareTriangleData, `${uuid}.json`, true);

                updateSessionAttribute(req, INPUT_METHOD_ATTRIBUTE, { inputMethod: 'csv' });

                updateSessionAttribute(req, CSV_UPLOAD_ATTRIBUTE, { errors: [] });

                const directionAttribute = getSessionAttribute(req, DIRECTION_ATTRIBUTE);

                if (
                    directionAttribute &&
                    'inboundDirection' in directionAttribute &&
                    directionAttribute.inboundDirection
                ) {
                    redirectTo(res, '/outboundMatching');
                    return;
                }

                redirectTo(res, '/matching');
                return;
            }
        }
    } catch (error) {
        const message = 'There was a problem uploading the CSV:';

        redirectToError(res, message, 'api.csvUpload', error);
    }
};
