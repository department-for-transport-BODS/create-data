import { S3Event } from 'aws-lambda';
import AWS, { SNS } from 'aws-sdk';
import * as db from '../data/auroradb';
import * as s3 from '../data/s3';
import { isPointToPointTicket, isSchemeOperatorTicket, isSingleTicket, Ticket } from '../types/index';
import netexGenerator from './netexGenerator';
import { Operator } from '../../src/types/index';
import { getProductType, replaceAll } from './sharedHelpers';
import { SchemeOperatorTicket } from 'fdbt-types/matchingJsonTypes';
import { createHash } from 'crypto';

const getLineOrNetworkFare = (productType: string): string => {
    if (productType === 'singleTrip' || productType === 'dayReturnTrip' || productType === 'periodReturnTrip') {
        return 'LINE-FARE';
    }

    return 'NETWORK-FARE';
};

export const getSchemeNocIdentifier = (schemeTicket: SchemeOperatorTicket): string =>
    `${schemeTicket.schemeOperatorName.substring(0, 5)}${schemeTicket.schemeOperatorRegionCode}`;

export const getS3FilePrefix = (s3FileName: string, nocIdentifier: string): string => {
    const exportDate = s3FileName.split(`${nocIdentifier}/exports/`)[1].split('/')[0];
    return `${nocIdentifier}/exports/${exportDate}`;
};

export const generateFileName = (ticket: Ticket, sourceKey: string): string => {
    const productType = getProductType(ticket);
    const lineOrNetworkFare = getLineOrNetworkFare(productType);
    const nocOrSchemeName = isSchemeOperatorTicket(ticket) ? getSchemeNocIdentifier(ticket) : ticket.nocCode;
    const productNameWithoutWhiteSpace = replaceAll(ticket.products[0].productName, ' ', '-');
    const productNameWithoutSlashes = replaceAll(productNameWithoutWhiteSpace, '/', '-');
    const startDate = ticket.ticketPeriod.startDate.split('T')[0];

    let pointToPointInsert = '';

    if (isPointToPointTicket(ticket)) {
        if (isSingleTicket(ticket)) {
            const directionLetter =
                ticket.journeyDirection === 'inbound' || ticket.journeyDirection === 'clockwise' ? 'I' : 'O';
            pointToPointInsert = `${ticket.lineName}_${directionLetter}_`;
        } else {
            pointToPointInsert = `${ticket.lineName}_`;
        }
    }

    // Use the source file path to generate a stable suffix so retries overwrite the same file.
    const sourceKeyHash = createHash('sha256')
        .update(sourceKey)
        .digest('hex')
        .substring(0, 8);

    return `FX-PI-01_UK_${nocOrSchemeName}_${lineOrNetworkFare}_${
        pointToPointInsert ? pointToPointInsert : ''
    }${productNameWithoutSlashes}_${startDate}_${sourceKeyHash}`;
};

export const buildNocList = (ticket: Ticket): string[] => {
    const nocs: string[] = [];

    if ('additionalNocs' in ticket) {
        nocs.push(...ticket.additionalNocs);
    }

    if ('additionalOperators' in ticket) {
        nocs.push(...ticket.additionalOperators.map(op => op.nocCode));
    }

    return nocs;
};

export const netexConvertorHandler = async (event: S3Event): Promise<void> => {
    const { SNS_ALERTS_ARN } = process.env;

    let s3FileName = '';

    try {
        s3FileName = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
        const ticket = await s3.fetchDataFromS3<Ticket>(event);

        const { type } = ticket;

        console.info(`NeTEx generation starting for ${s3FileName}, of type ${type}...`);

        const operatorData: Operator[] = [];

        // get the national operator code (noc) for the base operator
        if ('nocCode' in ticket) {
            const baseNoc = ticket.nocCode;

            // check operatorDetails table in database to see if noc has a record
            const details = await db.getOperatorDetailsByNoc(baseNoc);

            const operatorDetails = await db.getOperatorDataByNocCode([baseNoc]);

            operatorData.push({ ...operatorDetails[0], ...details });
        }

        const nocs: string[] = buildNocList(ticket);

        if (nocs.length > 0) {
            operatorData.push(...(await db.getOperatorDataByNocCode(nocs)));
        }
        const generator = await netexGenerator(ticket, operatorData);

        const generatedNetex = await generator.generate();

        let fileName: string;

        if (process.env.NODE_ENV !== 'development') {
            const nocIdentifier = isSchemeOperatorTicket(ticket) ? getSchemeNocIdentifier(ticket) : ticket.nocCode;
            const filePrefix = getS3FilePrefix(s3FileName, nocIdentifier);
            const fileNameEnding = generateFileName(ticket, s3FileName);
            fileName = `${filePrefix}/${fileNameEnding}.xml`;
        } else {
            fileName = s3FileName.replace('.json', '.xml');
        }

        await s3.uploadNetexToS3(generatedNetex, fileName);

        // this gets logged for grafana
        if (!('nocCode' in ticket) || ticket.nocCode !== 'IWBusCo') {
            const scheme = isSchemeOperatorTicket(ticket) ? 'scheme:' : '';

            const carnet = ticket.carnet ? 'carnet:' : '';

            console.info(`NeTEx generation complete for type ${scheme}${carnet}${type}`);
        }
    } catch (error) {
        console.error(error);

        const sns: SNS = new AWS.SNS();

        const messageParams = {
            Subject: 'NeTEx Convertor',
            Message: `There was an error when converting the NeTEx file: ${s3FileName}`,
            TopicArn: SNS_ALERTS_ARN,
            MessageAttributes: {
                NewStateValue: {
                    DataType: 'String',
                    StringValue: 'ALARM',
                },
            },
        };

        if (process.env.STAGE !== 'dev') {
            await sns.publish(messageParams).promise();
        }

        throw error;
    }
};

export default netexConvertorHandler;
