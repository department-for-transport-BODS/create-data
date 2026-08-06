/* eslint-disable @typescript-eslint/no-explicit-any */
import * as csvUpload from '../../../src/pages/api/csvUpload';
import * as fileUpload from '../../../src/utils/apiUtils/fileUpload';
import * as virusCheck from '../../../src/utils/apiUtils/virusScan';
import * as csvData from '../../testData/csvFareTriangleData';
import * as s3 from '../../../src/data/s3';
import * as sessions from '../../../src/utils/sessions';
import {
    expectedNonCircularReturnTicket,
    expectedSingleTicket,
    getMockRequestAndResponse,
} from '../../testData/mockData';
import logger from '../../../src/utils/logger';
import { containsDuplicateFareStages } from '../../../src/pages/api/csvUpload';
import { ErrorInfo, UserFareStages } from '../../../src/interfaces';
import {
    CSV_UPLOAD_ATTRIBUTE,
    DIRECTION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as auroradb from '../../../src/data/auroradb';
import { ReturnTicket, SingleTicket, WithIds } from '../../../src/interfaces/matchingJsonTypes';

jest.mock('../../../src/data/auroradb');

jest.spyOn(s3, 'putDataInS3');
jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');

describe('csvUpload', () => {
    const loggerSpy = jest.spyOn(logger, 'warn');
    const getFormDataSpy = jest.spyOn(fileUpload, 'getFormData');
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const updateProductFareTriangleModifiedByNocCodeAndIdSpy = jest.spyOn(
        auroradb,
        'updateProductFareTriangleModifiedByNocCodeAndId',
    );

    updateProductFareTriangleModifiedByNocCodeAndIdSpy.mockImplementation().mockResolvedValue();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /csvUpload with an error when the file contains duplicate fare stages', async () => {
        const mockError: ErrorInfo[] = [{ id: 'csv-upload', errorMessage: 'Fare stage names cannot be the same' }];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsvDuplicateFareStages,
            fields: {
                poundsOrPence: ['pence'],
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });
    });

    it('should return 302 redirect to /csvUpload when no file is attached', async () => {
        const mockError: ErrorInfo[] = [{ id: 'csv-upload', errorMessage: 'Select a CSV file to upload' }];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 2,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'string',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: '',
            fields: {
                poundsOrPence: ['pence'],
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });

        expect(loggerSpy).toHaveBeenCalledWith('', {
            context: 'api.utils.processFileUpload',
            message: 'no file attached',
        });
    });

    it('should return 302 redirect to /csvUpload with an error message when a the attached file is too large', async () => {
        const mockError: ErrorInfo[] = [
            { id: 'csv-upload', errorMessage: 'The selected file must be smaller than 5MB' },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999999999999999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });

        expect(loggerSpy).toHaveBeenCalledWith('', {
            context: 'api.utils.validateFile',
            maxSize: 5242880,
            message: 'file is too large',
            size: 999999999999999,
        });
    });

    it('should return 302 redirect to /csvUpload with an error message when the attached file is not a csv', async () => {
        const mockError: ErrorInfo[] = [
            { id: 'csv-upload', errorMessage: 'The selected file must be a .csv or .xlsx' },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/pdf',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });

        expect(loggerSpy).toHaveBeenCalledWith('', {
            context: 'api.utils.validateFile',
            message: 'file not of allowed type',
            type: 'text/pdf',
        });
    });

    it('should put the unparsed data in s3 and the parsed data in s3', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(s3.putDataInS3).toHaveBeenCalledWith(csvData.unprocessedObject.Body, expect.any(String), false);

        expect(s3.putDataInS3).toHaveBeenCalledWith(csvData.processedObject.Body, expect.any(String), true);
    });

    it('should correctly generate data with empty cells and spaces and upload it to S3', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.validTestCsvWithEmptyCellsAndEmptyLine,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(s3.putDataInS3).toHaveBeenCalledWith(
            csvData.unprocessedObjectWithEmptyCells.Body,
            expect.any(String),
            false,
        );

        expect(s3.putDataInS3).toHaveBeenCalledWith(
            csvData.processedObjectWithEmptyCells.Body,
            expect.any(String),
            true,
        );
    });

    it('should correctly generate data with decimal prices when pounds is selected', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.decimalPricesTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(s3.putDataInS3).toHaveBeenCalledWith(
            csvData.unprocessedObjectWithDecimalPrices.Body,
            expect.any(String),
            false,
        );

        expect(s3.putDataInS3).toHaveBeenCalledWith(csvData.processedObject.Body, expect.any(String), true);
    });

    it('should return 302 redirect to /outboundMatching when the happy path is used (ticketer format)', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [DIRECTION_ATTRIBUTE]: {
                    direction: 'outbound',
                    inboundDirection: 'inbound',
                },
            },
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/outboundMatching',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, { errors: [] });
    });

    it('should return 302 redirect to /outboundMatching when the happy path is used (non-ticketer format)', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [DIRECTION_ATTRIBUTE]: {
                    direction: 'outbound',
                    inboundDirection: 'inbound',
                },
            },
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.nonTicketerTestCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/outboundMatching',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, { errors: [] });
    });

    it('should throw an error if the fares triangle data has non-numerical prices', async () => {
        const mockError: ErrorInfo[] = [
            { id: 'csv-upload', errorMessage: 'The selected file contains an invalid price' },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.nonNumericPricesTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pounds',
        });
    });

    it('should throw an error if the fares triangle data has decimal prices and pence is selected', async () => {
        const mockError: ErrorInfo[] = [
            {
                id: 'csv-upload',
                errorMessage: 'The selected file contains a decimal price, all prices must be in pence',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.decimalPricesTestCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });
    });

    it('should return 302 redirect to /matching if the fares triangle data has decimal prices and pounds is selected', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.decimalPricesTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/matching',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: [],
        });
    });

    it('should throw an error if there is an empty fare stage name', async () => {
        const mockError: ErrorInfo[] = [
            {
                id: 'csv-upload',
                errorMessage: 'Fare stage names must not be empty',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.emptyStageNameTestCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });
    });

    it('should throw an error if no prices are set', async () => {
        const mockError: ErrorInfo[] = [
            {
                id: 'csv-upload',
                errorMessage: 'At least one price must be set in the uploaded fares triangle',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.noPricesTestCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });
    });

    it('should return 302 redirect to /matching if the fares triangle data has empty prices', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.missingPricesTestCsv,
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/matching',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, { errors: [] });
    });

    it('should return 302 redirect to /csvUpload with an error message if the file contains a virus', async () => {
        process.env.ENABLE_VIRUS_SCAN = '1';

        const mockError: ErrorInfo[] = [{ id: 'csv-upload', errorMessage: 'The selected file contains a virus' }];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: 'i am a virus',
            fields: {
                poundsOrPence: 'pence',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(true);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pence',
        });
    });

    // when in edit mode tests
    it('should error when the number of fare stages does not match', async () => {
        const mockError: ErrorInfo[] = [
            {
                id: 'csv-upload',
                errorMessage:
                    'The number of fare stages of your updated fares triangle do not match the one you have previously uploaded. Update your triangle, ensuring the number of fare stages match before trying to upload again',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
            },
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.decimalPricesTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pounds',
        });
    });

    it('should error when the number of fare stages matches, but the names do not match', async () => {
        const mockError: ErrorInfo[] = [
            {
                id: 'csv-upload',
                errorMessage:
                    'The name of one or more fare stages of your updated fares triangle does not match what you had have previously uploaded. Update your triangle, ensuring the names of fare stages match before trying to upload again',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: { productId: '1', serviceId: '2', matchingJsonLink: 'blah' },
            },
        });

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.mismatchedNameTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, CSV_UPLOAD_ATTRIBUTE, {
            errors: mockError,
            poundsOrPence: 'pounds',
        });
    });

    it('happy path for single ticket should update prices and redirect to product details page', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
        });

        const updatedSingleTicket = {
            email: 'test@example.com',
            fareZones: [
                {
                    name: 'Acomb Green Lane',
                    prices: [
                        {
                            fareZones: ['Mattison Way', 'Holl Bank/Beech Ave'],
                            price: '2.10',
                        },
                        {
                            fareZones: ['Blossom Street'],
                            price: '4.70',
                        },
                        {
                            fareZones: ['Piccadilly (York)'],
                            price: '6.70',
                        },
                    ],
                    stops: [
                        {
                            atcoCode: '13003521G',
                            indicator: 'W-bound',
                            localityCode: 'E0045956',
                            localityName: 'Peterlee',
                            naptanCode: 'duratdmj',
                            parentLocalityName: '',
                            qualifierName: '',
                            stopName: 'Yoden Way - Chapel Hill Road',
                            street: 'Yodan Way',
                        },
                    ],
                },
                {
                    name: 'Mattison Way',
                    prices: [
                        {
                            fareZones: ['Holl Bank/Beech Ave'],
                            price: '1.10',
                        },
                        {
                            fareZones: ['Blossom Street', 'Piccadilly (York)'],
                            price: '1.70',
                        },
                    ],
                    stops: [
                        {
                            atcoCode: '13003522F',
                            indicator: 'SW-bound',
                            localityCode: 'E0010183',
                            localityName: 'Horden',
                            naptanCode: 'duratdmt',
                            parentLocalityName: '',
                            qualifierName: '',
                            stopName: 'Yoden Way',
                            street: 'Yoden Way',
                        },
                    ],
                },
                {
                    name: 'Holl Bank/Beech Ave',
                    prices: [
                        {
                            fareZones: ['Blossom Street'],
                            price: '1.10',
                        },
                        {
                            fareZones: ['Piccadilly (York)'],
                            price: '1.70',
                        },
                    ],
                    stops: [
                        {
                            atcoCode: '13003219H',
                            indicator: 'NW-bound',
                            localityCode: 'E0045956',
                            localityName: 'Peterlee',
                            naptanCode: 'durapgdw',
                            parentLocalityName: '',
                            qualifierName: '',
                            stopName: 'Surtees Rd-Edenhill Rd',
                            street: 'Surtees Road',
                        },
                    ],
                },
                {
                    name: 'Blossom Street',
                    prices: [
                        {
                            fareZones: ['Piccadilly (York)'],
                            price: '2.00',
                        },
                    ],
                    stops: [
                        {
                            atcoCode: '13003519H',
                            indicator: 'H',
                            localityCode: 'E0045956',
                            localityName: 'Peterlee',
                            naptanCode: 'duratdma',
                            parentLocalityName: '',
                            qualifierName: '',
                            stopName: 'Bus Station',
                            street: 'Bede Way',
                        },
                    ],
                },
                {
                    name: 'Piccadilly (York)',
                    prices: [],
                    stops: [
                        {
                            atcoCode: '13003345D',
                            indicator: 'SE-bound',
                            localityCode: 'E0010183',
                            localityName: 'Horden',
                            naptanCode: 'duraptwp',
                            parentLocalityName: '',
                            qualifierName: '',
                            stopName: 'Kell Road',
                            street: 'Kell Road',
                        },
                    ],
                },
            ],
            journeyDirection: 'inbound',
            lineId: 'q2gv2ve',
            lineName: '215',
            nocCode: 'DCCL',
            operatorName: 'DCC',
            passengerType: {
                id: 9,
            },
            products: [
                {
                    salesOfferPackages: [
                        {
                            id: 1,
                            price: undefined,
                        },
                        {
                            id: 2,
                            price: undefined,
                        },
                    ],
                },
            ],
            serviceDescription: 'Worthing - Seaham - Crawley',
            termTime: true,
            ticketPeriod: {
                endDate: '2024-12-18T09:30:46.0Z',
                startDate: '2020-12-17T09:30:46.0Z',
            },
            timeRestriction: {
                id: 2,
            },
            type: 'single',
            unassignedStops: {
                singleUnassignedStops: [
                    {
                        atcoCode: 'GHI',
                    },
                ],
            },
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
        };

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.matchedNameTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            updatedSingleTicket,
            'matchingJsonLink',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });
    });

    it('happy path for return ticket should update prices and redirect to product details page', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedNonCircularReturnTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
        });

        const updatedReturnTicket = {
            type: 'return',
            passengerType: {
                id: 9,
            },
            lineName: '215',
            lineId: 'q2gv2ve',
            nocCode: 'DCCL',
            operatorName: 'DCC',
            serviceDescription: 'Worthing - Seaham - Crawley',
            email: 'test@example.com',
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
            timeRestriction: {
                id: 2,
            },
            ticketPeriod: {
                startDate: '2020-12-17T09:30:46.0Z',
                endDate: '2020-12-18T09:30:46.0Z',
            },
            products: [
                {
                    salesOfferPackages: [
                        {
                            id: 1,
                        },
                        {
                            id: 2,
                        },
                    ],
                },
            ],
            inboundFareZones: [
                {
                    name: 'Acomb Green Lane',
                    stops: [
                        {
                            stopName: 'Yoden Way - Chapel Hill Road',
                            naptanCode: 'duratdmj',
                            atcoCode: '13003521G',
                            localityCode: 'E0045956',
                            parentLocalityName: '',
                            localityName: 'Peterlee',
                            indicator: 'W-bound',
                            street: 'Yodan Way',
                            qualifierName: '',
                        },
                    ],
                    prices: [
                        {
                            price: '2.10',
                            fareZones: ['Mattison Way', 'Holl Bank/Beech Ave'],
                        },
                        {
                            price: '4.70',
                            fareZones: ['Blossom Street'],
                        },
                        {
                            price: '6.70',
                            fareZones: ['Piccadilly (York)'],
                        },
                    ],
                },
                {
                    name: 'Mattison Way',
                    stops: [
                        {
                            stopName: 'Yoden Way',
                            naptanCode: 'duratdmt',
                            atcoCode: '13003522F',
                            localityCode: 'E0010183',
                            parentLocalityName: '',
                            localityName: 'Horden',
                            indicator: 'SW-bound',
                            street: 'Yoden Way',
                            qualifierName: '',
                        },
                    ],
                    prices: [
                        {
                            price: '1.10',
                            fareZones: ['Holl Bank/Beech Ave'],
                        },
                        {
                            price: '1.70',
                            fareZones: ['Blossom Street', 'Piccadilly (York)'],
                        },
                    ],
                },
                {
                    name: 'Holl Bank/Beech Ave',
                    stops: [
                        {
                            stopName: 'Surtees Rd-Edenhill Rd',
                            naptanCode: 'durapgdw',
                            atcoCode: '13003219H',
                            localityCode: 'E0045956',
                            parentLocalityName: '',
                            localityName: 'Peterlee',
                            indicator: 'NW-bound',
                            street: 'Surtees Road',
                            qualifierName: '',
                        },
                    ],
                    prices: [
                        {
                            price: '1.10',
                            fareZones: ['Blossom Street'],
                        },
                        {
                            price: '1.70',
                            fareZones: ['Piccadilly (York)'],
                        },
                    ],
                },
                {
                    name: 'Blossom Street',
                    stops: [
                        {
                            stopName: 'Bus Station',
                            naptanCode: 'duratdma',
                            atcoCode: '13003519H',
                            localityCode: 'E0045956',
                            parentLocalityName: '',
                            localityName: 'Peterlee',
                            indicator: 'H',
                            street: 'Bede Way',
                            qualifierName: '',
                        },
                    ],
                    prices: [
                        {
                            price: '2.00',
                            fareZones: ['Piccadilly (York)'],
                        },
                    ],
                },
                {
                    name: 'Piccadilly (York)',
                    stops: [
                        {
                            stopName: 'Kell Road',
                            naptanCode: 'duraptwp',
                            atcoCode: '13003345D',
                            localityCode: 'E0010183',
                            parentLocalityName: '',
                            localityName: 'Horden',
                            indicator: 'SE-bound',
                            street: 'Kell Road',
                            qualifierName: '',
                        },
                    ],
                    prices: [],
                },
            ],
            outboundFareZones: [
                {
                    name: 'Acomb Green Lane',
                    stops: [
                        {
                            stopName: 'Yoden Way - Chapel Hill Road',
                            atcoCode: '13003521G',
                            localityCode: 'E0045956',
                            naptanCode: 'duratdmj',
                            parentLocalityName: '',
                            localityName: 'Peterlee',
                            indicator: 'W-bound',
                            street: 'Yodan Way',
                            qualifierName: '',
                        },
                    ],
                    prices: [
                        {
                            price: '2.10',
                            fareZones: ['Mattison Way', 'Holl Bank/Beech Ave'],
                        },
                        {
                            price: '4.70',
                            fareZones: ['Blossom Street'],
                        },
                        {
                            price: '6.70',
                            fareZones: ['Piccadilly (York)'],
                        },
                    ],
                },
            ],
            unassignedStops: {
                inboundUnassignedStops: [
                    {
                        atcoCode: 'GHI',
                    },
                ],
                outboundUnassignedStops: [
                    {
                        atcoCode: 'GHI',
                    },
                ],
            },
        };

        const file: any = {
            'csv-upload': [
                {
                    size: 999,
                    filepath: 'string',
                    originalFilename: 'string',
                    mimetype: 'text/csv',
                    toJSON(): any {
                        return '';
                    },
                },
            ],
        };

        getFormDataSpy.mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.matchedNameTestCsv,
            fields: {
                poundsOrPence: 'pounds',
            },
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvUpload.default(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            updatedReturnTicket,
            'matchingJsonLink',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1&serviceId=2',
        });
    });
});

