import { Handler } from 'aws-lambda';
import { AWSError } from 'aws-sdk';
import {
    BaseTicket,
    FullTimeRestriction,
    TicketWithIds,
    Ticket,
    BaseSchemeOperatorTicket,
    Stop,
    SecondaryOperatorServices,
    SecondaryOperatorFareZone,
    SelectedService,
    AdditionalOperator,
    GroupDefinition,
} from 'fdbt-types/matchingJsonTypes';
import {
    getFareDayEnd,
    getPassengerTypeById,
    getTimeRestrictionsByIdAndNoc,
    getGroupDefinition,
    getSalesOfferPackagesByNoc,
    getCapByNocAndId,
} from './database';
import { ExportLambdaBody } from 'fdbt-types/integrationTypes';
import 'source-map-support/register';
import { DbCap, DbTimeRestriction, PassengerType } from 'fdbt-types/dbTypes';
import { getS3Object, putS3Object } from './s3';

const PRODUCTS_BUCKET = process.env.PRODUCTS_BUCKET;
const MATCHING_DATA_BUCKET = process.env.MATCHING_DATA_BUCKET;
const EXPORT_METADATA_BUCKET = process.env.EXPORT_METADATA_BUCKET;

export const removeDuplicates = <T, K extends keyof T>(arrayToRemoveDuplicates: T[], key: K): T[] =>
    arrayToRemoveDuplicates.filter(
        (value, index, self) => index === self.findIndex((item) => item[key] === value[key]),
    );

export const processSecondaryOperatorServices = async (
    nocCodes: string[],
    path: string,
    productsBucket: string,
): Promise<{
    additionalOperators: AdditionalOperator[];
    exemptStops: Stop[];
}> => {
    const additionalOperators = [];
    const exemptStops: Stop[] = [];

    for await (const nocCode of nocCodes) {
        const additionalPath = `${path.substring(0, path.lastIndexOf('.json'))}_${nocCode}.json`;

        try {
            const additionalServicesObject = await getS3Object(additionalPath, productsBucket);

            if (additionalServicesObject.Body) {
                const additionalServices = JSON.parse(
                    additionalServicesObject.Body.toString('utf-8'),
                ) as SecondaryOperatorServices;

                additionalOperators.push({
                    nocCode: nocCode,
                    selectedServices: additionalServices.selectedServices,
                });

                if (additionalServices.exemptStops && additionalServices.exemptStops.length > 0) {
                    exemptStops.push(...additionalServices.exemptStops);
                }
            }
        } catch (error) {
            if ((error as AWSError).code === 'NoSuchKey') {
                console.log(`No additional services found for ${nocCode}`);
            }
        }
    }
    return { additionalOperators, exemptStops };
};

export const processSecondaryOperatorFareZone = async (
    nocCodes: string[],
    path: string,
    productsBucket: string,
): Promise<{ secondaryOperatorStops: Stop[]; exemptedServices: SelectedService[] }> => {
    const secondaryOperatorStops: Stop[] = [];
    const exemptedServices: SelectedService[] = [];
    for await (const nocCode of nocCodes) {
        const additionalPath = `${path.substring(0, path.lastIndexOf('.json'))}_${nocCode}.json`;

        try {
            const additionalStopsObject = await getS3Object(additionalPath, productsBucket);

            if (additionalStopsObject.Body) {
                const additionalStops = JSON.parse(
                    additionalStopsObject.Body.toString('utf-8'),
                ) as SecondaryOperatorFareZone;

                secondaryOperatorStops.push(...additionalStops.stops);

                if (additionalStops.exemptedServices && additionalStops.exemptedServices.length > 0) {
                    exemptedServices.push(...additionalStops.exemptedServices);
                }
            }
        } catch (error) {
            if ((error as AWSError).code === 'NoSuchKey') {
                console.log(`No additional services found for ${nocCode}`);
            }
        }
    }

    return { secondaryOperatorStops, exemptedServices };
};

