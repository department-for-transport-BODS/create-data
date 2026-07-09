/* eslint-disable @typescript-eslint/no-explicit-any */
import { expectedFlatFareGeoZoneTicketWithExemptions, getMockRequestAndResponse } from '../../testData/mockData';
import * as csvZoneUpload from '../../../src/pages/api/csvZoneUpload';
import * as fileUpload from '../../../src/utils/apiUtils/fileUpload';
import * as virusCheck from '../../../src/utils/apiUtils/virusScan';
import * as csvData from '../../testData/csvZoneData';
import * as s3 from '../../../src/data/s3';
import * as sessions from '../../../src/utils/sessions';
import * as auroradb from '../../../src/data/auroradb';
import {
    FARE_ZONE_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as userData from '../../../src/utils/apiUtils/userData';
import { FileJSON } from 'formidable';

jest.mock('../../../src/data/s3');
jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/utils/apiUtils/fileUpload');
jest.mock('../../../src/utils/apiUtils/virusScan');

const putDataInS3Spy = jest.spyOn(s3, 'putDataInS3');
jest.mock('../../../src/data/auroradb');
jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');

describe('csvZoneUpload', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const { req, res } = getMockRequestAndResponse({
        cookieValues: {},
        body: null,
        uuid: {},
        mockWriteHeadFn: writeHeadMock,
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it.each([
        [csvData.testCsv, csvData.unprocessedTestCsv.Body, csvData.processedTestCsv.Body],
        [
            csvData.testCsvWithEmptyCells,
            csvData.unprocessedTestCsvWithEmptyCells.Body,
            csvData.processedTestCsvWithEmptyCells.Body,
        ],
    ])(
        'should put the unprocessed data in S3 as a csv and the processed data in S3 as json',
        async (csv, expectedUnprocessed, expectedProcessed) => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): FileJSON {
                        return '' as unknown as FileJSON;
                    },
                },
            };

            jest.spyOn(fileUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    name: 'file',
                    files: file,
                    fileContents: csv,
                    fields: { exempt: 'no' },
                });

            jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

            jest.spyOn(auroradb, 'getAtcoCodesByNaptanCodes')
                .mockImplementation()
                .mockResolvedValue([{ atcoCode: 'TestATCO-TC5', naptanCode: 'TestNaptan-TC5' }]);

            await csvZoneUpload.default(req, res);

            expect(putDataInS3Spy.mock.calls).toEqual([
                [expectedUnprocessed, expect.any(String), false],
                [expectedProcessed, expect.any(String), true],
            ]);
        },
    );

    it('should return 302 redirect to /multipleProducts when valid a valid file is processed and put in S3', async () => {
        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): FileJSON {
                    return '' as unknown as FileJSON;
                },
            },
        };

        jest.spyOn(fileUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                name: 'file',
                files: file,
                fileContents: csvData.testCsv,
                fields: { exempt: 'no' },
            });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvZoneUpload.default(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/multipleProducts',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, 'Town Centre');
    });

    it('should return 302 redirect to /multipleProducts when valid a service is exempted and valid file is processed and put in S3', async () => {
        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): FileJSON {
                    return '' as unknown as FileJSON;
                },
            },
        };

        jest.spyOn(fileUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                name: 'file',
                files: file,
                fileContents: csvData.testCsv,
                fields: {
                    exempt: 'yes',
                    '1#4YyoI0#NW_05_BLAC_1_1': 'FLEETWOOD - BLACKPOOL via Promenade',
                    '2C#vySmfewe0#NW_05_BLAC_2C_1': 'KNOTT END - POULTON - BLACKPOOL',
                    '3#Jk79kC#NW_05_BLAC_3_1': 'MERESIDE - BLACKPOOL - CLEVELEYS - CLEVELEYS PARK',
                },
            });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        const selectedServices = {
            selectedServices: [
                {
                    lineId: '4YyoI0',
                    lineName: '1',
                    serviceCode: 'NW_05_BLAC_1_1',
                    serviceDescription: 'FLEETWOOD - BLACKPOOL via Promenade',
                    startDate: undefined,
                },
                {
                    lineId: 'vySmfewe0',
                    lineName: '2C',
                    serviceCode: 'NW_05_BLAC_2C_1',
                    serviceDescription: 'KNOTT END - POULTON - BLACKPOOL',
                    startDate: undefined,
                },
                {
                    lineId: 'Jk79kC',
                    lineName: '3',
                    serviceCode: 'NW_05_BLAC_3_1',
                    serviceDescription: 'MERESIDE - BLACKPOOL - CLEVELEYS - CLEVELEYS PARK',
                    startDate: undefined,
                },
            ],
        };

        await csvZoneUpload.default(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/multipleProducts',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, 'Town Centre');
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SERVICE_LIST_EXEMPTION_ATTRIBUTE, selectedServices);
    });
    it('should update exemptions, zoneName and stops when in edit mode and redirect to product details page', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedFlatFareGeoZoneTicketWithExemptions,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '1',
                    serviceId: '2',
                    matchingJsonLink: 'matchingJsonLink',
                },
            },
        });

        const stops = expectedFlatFareGeoZoneTicketWithExemptions.stops.splice(0, -1);

        const updatedTicket = {
            operatorName: 'test',
            passengerType: { id: 9 },
            type: 'flatFare',
            nocCode: 'TEST',
            uuid: '1e0459b3-082e-4e70-89db-96e8ae173e10',
            email: 'test@example.com',
            zoneName: 'Edited Town Centre',
            stops,
            ticketPeriod: {
                startDate: '2020-12-17T09:30:46.0Z',
                endDate: '2020-12-18T09:30:46.0Z',
            },
            products: [
                {
                    productName: 'Flat fare with geo zone',
                    productPrice: '7',
                    salesOfferPackages: [
                        {
                            id: 1,
                            price: undefined,
                        },
                        {
                            id: 3,
                            price: undefined,
                        },
                    ],
                },
            ],
            exemptedServices: [
                {
                    lineId: '4YyoI0',
                    lineName: '1',
                    serviceCode: 'NW_05_BLAC_1_1',
                    serviceDescription: 'FLEETWOOD - BLACKPOOL via Promenade',
                    startDate: undefined,
                },
                {
                    lineId: 'vySmfewe0',
                    lineName: '2C',
                    serviceCode: 'NW_05_BLAC_2C_1',
                    serviceDescription: 'KNOTT END - POULTON - BLACKPOOL',
                    startDate: undefined,
                },
            ],
        };

        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): any {
                    return '';
                },
            },
        };

        jest.spyOn(fileUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                name: 'file',
                files: file,
                fileContents: csvData.secondTestCsv,
                fields: {
                    exempt: 'yes',
                    '1#4YyoI0#NW_05_BLAC_1_1': 'FLEETWOOD - BLACKPOOL via Promenade',
                    '2C#vySmfewe0#NW_05_BLAC_2C_1': 'KNOTT END - POULTON - BLACKPOOL',
                },
            });

        jest.spyOn(auroradb, 'batchGetStopsByAtcoCode').mockImplementation().mockResolvedValue(stops);

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvZoneUpload.default(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            updatedTicket,
            'matchingJsonLink',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=1',
        });
    });

    it('should return 302 redirect to /searchOperators if fareType is multiOperator, and when valid file is processed and put in S3', async () => {
        const multiOperatorReq = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            session: {
                [FARE_TYPE_ATTRIBUTE]: { fareType: 'multiOperator' },
            },
        }).req;

        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): FileJSON {
                    return '' as unknown as FileJSON;
                },
            },
        };

        jest.spyOn(fileUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                name: 'file',
                files: file,
                fileContents: csvData.testCsv,
                fields: { exempt: 'no' },
            });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvZoneUpload.default(multiOperatorReq, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/reuseOperatorGroup',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(multiOperatorReq, FARE_ZONE_ATTRIBUTE, 'Town Centre');
    });

    it('should redirect to /error when an error is thrown in the default', async () => {
        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): FileJSON {
                    return '' as unknown as FileJSON;
                },
            },
        };
        const auroradbError = 'Could not fetch data from auroradb in test';

        jest.spyOn(fileUpload, 'getFormData').mockImplementation().mockResolvedValue({
            name: 'file',
            files: file,
            fileContents: csvData.testCsvWithEmptyCells,
        });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        jest.spyOn(auroradb, 'getAtcoCodesByNaptanCodes').mockImplementation(() => {
            throw new Error(auroradbError);
        });

        await csvZoneUpload.default(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });

    it('should redirect to /csvZoneUpload when an user selected yes in exempt service but not selected any service', async () => {
        const file = {
            'csv-upload': {
                size: 999,
                path: 'string',
                name: 'string',
                type: 'text/csv',
                toJSON(): FileJSON {
                    return '' as unknown as FileJSON;
                },
            },
        };

        jest.spyOn(fileUpload, 'getFormData')
            .mockImplementation()
            .mockResolvedValue({
                name: 'file',
                files: file,
                fileContents: csvData.testCsvWithEmptyCells,
                fields: { exempt: 'yes' },
            });

        jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

        await csvZoneUpload.default(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SERVICE_LIST_EXEMPTION_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose at least one service from the options', id: 'checkbox-0' }],
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/csvZoneUpload',
        });
    });

    describe('fileIsValid', () => {
        it('should return 302 redirect to /csvZoneUpload when an empty file is attached', async () => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): FileJSON {
                        return '' as unknown as FileJSON;
                    },
                },
            };

            jest.spyOn(fileUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    name: 'file',
                    files: file,
                    fileContents: '',
                    fields: { exempt: 'no' },
                });

            jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toHaveBeenCalledWith(302, {
                Location: '/csvZoneUpload',
            });

            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, {
                errors: [
                    {
                        errorMessage: 'Select a CSV file to upload',
                        id: 'csv-upload',
                    },
                ],
            });
        });

        it('should return 302 redirect to /csvZoneUpload with an error message when file is too big', async () => {
            const file = {
                'csv-upload': {
                    size: 6000000,
                    path: 'string',
                    name: 'string',
                    type: 'text/csv',
                    toJSON(): FileJSON {
                        return '' as unknown as FileJSON;
                    },
                },
            };

            jest.spyOn(fileUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    name: 'file',
                    files: file,
                    fileContents: csvData.testCsv,
                    fields: { exempt: 'no' },
                });

            jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toHaveBeenCalledWith(302, {
                Location: '/csvZoneUpload',
            });

            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, {
                errors: [
                    {
                        errorMessage: 'The selected file must be smaller than 5MB',
                        id: 'csv-upload',
                    },
                ],
            });
        });

        it('should return 302 redirect to /csvZoneUpload with an error message when file is not an allowed type', async () => {
            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/pdf',
                    toJSON(): FileJSON {
                        return '' as unknown as FileJSON;
                    },
                },
            };

            jest.spyOn(fileUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    name: 'file',
                    files: file,
                    fileContents: csvData.testCsv,
                    fields: { exempt: 'no' },
                });

            jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(false);

            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toHaveBeenCalledWith(302, {
                Location: '/csvZoneUpload',
            });

            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, {
                errors: [
                    {
                        errorMessage: 'The selected file must be a .csv or .xlsx',
                        id: 'csv-upload',
                    },
                ],
            });
        });

        it('should return 302 redirect to /csvZoneUpload with an error message when file contains a virus', async () => {
            process.env.ENABLE_VIRUS_SCAN = '1';

            const file = {
                'csv-upload': {
                    size: 999,
                    path: 'string',
                    name: 'string',
                    type: 'text/pdf',
                    toJSON(): FileJSON {
                        return '' as unknown as FileJSON;
                    },
                },
            };

            jest.spyOn(fileUpload, 'getFormData')
                .mockImplementation()
                .mockResolvedValue({
                    name: 'file',
                    files: file,
                    fileContents: 'i am a virus',
                    fields: { exempt: 'no' },
                });

            jest.spyOn(virusCheck, 'containsViruses').mockImplementation().mockResolvedValue(true);

            await csvZoneUpload.default(req, res);

            expect(writeHeadMock).toHaveBeenCalledWith(302, {
                Location: '/csvZoneUpload',
            });

            expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, FARE_ZONE_ATTRIBUTE, {
                errors: [
                    {
                        errorMessage: 'The selected file contains a virus',
                        id: 'csv-upload',
                    },
                ],
            });
        });
    });

    describe('processCsv', () => {
        it.each([
            [csvData.testCsvWithEmptyLines, csvData.processedTestCsvWithEmptyLines.Body],
            [csvData.testCsvWithEmptyLinesAndEmptyCells, csvData.processedTestCsvWithEmptyLinesAndEmptyCells.Body],
        ])('should skip empty lines in the csv', async (fileContent, expectedProcessed) => {
            jest.spyOn(auroradb, 'getAtcoCodesByNaptanCodes')
                .mockImplementation()
                .mockResolvedValue([{ atcoCode: 'TestATCO-TC4', naptanCode: 'TestNaptan-TC4' }]);

            const result = await csvZoneUpload.processCsv(fileContent, req, res);

            expect(result).toEqual(expectedProcessed);
        });

        it('returns null when a csv upload contains no stops info', async () => {
            const fileContent = csvData.testCsvWithNoStopsInfo;
            jest.spyOn(auroradb, 'getAtcoCodesByNaptanCodes').mockImplementation().mockResolvedValue([]);

            const result = await csvZoneUpload.processCsv(fileContent, req, res);

            expect(result).toBeNull();
        });
    });

    describe('getAtcoCodesForStops', () => {
        it('should return an array of UserFareZone objects when called with an array of naptan codes', async () => {
            const mockRawUserFareZones = csvData.partProcessedTestCsvWithEmptyCells.Body;
            const mockNaptanCodesToQuery: string[] = ['TestNaptan-TC5'];
            const expectedUserFareZones = csvData.processedTestCsvWithEmptyCells.Body;

            jest.spyOn(auroradb, 'getAtcoCodesByNaptanCodes')
                .mockImplementation()
                .mockResolvedValue([{ atcoCode: 'TestATCO-TC5', naptanCode: 'TestNaptan-TC5' }]);

            const mockUserFareZones = await csvZoneUpload.getAtcoCodesForStops(
                mockRawUserFareZones,
                mockNaptanCodesToQuery,
            );
            expect(mockUserFareZones).toEqual(expectedUserFareZones);
        });
    });
});
