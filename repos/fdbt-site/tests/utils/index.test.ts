import { NextPageContext } from 'next';
import { IncomingMessage } from 'http';
import {
    sentenceCaseString,
    getHost,
    formatStopName,
    getAttributeFromIdToken,
    getAndValidateSchemeOpRegion,
    isSchemeOperator,
    objectKeyMatchesExportNameExactly,
    formatFailedFileNames,
    fareTypeIsAllowedToAddACap,
    removeDuplicateServices,
} from '../../src/utils';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import { OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { dateIsOverThirtyMinutesAgo, isADayOfTheWeek, exportHasStarted } from '../../src/utils/apiUtils';
import { Stop } from '../../src/interfaces/matchingJsonTypes';
import { MyFaresService, ServiceType } from '../../src/interfaces';

describe('index', () => {
    describe('getHost', () => {
        it('should return http when host is localhost', () => {
            const expected = 'http://localhost';
            const req = {
                headers: {
                    host: 'localhost',
                    origin: 'localhost',
                },
            } as unknown as IncomingMessage;
            const result = getHost(req);
            expect(result).toEqual(expected);
        });

        it('should return https when host not localhost', () => {
            const expected = 'https://a.com';
            const req = {
                headers: {
                    host: 'a.com',
                    origin: 'https://a.com',
                },
            } as unknown as IncomingMessage;
            const result = getHost(req);
            expect(result).toEqual(expected);
        });
    });

    describe('formatFailedFileNames', () => {
        it('correctly returns the text with only the product names', () => {
            const fileNames = [
                'FX-PI-01_UK_LNUD_LINE-FARE_1_eeee-return_2022-11-15_2020-02-01_7628.xml',
                'FX-PI-01_UK_LNUD_LINE-FARE_Carnet_2022-11-15_2020-02-01_3237.xml',
                'FX-PI-01_UK_LNUD_NETWORK-FARE_Carnet-product-superb_2022-11-15_2020-02-01_3cc9.xml',
            ];
            const result = formatFailedFileNames(fileNames);

            expect(result).toEqual('1_eeee-return, Carnet, Carnet-product-superb');
        });
    });

    describe('formatStopName', () => {
        const allFields: Stop = {
            stopName: 'Test Stop',
            naptanCode: '12345',
            atcoCode: 'gvgvxgasvx',
            localityCode: 'GHS167',
            localityName: 'Test Town',
            indicator: 'SE',
            street: 'Test Street',
            parentLocalityName: 'Another town',
        };

        const noLocalityName: Stop = {
            stopName: 'Test Stop',
            naptanCode: '12345',
            atcoCode: 'gvgvxgasvx',
            localityCode: 'GHS167',
            localityName: '',
            indicator: 'SE',
            street: 'Test Street',
            parentLocalityName: 'different town',
        };

        const noStreet: Stop = {
            stopName: 'Test Stop',
            naptanCode: '12345',
            atcoCode: 'gvgvxgasvx',
            localityCode: 'GHS167',
            localityName: 'Test Town',
            indicator: 'SE',
            street: '',
            parentLocalityName: 'yorkshire town',
        };

        const testCases = [
            [allFields, 'Test Town, SE Test Stop (on Test Street)'],
            [noLocalityName, 'SE Test Stop (on Test Street)'],
            [noStreet, 'Test Town, SE Test Stop'],
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        it.each(testCases)('correctly formats stop name for given naptan data', (naptanData: any, expected) => {
            const formattedName = formatStopName(naptanData);

            expect(formattedName).toBe(expected);
        });
    });

    describe('getAttributeFromIdToken', () => {
        let emailJwt: string;
        let ctx: NextPageContext;

        beforeEach(() => {
            // This JWT encodes an email of test@example.com
            emailJwt =
                'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.pwd0gdkeSRBqRpoNKxC8lK3SuydPKqKPRRdEE-eNEc0';
            ctx = getMockContext({
                cookies: {
                    idToken: emailJwt,
                },
            });
        });

        it('should retrieve given attribute if present', () => {
            const email = getAttributeFromIdToken(ctx, 'email');

            expect(email).toBe('test@example.com');
        });

        it('should return null if not present', () => {
            const email = getAttributeFromIdToken(ctx, 'custom:noc');

            expect(email).toBeNull();
        });
    });

    describe('getAndValidateSchemeOpRegion', () => {
        it('should return the scheme operator region code when the logged in user is a scheme operator', () => {
            const ctx = getMockContext({
                cookies: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                },
            });
            const region = getAndValidateSchemeOpRegion(ctx);
            expect(region).toBe('SCHEME_REGION');
        });

        it('should return null when the logged in user is not a scheme operator', () => {
            const ctx = getMockContext();
            const region = getAndValidateSchemeOpRegion(ctx);
            expect(region).toEqual(null);
        });

        it('should throw an error when the idToken and OPERATOR_ATTRIBUTE do not match', () => {
            const ctx = getMockContext({ cookies: { idToken: mockSchemOpIdToken } });
            expect(() => getAndValidateSchemeOpRegion(ctx)).toThrow();
        });
    });

    describe('isSchemeOperator', () => {
        it('should return true when the user logged in is a scheme operator', () => {
            const ctx = getMockContext({
                cookies: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                },
            });
            const res = isSchemeOperator(ctx);
            expect(res).toEqual(true);
        });

        it('should return false when the user logged in is not a scheme operator', () => {
            const ctx = getMockContext();
            const res = isSchemeOperator(ctx);
            expect(res).toEqual(false);
        });
    });

    describe('sentenceCaseString', () => {
        it.each([
            ['bankHoliday', 'Bank holiday'],
            ['singleFareChildTicket', 'Single fare child ticket'],
            ['default', 'Default'],
        ])('should turn %s into %s', (input, expectedOutput) => {
            expect(sentenceCaseString(input)).toBe(expectedOutput);
        });
    });

    describe('objectKeyMatchesExportNameExactly', () => {
        it('returns true if the object key exactly matches', () => {
            const objectKey = 'BLAC/exports/BLAC_2022_09_29/BLACa425b06c_1664468477977.json';
            const exportName = 'BLAC_2022_09_29';
            const result = objectKeyMatchesExportNameExactly(objectKey, exportName);

            expect(result).toBeTruthy();
        });

        it('returns false if the object key has an extra number on the end', () => {
            const objectKey = 'BLAC/exports/BLAC_2022_09_29_1/BLACa425b06c_1664468477977.json';
            const exportName = 'BLAC_2022_09_29';
            const result = objectKeyMatchesExportNameExactly(objectKey, exportName);

            expect(result).toBeFalsy();
        });

        it('returns false if the object key is completely different', () => {
            const objectKey = 'BLAC/exports/BLAC_2021_02_23/BLACa425b06c_1664468477977.json';
            const exportName = 'BLAC_2022_09_29';
            const result = objectKeyMatchesExportNameExactly(objectKey, exportName);

            expect(result).toBeFalsy();
        });

        it('returns true if the object key is the same and its a zip instead', () => {
            const objectKey = 'BLAC/zips/BLAC_2022_09_29/BLAC_2022_09_29.zip';
            const exportName = 'BLAC_2022_09_29';
            const result = objectKeyMatchesExportNameExactly(objectKey, exportName);

            expect(result).toBeTruthy();
        });
    });

    describe('dateIsOverThirtyMinutesAgo', () => {
        it('returns true if the date is over thirty minutes ago', () => {
            const result = dateIsOverThirtyMinutesAgo(new Date('2022-06-17T03:24:00'));

            expect(result).toBeTruthy();
        });

        it('returns false if the date is less than thirty minutes ago', () => {
            const date = new Date();
            const result = dateIsOverThirtyMinutesAgo(date);

            expect(result).toBeFalsy();
        });
    });

    describe('isADayOfTheWeek', () => {
        it('returns false if day is undefined', () => {
            const result = isADayOfTheWeek(undefined);

            expect(result).toBeFalsy();
        });

        it('returns true if the day is valid', () => {
            const result = isADayOfTheWeek('monday');
            expect(result).toBeTruthy();
        });
    });

    describe('fareTypeIsAllowedToAddACap', () => {
        const capFareTypes = ['single', 'flatFare', 'return'];
        const unCapFareTypes = ['period', 'multiOperator', 'schoolService'];

        it.each(capFareTypes)('returns true if the fare type is %s', (fareType: string) => {
            const result = fareTypeIsAllowedToAddACap(fareType);
            expect(result).toBeTruthy();
        });

        it.each(unCapFareTypes)('returns false if the fare type is other than %s', (fareType: string) => {
            const result = fareTypeIsAllowedToAddACap(fareType);
            expect(result).toBeFalsy();
        });
    });

    describe('removeDuplicateServices', () => {
        const mockServiceTypeServices: ServiceType[] = [
            {
                id: 11,
                lineName: '123',
                lineId: '3h3vb32ik',
                startDate: '05/02/2020',
                description: 'this bus service is 123',
                origin: 'Manchester',
                destination: 'Leeds',
                serviceCode: 'NW_05_BLAC_123_1',
                endDate: null,
            },
            {
                id: 12,
                lineName: 'X1',
                lineId: '3h3vb32ik',
                startDate: '06/02/2020',
                description: 'this bus service is X1',
                origin: 'Edinburgh',
                serviceCode: 'NW_05_BLAC_X1_1',
                endDate: null,
            },
            {
                id: 13,
                lineName: 'X1',
                lineId: '3h3vb32ik',
                startDate: '06/02/2020',
                description: 'this bus service is of X1',
                origin: 'Edinburgh',
                serviceCode: 'NW_05_BLAC_X1_1',
                endDate: null,
            },
        ];

        const mockMyFaresServices: MyFaresService[] = [
            {
                id: '1',
                origin: 'Leeds',
                destination: 'Manchester',
                lineId: 'wefawefa',
                lineName: '1',
                startDate: '1/1/2021',
                endDate: '16/9/2021',
            },
            {
                id: '2',
                origin: 'Leeds',
                destination: 'Manchester',
                lineId: 'wefawefa',
                lineName: '1',
                startDate: '1/1/2021',
                endDate: '16/9/2021',
            },
            {
                id: '3',
                origin: 'Edinburgh',
                destination: 'Manchester',
                lineId: '3h3vb32ik',
                lineName: 'X1',
                startDate: '1/1/2021',
                endDate: '16/9/2021',
            },
        ];

        it('returns the unique services by lineid, startDate and endDate', () => {
            const result = removeDuplicateServices(mockServiceTypeServices);
            expect(result.length).toBe(2);
            expect(result).toEqual([
                {
                    id: 11,
                    lineName: '123',
                    lineId: '3h3vb32ik',
                    startDate: '05/02/2020',
                    description: 'this bus service is 123',
                    origin: 'Manchester',
                    destination: 'Leeds',
                    serviceCode: 'NW_05_BLAC_123_1',
                    endDate: null,
                },
                {
                    id: 12,
                    lineName: 'X1',
                    lineId: '3h3vb32ik',
                    startDate: '06/02/2020',
                    description: 'this bus service is X1',
                    origin: 'Edinburgh',
                    serviceCode: 'NW_05_BLAC_X1_1',
                    endDate: null,
                },
            ]);
        });

        it('returns the unique my fares services by lineid, startDate and endDate', () => {
            const result = removeDuplicateServices(mockMyFaresServices);
            expect(result.length).toBe(2);
            expect(result).toEqual([
                {
                    id: '1',
                    origin: 'Leeds',
                    destination: 'Manchester',
                    lineId: 'wefawefa',
                    lineName: '1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                },
                {
                    id: '3',
                    origin: 'Edinburgh',
                    destination: 'Manchester',
                    lineId: '3h3vb32ik',
                    lineName: 'X1',
                    startDate: '1/1/2021',
                    endDate: '16/9/2021',
                },
            ]);
        });
    });

    describe('exportHasStarted', () => {
        it('returns true if current time is more than 5 seconds', () => {
            const exportStarted = new Date().getTime() / 1000 - 6;
            const result = exportHasStarted(exportStarted);
            expect(result).toBeTruthy();
        });

        it('returns false if the current time is less than 5 seconds', () => {
            const exportStarted = new Date().getTime() / 1000 - 2;
            const result = exportHasStarted(exportStarted);
            expect(result).toBeFalsy();
        });
    });
});