export const handler: Handler<ExportLambdaBody> = async ({ paths, noc, exportPrefix }) => {
    // populate the values from global settings using the IDs and write to matching data bucket

    console.log(`${noc} - Exporting ${paths.length} files for netex creation for export ${exportPrefix}`);

    if (!PRODUCTS_BUCKET || !MATCHING_DATA_BUCKET || !EXPORT_METADATA_BUCKET) {
        throw new Error(
            `Bucket details missing. Products bucket: ${PRODUCTS_BUCKET || '<missing>'}, Matching data bucket: ${
                MATCHING_DATA_BUCKET || '<missing>'
            }, Export metadata bucket: ${EXPORT_METADATA_BUCKET || '<missing>'}`,
        );
    }

    // Failures are collected rather than rejecting immediately so that one failing product doesn't prevent the
    // metadata being written, otherwise the export is never marked as failed and appears stuck in progress forever
    const failures: { path: string; reason: unknown }[] = [];

    await Promise.all(
        paths
            .map(async (path) => {
                const object = await getS3Object(path, PRODUCTS_BUCKET);
                if (!object.Body) {
                    throw new Error(`body was not present [${path}]`);
                }

                const ticketWithIds = JSON.parse(object.Body.toString('utf-8')) as TicketWithIds;

                if (
                    path.includes('multiOperatorExt') &&
                    ('additionalOperators' in ticketWithIds || 'additionalNocs' in ticketWithIds)
                ) {
                    // add secondary operator product information for service type tickets
                    if ('additionalOperators' in ticketWithIds) {
                        const additionalOperatorsNocCodes = ticketWithIds.additionalOperators.map(
                            (operator) => operator.nocCode,
                        );

                        const { additionalOperators, exemptStops } = await processSecondaryOperatorServices(
                            additionalOperatorsNocCodes,
                            path,
                            PRODUCTS_BUCKET,
                        );

                        ticketWithIds.additionalOperators =
                            additionalOperators.length > 0 ? additionalOperators : ticketWithIds.additionalOperators;

                        ticketWithIds.exemptStops = ticketWithIds.exemptStops?.concat(exemptStops) ?? exemptStops;
                        ticketWithIds.exemptStops = removeDuplicates(ticketWithIds.exemptStops ?? [], 'atcoCode');

                        if (ticketWithIds.exemptStops.length === 0) {
                            ticketWithIds.exemptStops = undefined;
                        }
                    }

                    // add secondary operator product information for fareZone type tickets
                    if ('additionalNocs' in ticketWithIds) {
                        const additionalOperatorsNocCodes = ticketWithIds.additionalNocs;
                        const { secondaryOperatorStops, exemptedServices } = await processSecondaryOperatorFareZone(
                            additionalOperatorsNocCodes,
                            path,
                            PRODUCTS_BUCKET,
                        );

                        ticketWithIds.stops = ticketWithIds.stops.concat(secondaryOperatorStops);
                        ticketWithIds.stops = removeDuplicates(ticketWithIds.stops, 'atcoCode');
                        ticketWithIds.exemptedServices =
                            ticketWithIds.exemptedServices?.concat(exemptedServices) ?? exemptedServices;

                        if (ticketWithIds.exemptedServices.length === 0) {
                            ticketWithIds.exemptedServices = undefined;
                        }
                    }
                }

                const singleOrGroupPassengerType = await getPassengerTypeById(ticketWithIds.passengerType.id, noc);
                const passengerTypeValue = singleOrGroupPassengerType.name;

                let passengerType: Omit<PassengerType, 'id'>;
                let groupDefinition: GroupDefinition | undefined;
                if ('groupPassengerType' in singleOrGroupPassengerType) {
                    passengerType = { passengerType: 'group' };
                    groupDefinition = await getGroupDefinition(singleOrGroupPassengerType.groupPassengerType, noc);
                } else {
                    passengerType = singleOrGroupPassengerType.passengerType;
                }

                const allSops = await getSalesOfferPackagesByNoc(noc);

                const fullProducts = ticketWithIds.products.map((product) => ({
                    ...product,
                    productName: product.productName
                        ? product.productName
                        : `${passengerTypeValue} ${ticketWithIds.type}`,
                    salesOfferPackages: product.salesOfferPackages.map((sopWithIds) => {
                        const sop = allSops.find((it) => it.id === sopWithIds.id);
                        if (!sop) {
                            throw new Error(`No sop found for id [${sopWithIds.id}]`);
                        }
                        return { ...sop, price: sopWithIds.price };
                    }),
                }));

                const timeRestriction = ticketWithIds.timeRestriction
                    ? await getTimeRestrictionsByIdAndNoc(ticketWithIds.timeRestriction.id, noc)
                    : [];

                const caps = ticketWithIds.caps
                    ? await Promise.all(
                          (ticketWithIds.caps as { id: number }[]).map(({ id }) =>
                              getCapByNocAndId(noc, id).then((cap) => cap || null),
                          ),
                      ).then((results) => results.filter((cap): cap is DbCap => cap !== null))
                    : undefined;

                const fareDayEnd = await getFareDayEnd(noc);

                const timeRestrictionWithUpdatedFareDayEnds: FullTimeRestriction[] = timeRestriction.map(
                    (timeRestriction: DbTimeRestriction) => ({
                        ...timeRestriction,
                        timeBands: timeRestriction.timeBands.map((timeBand) => {
                            let endTime: string;
                            if (typeof timeBand.endTime === 'string') {
                                endTime = timeBand.endTime;
                            } else {
                                if (!fareDayEnd) {
                                    throw new Error('No fare day end set for time restriction');
                                }

                                endTime = fareDayEnd;
                            }

                            return {
                                ...timeBand,
                                endTime: endTime,
                            };
                        }),
                    }),
                );

                let setFareDayEnd = false;
                const product = fullProducts[0];

                if ('productValidity' in product) {
                    setFareDayEnd = true;
                }

                const baseTicket: BaseTicket | BaseSchemeOperatorTicket = {
                    ...ticketWithIds,
                    ...passengerType,
                    groupDefinition,
                    timeRestriction: timeRestrictionWithUpdatedFareDayEnds,
                    ...(!!caps && caps.length > 0 ? { caps: caps } : {}),
                };

                const fullTicket: Ticket = {
                    ...baseTicket,
                    products: fullProducts,
                    fareDayEnd: setFareDayEnd ? fareDayEnd : undefined,
                } as Ticket;

                const sections = path.split('/');
                const destPath = exportPrefix
                    ? `${noc}/exports/${exportPrefix}/${sections[sections.length - 1]}`
                    : path;

                await putS3Object(destPath, MATCHING_DATA_BUCKET, JSON.stringify(fullTicket));
            })
            .map((exportPromise, index) =>
                exportPromise.catch((reason: unknown) => {
                    failures.push({ path: paths[index], reason });
                }),
            ),
    );

    failures.forEach(({ path, reason }) => {
        console.error(`${noc} - Failed to export ${path} for export ${exportPrefix}`, reason);
    });

    const date = new Date();
    const numberOfExpectedNetexFiles = paths.length;
    const metadata = { date, numberOfExpectedNetexFiles };

    console.log(
        `putting metadata: date - ${metadata.date.toDateString()} numberOfExpectedNetexFiles - ${
            metadata.numberOfExpectedNetexFiles
        } in metadata bucket: ${EXPORT_METADATA_BUCKET} key: ${noc}/exports/${exportPrefix}.json`,
    );

    await putS3Object(`${noc}/exports/${exportPrefix}.json`, EXPORT_METADATA_BUCKET, JSON.stringify(metadata));

    if (failures.length > 0) {
        throw new Error(
            `${noc} - Failed to export ${failures.length} of ${paths.length} files for export ${exportPrefix}`,
        );
    }

    console.log(`completed ${paths.length} files.`);
};
