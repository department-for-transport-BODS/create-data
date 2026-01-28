import { S3Event } from 'aws-lambda';
import AWS from 'aws-sdk';

export interface S3ObjectParameters {
    Bucket: string;
    Key: string;
}

const getS3Client = (): AWS.S3 => {
    let options = {};

    if (process.env.NODE_ENV === 'development') {
        options = {
            s3ForcePathStyle: true,
            accessKeyId: 'S3RVER',
            secretAccessKey: 'S3RVER',
            endpoint: new AWS.Endpoint('http://127.0.0.1:4566'),
            region: 'eu-west-2',
        };
    }

    return new AWS.S3(options);
};

const s3 = getS3Client();

export const getFileFromS3 = async (params: S3ObjectParameters): Promise<string> => {
    const data = await s3.getObject(params).promise();
    return data.Body?.toString('utf-8') ?? '';
};

export const fileNameExistsAlready = async (fileName: string): Promise<boolean> => {
    try {
        const s3BucketName = process.env.UNVALIDATED_NETEX_BUCKET as string;

        const params: S3ObjectParameters = {
            Bucket: s3BucketName,
            Key: fileName,
        };

        const dataAsString: string = await getFileFromS3(params);

        return !!JSON.parse(dataAsString);
    } catch (err) {
        return false;
    }
};

export const fetchDataFromS3 = async <T>(event: S3Event, isEmailer = false): Promise<T> => {
    try {
        const s3BucketName: string = !isEmailer
            ? event.Records[0].s3.bucket.name
            : process.env.MATCHING_DATA_BUCKET || '';

        const s3FileName: string = !isEmailer
            ? decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '))
            : event.Records[0].s3.object.key.replace('.xml', '.json');

        const params: S3ObjectParameters = {
            Bucket: s3BucketName,
            Key: s3FileName,
        };

        const dataAsString: string = await getFileFromS3(params);

        return JSON.parse(dataAsString);
    } catch (err) {
        throw new Error(`Error in retrieving data. ${(err as Error).stack}`);
    }
};

export const uploadNetexToS3 = async (netex: string, fileName: string): Promise<void> => {
    try {
        console.info(`Uploading file: ${fileName}`);

        await s3
            .putObject({
                Bucket: process.env.UNVALIDATED_NETEX_BUCKET as string,
                Key: fileName,
                ContentType: 'application/xml',
                Body: Buffer.from(netex, 'utf8'),
            })
            .promise();
    } catch (err) {
        throw new Error(`Error uploading netex to S3. ${(err as Error).stack}`);
    }
};