describe('helper functions', () => {
    it('getNamesOfFareZones returns array of fare zone names for single tickets', () => {
        const ticket: WithIds<SingleTicket> = expectedSingleTicket;
        const expectedResult = [
            'Acomb Green Lane',
            'Mattison Way',
            'Holl Bank/Beech Ave',
            'Blossom Street',
            'Piccadilly (York)',
        ];

        const result = csvUpload.getNamesOfFareZones(ticket);

        expect(result).toEqual(expectedResult);
    });

    it('getNamesOfFareZones returns array of fare zone names for return tickets', () => {
        const ticket: WithIds<ReturnTicket> = expectedNonCircularReturnTicket;
        const expectedResult = [
            'Acomb Green Lane',
            'Mattison Way',
            'Holl Bank/Beech Ave',
            'Blossom Street',
            'Piccadilly (York)',
        ];

        const result = csvUpload.getNamesOfFareZones(ticket);

        expect(result).toEqual(expectedResult);
    });

    it('ensures the thereIsAFareStageNameMismatch function returns false when there is no mismatch', () => {
        const fareTriangleData: UserFareStages = {
            fareStages: [
                {
                    stageName: 'Acomb Green Lane',
                    prices: [],
                },
                {
                    stageName: 'Mattison Way',
                    prices: [],
                },
                {
                    stageName: 'Holl Bank/Beech Ave',
                    prices: [],
                },
            ],
        };

        const fareZoneNames = ['Acomb Green Lane', 'Mattison Way', 'Holl Bank/Beech Ave'];

        const result = csvUpload.thereIsAFareStageNameMismatch(fareTriangleData, fareZoneNames);

        expect(result).toBe(false);
    });

    it('ensures the thereIsAFareStageNameMismatch function returns true when there is no mismatch', () => {
        const fareTriangleData: UserFareStages = {
            fareStages: [
                {
                    stageName: 'Acomb Green Lane',
                    prices: [],
                },
                {
                    stageName: 'Teeside Avenue',
                    prices: [],
                },
                {
                    stageName: 'Holl Bank/Beech Ave',
                    prices: [],
                },
            ],
        };

        const fareZoneNames = ['Acomb Green Lane', 'Mattison Way', 'Holl Bank/Beech Ave'];

        const result = csvUpload.thereIsAFareStageNameMismatch(fareTriangleData, fareZoneNames);

        expect(result).toBe(true);
    });

    it('returns true if the array has duplicates', () => {
        const fareStagesNames: string[] = ['test', 'test', 'test2', 'test4'];

        expect(containsDuplicateFareStages(fareStagesNames)).toBeTruthy();
    });

    it('returns false if the array has no duplicates', () => {
        const fareStagesNames: string[] = ['test', 'test44', 'test2', 'test4'];

        expect(containsDuplicateFareStages(fareStagesNames)).toBeFalsy();
    });
});
