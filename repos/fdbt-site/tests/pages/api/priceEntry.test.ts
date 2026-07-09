import * as s3 from '../../../src/data/s3';
import priceEntry, { inputsValidityCheck } from '../../../src/pages/api/priceEntry';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { DIRECTION_ATTRIBUTE } from '../../../src/constants/attributes';

jest.mock('../../../src/data/s3');

describe('priceEntry', () => {
    describe('API validation of number of price inputs', () => {
        it('should return fares information with no errors if inputs are valid', () => {
            const { req } = getMockRequestAndResponse({
                cookieValues: {},
                body: {
                    'Acomb Lane-Canning': '100',
                    'BewBush-Canning': '120',
                    'BewBush-Acomb Lane': '1120',
                    'Chorlton-Canning': '140',
                    'Chorlton-Acomb Lane': '160',
                    'Chorlton-BewBush': '100',
                    'Crawley-Canning': '120',
                    'Crawley-Acomb Lane': '140',
                    'Crawley-BewBush': '160',
                    'Crawley-Chorlton': '',
                    'Cranfield-Canning': '120',
                    'Cranfield-Acomb Lane': '140',
                    'Cranfield-BewBush': '160',
                    'Cranfield-Chorlton': '140',
                    'Cranfield-Crawley': '',
                },
            });
            const result = inputsValidityCheck(req);
            expect(result.errorInformation.length).toBe(0);
        });

        it('should return fares information with errors if the inputs contains invalid data but not for empty prices', () => {
            const { req } = getMockRequestAndResponse({
                cookieValues: {},
                body: {
                    'Acomb Lane-Canning': '',
                    'BewBush-Canning': '120',
                    'BewBush-Acomb Lane': '1120',
                    'Chorlton-Canning': 'd',
                    'Chorlton-Acomb Lane': '160',
                    'Chorlton-BewBush': '100',
                    'Crawley-Canning': 'd',
                    'Crawley-Acomb Lane': '140',
                    'Crawley-BewBush': '160',
                    'Crawley-Chorlton': '',
                    'Cranfield-Canning': '120',
                    'Cranfield-Acomb Lane': '140',
                    'Cranfield-BewBush': '160',
                    'Cranfield-Chorlton': '140',
                    'Cranfield-Crawley': '120',
                },
            });
            const result = inputsValidityCheck(req);
            expect(result.errorInformation.length).toBe(2);
        });
    });

    describe('API validation of format of price inputs', () => {
        const writeHeadMock = jest.fn();
        const putDataInS3Spy = jest.spyOn(s3, 'putStringInS3');
        putDataInS3Spy.mockImplementation(() => Promise.resolve());

        afterEach(() => {
            jest.clearAllMocks();
        });

        const cases: {}[] = [
            [{}, { Location: '/error' }],
            [{ 'Crawley-Acomb Lane': '0' }, { Location: '/outboundMatching' }],
            [{ 'Crawley-Acomb Lane': '100' }, { Location: '/outboundMatching' }],
            [{ 'Acomb Lane-Canning': 'fgrgregw' }, { Location: '/priceEntry' }],
            [{ 'Cranfield-Crawley': '1.2' }, { Location: '/priceEntry' }],
            [{ 'Acomb Lane-Chorlton': '[].. r43' }, { Location: '/priceEntry' }],
        ];

        test.each(cases)('given %p as request, redirects to %p', async (testData, expectedLocation) => {
            const { req, res } = getMockRequestAndResponse({
                cookieValues: {},
                body: testData,
                uuid: {},
                mockWriteHeadFn: writeHeadMock,
                session: {
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                        inboundDirection: 'inbound',
                    },
                },
            });
            await priceEntry(req, res);
            expect(writeHeadMock).toHaveBeenCalledWith(302, expectedLocation);
        });
    });
});
