import {
    getMockContext,
    mockRawService,
    zoneStops,
    mockRawServiceWithDuplicates,
    userFareStages,
} from '../../testData/mockData';
import {
    DIRECTION_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as auroradb from '../../../src/data/auroradb';
import {
    getMatchingProps,
    removeDuplicateAdjacentStops,
    sortingWithoutSequenceNumbers,
    validateSequenceNumbers,
} from '../../../src/utils/apiUtils/matching';
import * as s3 from '../../../src/data/s3';
import { RawJourneyPattern, StopPoint } from '../../../src/interfaces/dbTypes';

jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/data/s3');

describe('matching', () => {
    describe('getMatchingProps', () => {
        beforeEach(() => {
            jest.clearAllMocks();
            jest.mocked(auroradb.getServiceByIdAndDataSource).mockResolvedValue(mockRawService);
            jest.mocked(auroradb.batchGetStopsByAtcoCodeWithErrorCheck).mockResolvedValue({
                results: [],
                successful: false,
                missingStops: [],
            });
            jest.mocked(s3.getUserFareStages).mockResolvedValue(userFareStages);
        });

        it('generates the correct list of master stops', async () => {
            const ctx = getMockContext({
                session: {
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
            });

            await getMatchingProps(ctx, {});

            expect(auroradb.batchGetStopsByAtcoCodeWithErrorCheck).toHaveBeenCalledTimes(1);
            expect(auroradb.batchGetStopsByAtcoCodeWithErrorCheck).toHaveBeenCalledWith([
                '13003921A',
                '13003305E',
                '13003306B',
                '13003618B',
                '13003622B',
                '13003923B',
                '13003939H',
                '13003625C',
                '13003612D',
                '13003611B',
                '13003609E',
                '13003661E',
                '13003949C',
                '13003635B',
                '13003655B',
            ]);
        });

        it('preserves the stops order', async () => {
            jest.mocked(auroradb.getServiceByIdAndDataSource).mockResolvedValue(mockRawService);
            jest.mocked(auroradb.batchGetStopsByAtcoCodeWithErrorCheck).mockResolvedValue({
                results: zoneStops,
                successful: true,
                missingStops: [],
            });

            const ctx = getMockContext({
                session: {
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
            });

            const result = await getMatchingProps(ctx, {});

            expect(result.props.stops[0].atcoCode).toEqual('13003921A');
            expect(result.props.stops[result.props.stops.length - 1].atcoCode).toEqual('13003655B');
        });

        it('generates the correct list of master stops given journeys with duplicate start and end points', async () => {
            jest.mocked(auroradb.getServiceByIdAndDataSource).mockResolvedValue(mockRawServiceWithDuplicates);

            const ctx = getMockContext({
                session: {
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
            });

            await getMatchingProps(ctx, {});

            expect(auroradb.batchGetStopsByAtcoCodeWithErrorCheck).toHaveBeenCalledTimes(1);
        });

        it('throws an error if no stops can be found', async () => {
            const ctx = getMockContext({
                session: {
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'blah',
                    },
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                },
            });

            await expect(getMatchingProps(ctx, {})).rejects.toThrow(
                'No stops found for journey: nocCode TEST, lineName: X01, direction: blah',
            );
        });

        it('throws an error if noc invalid', async () => {
            const ctx = getMockContext({
                session: {
                    [OPERATOR_ATTRIBUTE]: undefined,
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                },
            });

            await expect(getMatchingProps(ctx, {})).rejects.toThrow('invalid NOC set');
        });

        it('throws an error if service attribute not set', async () => {
            const ctx = getMockContext({
                session: {
                    [SERVICE_ATTRIBUTE]: undefined,
                    [TXC_SOURCE_ATTRIBUTE]: {
                        source: 'bods',
                        hasBods: true,
                        hasTnds: true,
                    },
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                },
            });

            await expect(getMatchingProps(ctx, {})).rejects.toThrow(
                'Necessary attributes not found to show matching page',
            );
        });

        it('throws an error if txc source attribute not set', async () => {
            const ctx = getMockContext({
                session: {
                    [TXC_SOURCE_ATTRIBUTE]: undefined,
                    [DIRECTION_ATTRIBUTE]: {
                        direction: 'outbound',
                    },
                },
            });

            await expect(getMatchingProps(ctx, {})).rejects.toThrow('Attribute was not found fdbt-txc-source');
        });

        describe('sortingWithoutSequenceNumbers', () => {
            it('should correctly sort without sequence numbers', () => {
                const stopPoints = sortingWithoutSequenceNumbers([
                    {
                        direction: 'blah',
                        orderedStopPoints: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map((it) => ({
                            stopPointRef: it,
                            commonName: it,
                        })),
                    },
                    {
                        direction: 'blah',
                        orderedStopPoints: ['1', '2', 'C', 'D'].map((it) => ({
                            stopPointRef: it,
                            commonName: it,
                        })),
                    },
                    {
                        direction: 'blah',
                        orderedStopPoints: ['A', 'B', 'X', 'Y', 'G', 'H', 'I'].map((it) => ({
                            stopPointRef: it,
                            commonName: it,
                        })),
                    },
                ]);

                expect(stopPoints).toEqual(['A', 'B', '1', '2', 'C', 'D', 'E', 'F', 'X', 'Y', 'G', 'H', 'I']);
            });

            it('should attempt the sort algorithm outlined in cfd-591 when toposort fails', () => {
                const rawJourneyPatterns: RawJourneyPattern[] = [
                    {
                        direction: 'inbound',
                        orderedStopPoints: [
                            {
                                stopPointRef: '390040606',
                                commonName: 'Station Road West',
                                sequenceNumber: 1,
                            },
                            {
                                stopPointRef: '390040564',
                                commonName: 'Railway Station',
                                sequenceNumber: 2,
                            },
                            {
                                stopPointRef: '390040587',
                                commonName: 'The Little Wellington',
                                sequenceNumber: 3,
                            },
                            {
                                stopPointRef: '390040567',
                                commonName: 'Laburnham Cottage',
                                sequenceNumber: 4,
                            },
                            {
                                stopPointRef: '390040568',
                                commonName: 'Devon Road',
                                sequenceNumber: 5,
                            },
                            {
                                stopPointRef: '390040580',
                                commonName: 'Birch Close',
                                sequenceNumber: 6,
                            },
                            {
                                stopPointRef: '390040578',
                                commonName: 'Reeds Way',
                                sequenceNumber: 7,
                            },
                            {
                                stopPointRef: '390040576',
                                commonName: 'Trinity Walk',
                                sequenceNumber: 8,
                            },
                            {
                                stopPointRef: '390040491',
                                commonName: 'The Street',
                                sequenceNumber: 9,
                            },
                            {
                                stopPointRef: '390041133',
                                commonName: 'Post Box',
                                sequenceNumber: 10,
                            },
                            {
                                stopPointRef: '390040080',
                                commonName: 'Middlewood Green Turn',
                                sequenceNumber: 11,
                            },
                            {
                                stopPointRef: '390040069',
                                commonName: 'Blacksmiths Lane',
                                sequenceNumber: 12,
                            },
                            {
                                stopPointRef: '390040901',
                                commonName: 'Larters Lane',
                                sequenceNumber: 13,
                            },
                            {
                                stopPointRef: '390040898',
                                commonName: 'Green Man Corner',
                                sequenceNumber: 14,
                            },
                            {
                                stopPointRef: '390040066',
                                commonName: 'Bus Shelter',
                                sequenceNumber: 15,
                            },
                            {
                                stopPointRef: '390040064',
                                commonName: 'Denters Hill',
                                sequenceNumber: 16,
                            },
                            {
                                stopPointRef: '390040062',
                                commonName: 'Community Centre',
                                sequenceNumber: 17,
                            },
                            {
                                stopPointRef: '390040059',
                                commonName: 'Kings Head',
                                sequenceNumber: 18,
                            },
                            {
                                stopPointRef: '390040990',
                                commonName: 'Church',
                                sequenceNumber: 19,
                            },
                            {
                                stopPointRef: '390040386',
                                commonName: 'Trowel and Hammer',
                                sequenceNumber: 20,
                            },
                            {
                                stopPointRef: '390040384',
                                commonName: 'Mechanical Music Museum',
                                sequenceNumber: 21,
                            },
                            {
                                stopPointRef: '390040389',
                                commonName: 'Cotton Methodist Church',
                                sequenceNumber: 22,
                            },
                            {
                                stopPointRef: '390040860',
                                commonName: 'Cotton Methodist Church',
                                sequenceNumber: 23,
                            },
                            {
                                stopPointRef: '390040380',
                                commonName: 'Village Stores',
                                sequenceNumber: 24,
                            },
                            {
                                stopPointRef: '390040382',
                                commonName: 'Church View',
                                sequenceNumber: 25,
                            },
                            {
                                stopPointRef: '390040992',
                                commonName: 'Church Hill',
                                sequenceNumber: 26,
                            },
                            {
                                stopPointRef: '390040751',
                                commonName: 'Bus Shelter',
                                sequenceNumber: 27,
                            },
                            {
                                stopPointRef: '390040747',
                                commonName: 'White Horse',
                                sequenceNumber: 28,
                            },
                            {
                                stopPointRef: '390040181',
                                commonName: 'Post Office',
                                sequenceNumber: 29,
                            },
                        ],
                    },
                    {
                        direction: 'inbound',
                        orderedStopPoints: [
                            {
                                stopPointRef: '390040606',
                                commonName: 'Station Road West',
                                sequenceNumber: 1,
                            },
                            {
                                stopPointRef: '390040604',
                                commonName: 'Barnards',
                                sequenceNumber: 2,
                            },
                            {
                                stopPointRef: '390041126',
                                commonName: 'Creeting Road',
                                sequenceNumber: 3,
                            },
                            {
                                stopPointRef: '390041109',
                                commonName: 'Guillemot Close',
                                sequenceNumber: 4,
                            },
                            {
                                stopPointRef: '390041112',
                                commonName: 'Redwing Drive',
                                sequenceNumber: 5,
                            },
                            {
                                stopPointRef: '390041114',
                                commonName: 'Sandpiper Road',
                                sequenceNumber: 6,
                            },
                            {
                                stopPointRef: '390040585',
                                commonName: 'Allotments',
                                sequenceNumber: 7,
                            },
                            {
                                stopPointRef: '390040760',
                                commonName: 'Mill Street',
                                sequenceNumber: 8,
                            },
                            {
                                stopPointRef: '390040571',
                                commonName: 'Mill Cottages',
                                sequenceNumber: 9,
                            },
                            {
                                stopPointRef: '390040574',
                                commonName: 'The Retreat',
                                sequenceNumber: 10,
                            },
                            {
                                stopPointRef: '390040578',
                                commonName: 'Reeds Way',
                                sequenceNumber: 11,
                            },
                            {
                                stopPointRef: '390040579',
                                commonName: 'Birch Close',
                                sequenceNumber: 12,
                            },
                            {
                                stopPointRef: '390040569',
                                commonName: 'Devon Road',
                                sequenceNumber: 13,
                            },
                            {
                                stopPointRef: '390041113',
                                commonName: 'Sandpiper Road',
                                sequenceNumber: 14,
                            },
                            {
                                stopPointRef: '390041111',
                                commonName: 'Redwing Drive',
                                sequenceNumber: 15,
                            },
                            {
                                stopPointRef: '390041110',
                                commonName: 'Guillemot Close',
                                sequenceNumber: 16,
                            },
                            {
                                stopPointRef: '390041125',
                                commonName: 'Creeting Road',
                                sequenceNumber: 17,
                            },
                            {
                                stopPointRef: '390040598',
                                commonName: 'Cinema',
                                sequenceNumber: 18,
                            },
                            {
                                stopPointRef: '390040596',
                                commonName: 'Argos Store',
                                sequenceNumber: 19,
                            },
                            {
                                stopPointRef: '390040604',
                                commonName: 'Barnards',
                                sequenceNumber: 20,
                            },
                            {
                                stopPointRef: '390040597',
                                commonName: 'Dukes Head',
                                sequenceNumber: 21,
                            },
                            {
                                stopPointRef: '390040601',
                                commonName: 'The Ford',
                                sequenceNumber: 22,
                            },
                            {
                                stopPointRef: '390040602',
                                commonName: 'Cracknells',
                                sequenceNumber: 23,
                            },
                            {
                                stopPointRef: '390040696',
                                commonName: 'Doctors Surgery',
                                sequenceNumber: 24,
                            },
                            {
                                stopPointRef: '390040694',
                                commonName: 'Edgecomb Road',
                                sequenceNumber: 25,
                            },
                            {
                                stopPointRef: '390040692',
                                commonName: 'Chandlers Walk',
                                sequenceNumber: 26,
                            },
                            {
                                stopPointRef: '390040690',
                                commonName: 'Thatchers Walk',
                                sequenceNumber: 27,
                            },
                            {
                                stopPointRef: '390040688',
                                commonName: 'The Twinnings',
                                sequenceNumber: 28,
                            },
                            {
                                stopPointRef: '390040686',
                                commonName: 'Church Road',
                                sequenceNumber: 29,
                            },
                            {
                                stopPointRef: '390040684',
                                commonName: 'Hunt Close',
                                sequenceNumber: 30,
                            },
                            {
                                stopPointRef: '390040682',
                                commonName: 'Webb Road',
                                sequenceNumber: 31,
                            },
                            {
                                stopPointRef: '390040680',
                                commonName: 'The Crescent',
                                sequenceNumber: 32,
                            },
                            {
                                stopPointRef: '390040774',
                                commonName: 'The Ford',
                                sequenceNumber: 33,
                            },
                            {
                                stopPointRef: '390040600',
                                commonName: 'Lime Tree Place',
                                sequenceNumber: 34,
                            },
                            {
                                stopPointRef: '390040598',
                                commonName: 'Cinema',
                                sequenceNumber: 35,
                            },
                            {
                                stopPointRef: '390041107',
                                commonName: 'Gun Cotton Way Park',
                                sequenceNumber: 36,
                            },
                            {
                                stopPointRef: '390041105',
                                commonName: 'Woodpecker Close',
                                sequenceNumber: 37,
                            },
                            {
                                stopPointRef: '390041103',
                                commonName: 'Tesco',
                                sequenceNumber: 38,
                            },
                            {
                                stopPointRef: '390040570',
                                commonName: 'Tesco Car Park',
                                sequenceNumber: 39,
                            },
                        ],
                    },
                    {
                        direction: 'inbound',
                        orderedStopPoints: [
                            {
                                stopPointRef: '390040606',
                                commonName: 'Station Road West',
                                sequenceNumber: 1,
                            },
                            {
                                stopPointRef: '390040604',
                                commonName: 'Barnards',
                                sequenceNumber: 2,
                            },
                            {
                                stopPointRef: '390041126',
                                commonName: 'Creeting Road',
                                sequenceNumber: 3,
                            },
                            {
                                stopPointRef: '390041109',
                                commonName: 'Guillemot Close',
                                sequenceNumber: 4,
                            },
                            {
                                stopPointRef: '390041112',
                                commonName: 'Redwing Drive',
                                sequenceNumber: 5,
                            },
                            {
                                stopPointRef: '390041114',
                                commonName: 'Sandpiper Road',
                                sequenceNumber: 6,
                            },
                            {
                                stopPointRef: '390040568',
                                commonName: 'Devon Road',
                                sequenceNumber: 7,
                            },
                            {
                                stopPointRef: '390040580',
                                commonName: 'Birch Close',
                                sequenceNumber: 8,
                            },
                            {
                                stopPointRef: '390040578',
                                commonName: 'Reeds Way',
                                sequenceNumber: 9,
                            },
                            {
                                stopPointRef: '390040576',
                                commonName: 'Trinity Walk',
                                sequenceNumber: 10,
                            },
                            {
                                stopPointRef: '390040491',
                                commonName: 'The Street',
                                sequenceNumber: 11,
                            },
                            {
                                stopPointRef: '390041133',
                                commonName: 'Post Box',
                                sequenceNumber: 12,
                            },
                            {
                                stopPointRef: '390040080',
                                commonName: 'Middlewood Green Turn',
                                sequenceNumber: 13,
                            },
                            {
                                stopPointRef: '390040069',
                                commonName: 'Blacksmiths Lane',
                                sequenceNumber: 14,
                            },
                            {
                                stopPointRef: '390040901',
                                commonName: 'Larters Lane',
                                sequenceNumber: 15,
                            },
                            {
                                stopPointRef: '390040898',
                                commonName: 'Green Man Corner',
                                sequenceNumber: 16,
                            },
                            {
                                stopPointRef: '390040066',
                                commonName: 'Bus Shelter',
                                sequenceNumber: 17,
                            },
                            {
                                stopPointRef: '390040064',
                                commonName: 'Denters Hill',
                                sequenceNumber: 18,
                            },
                            {
                                stopPointRef: '390040062',
                                commonName: 'Community Centre',
                                sequenceNumber: 19,
                            },
                            {
                                stopPointRef: '390040059',
                                commonName: 'Kings Head',
                                sequenceNumber: 20,
                            },
                            {
                                stopPointRef: '390040990',
                                commonName: 'Church',
                                sequenceNumber: 21,
                            },
                            {
                                stopPointRef: '390040386',
                                commonName: 'Trowel and Hammer',
                                sequenceNumber: 22,
                            },
                            {
                                stopPointRef: '390040384',
                                commonName: 'Mechanical Music Museum',
                                sequenceNumber: 23,
                            },
                            {
                                stopPointRef: '390040389',
                                commonName: 'Cotton Methodist Church',
                                sequenceNumber: 24,
                            },
                            {
                                stopPointRef: '390040860',
                                commonName: 'Cotton Methodist Church',
                                sequenceNumber: 25,
                            },
                            {
                                stopPointRef: '390040380',
                                commonName: 'Village Stores',
                                sequenceNumber: 26,
                            },
                            {
                                stopPointRef: '390040382',
                                commonName: 'Church View',
                                sequenceNumber: 27,
                            },
                            {
                                stopPointRef: '390040992',
                                commonName: 'Church Hill',
                                sequenceNumber: 28,
                            },
                            {
                                stopPointRef: '390040751',
                                commonName: 'Bus Shelter',
                                sequenceNumber: 29,
                            },
                            {
                                stopPointRef: '390040747',
                                commonName: 'White Horse',
                                sequenceNumber: 30,
                            },
                            {
                                stopPointRef: '390040181',
                                commonName: 'Post Office',
                                sequenceNumber: 31,
                            },
                        ],
                    },
                    {
                        direction: 'inbound',
                        orderedStopPoints: [
                            {
                                stopPointRef: '390040606',
                                commonName: 'Station Road West',
                                sequenceNumber: 1,
                            },
                            {
                                stopPointRef: '390040564',
                                commonName: 'Railway Station',
                                sequenceNumber: 2,
                            },
                            {
                                stopPointRef: '390040604',
                                commonName: 'Barnards',
                                sequenceNumber: 3,
                            },
                            {
                                stopPointRef: '390040597',
                                commonName: 'Dukes Head',
                                sequenceNumber: 4,
                            },
                            {
                                stopPointRef: '390040601',
                                commonName: 'The Ford',
                                sequenceNumber: 5,
                            },
                            {
                                stopPointRef: '390040602',
                                commonName: 'Cracknells',
                                sequenceNumber: 6,
                            },
                            {
                                stopPointRef: '390040696',
                                commonName: 'Doctors Surgery',
                                sequenceNumber: 7,
                            },
                            {
                                stopPointRef: '390040694',
                                commonName: 'Edgecomb Road',
                                sequenceNumber: 8,
                            },
                            {
                                stopPointRef: '390040692',
                                commonName: 'Chandlers Walk',
                                sequenceNumber: 9,
                            },
                            {
                                stopPointRef: '390040690',
                                commonName: 'Thatchers Walk',
                                sequenceNumber: 10,
                            },
                            {
                                stopPointRef: '390040688',
                                commonName: 'The Twinnings',
                                sequenceNumber: 11,
                            },
                            {
                                stopPointRef: '390040686',
                                commonName: 'Church Road',
                                sequenceNumber: 12,
                            },
                            {
                                stopPointRef: '390040684',
                                commonName: 'Hunt Close',
                                sequenceNumber: 13,
                            },
                            {
                                stopPointRef: '390040682',
                                commonName: 'Webb Road',
                                sequenceNumber: 14,
                            },
                            {
                                stopPointRef: '390040680',
                                commonName: 'The Crescent',
                                sequenceNumber: 15,
                            },
                            {
                                stopPointRef: '390040774',
                                commonName: 'The Ford',
                                sequenceNumber: 16,
                            },
                            {
                                stopPointRef: '390040600',
                                commonName: 'Lime Tree Place',
                                sequenceNumber: 17,
                            },
                            {
                                stopPointRef: '390040598',
                                commonName: 'Cinema',
                                sequenceNumber: 18,
                            },
                            {
                                stopPointRef: '390041126',
                                commonName: 'Creeting Road',
                                sequenceNumber: 19,
                            },
                            {
                                stopPointRef: '390041107',
                                commonName: 'Gun Cotton Way Park',
                                sequenceNumber: 20,
                            },
                            {
                                stopPointRef: '390041105',
                                commonName: 'Woodpecker Close',
                                sequenceNumber: 21,
                            },
                            {
                                stopPointRef: '390041103',
                                commonName: 'Tesco',
                                sequenceNumber: 22,
                            },
                            {
                                stopPointRef: '390040570',
                                commonName: 'Tesco Car Park',
                                sequenceNumber: 23,
                            },
                            {
                                stopPointRef: '390041104',
                                commonName: 'Tesco',
                                sequenceNumber: 24,
                            },
                            {
                                stopPointRef: '390041106',
                                commonName: 'Woodpecker Close',
                                sequenceNumber: 25,
                            },
                            {
                                stopPointRef: '390041108',
                                commonName: 'Gun Cotton Way Park',
                                sequenceNumber: 26,
                            },
                            {
                                stopPointRef: '390041109',
                                commonName: 'Guillemot Close',
                                sequenceNumber: 27,
                            },
                            {
                                stopPointRef: '390041112',
                                commonName: 'Redwing Drive',
                                sequenceNumber: 28,
                            },
                            {
                                stopPointRef: '390041114',
                                commonName: 'Sandpiper Road',
                                sequenceNumber: 29,
                            },
                            {
                                stopPointRef: '390040585',
                                commonName: 'Allotments',
                                sequenceNumber: 30,
                            },
                            {
                                stopPointRef: '390040760',
                                commonName: 'Mill Street',
                                sequenceNumber: 31,
                            },
                            {
                                stopPointRef: '390040571',
                                commonName: 'Mill Cottages',
                                sequenceNumber: 32,
                            },
                            {
                                stopPointRef: '390040574',
                                commonName: 'The Retreat',
                                sequenceNumber: 33,
                            },
                            {
                                stopPointRef: '390040578',
                                commonName: 'Reeds Way',
                                sequenceNumber: 34,
                            },
                        ],
                    },
                ];

                const expectedStops: string[] = [
                    '390040606',
                    '390040564',
                    '390040604',
                    '390040587',
                    '390041126',
                    '390040567',
                    '390041109',
                    '390040568',
                    '390041112',
                    '390040580',
                    '390041114',
                    '390040578',
                    '390040585',
                    '390040576',
                    '390040760',
                    '390040491',
                    '390040571',
                    '390041133',
                    '390040574',
                    '390040080',
                    '390040069',
                    '390040579',
                    '390040901',
                    '390040569',
                    '390040898',
                    '390041113',
                    '390040066',
                    '390041111',
                    '390040064',
                    '390041110',
                    '390040062',
                    '390041125',
                    '390040059',
                    '390040598',
                    '390040990',
                    '390040596',
                    '390040386',
                    '390040384',
                    '390040597',
                    '390040389',
                    '390040601',
                    '390040860',
                    '390040602',
                    '390040380',
                    '390040696',
                    '390041104',
                    '390040382',
                    '390040694',
                    '390041106',
                    '390040992',
                    '390040692',
                    '390041108',
                    '390040751',
                    '390040690',
                    '390040747',
                    '390040688',
                    '390040181',
                    '390040686',
                    '390040684',
                    '390040682',
                    '390040680',
                    '390040774',
                    '390040600',
                    '390041107',
                    '390041105',
                    '390041103',
                    '390040570',
                ];

                const stopPoints = sortingWithoutSequenceNumbers(rawJourneyPatterns);

                expect(stopPoints).toEqual(expectedStops);
            });
        });

        describe('removeDuplicateAdjacentStops', () => {
            it('removes some stops if theyre next to one another in the list and identical', () => {
                const input = ['stop1', 'stop2', 'stop3', 'stop3', 'stop4', 'stop1', 'stop2', 'stop2'];
                const result = removeDuplicateAdjacentStops(input);
                expect(result).toEqual(['stop1', 'stop2', 'stop3', 'stop4', 'stop1', 'stop2']);
            });

            it('removes some stops if there are 3 next to one another in the list and identical', () => {
                const input = ['stop1', 'stop2', 'stop3', 'stop3', 'stop3', 'stop4', 'stop1', 'stop2', 'stop2'];
                const result = removeDuplicateAdjacentStops(input);
                expect(result).toEqual(['stop1', 'stop2', 'stop3', 'stop4', 'stop1', 'stop2']);
            });

            it('does not remove stops if they are not identical', () => {
                const input = ['stop1', 'stop2', 'stop3', 'stop4', 'stop5', 'stop6', 'stop7', 'stop8'];
                const result = removeDuplicateAdjacentStops(input);
                expect(result).toEqual(['stop1', 'stop2', 'stop3', 'stop4', 'stop5', 'stop6', 'stop7', 'stop8']);
            });
        });
    });
});

describe('validateSequenceNumbers', () => {
    const stopPoints: StopPoint[] = [
        {
            stopPointRef: '390040774',
            commonName: 'The Ford',
            sequenceNumber: 0,
        },
        {
            stopPointRef: '390040606',
            commonName: 'Station Road West',
            sequenceNumber: 1,
        },
        {
            stopPointRef: '390040564',
            commonName: 'Railway Station',
            sequenceNumber: 2,
        },
        {
            stopPointRef: '390040587',
            commonName: 'The Little Wellington',
            sequenceNumber: 3,
        },
        {
            stopPointRef: '390040567',
            commonName: 'Laburnham Cottage',
            sequenceNumber: 4,
        },
        {
            stopPointRef: '390040568',
            commonName: 'Devon Road',
            sequenceNumber: 5,
        },
        {
            stopPointRef: '390040580',
            commonName: 'Birch Close',
            sequenceNumber: 6,
        },
        {
            stopPointRef: '390040578',
            commonName: 'Reeds Way',
            sequenceNumber: 7,
        },
        {
            stopPointRef: '390040576',
            commonName: 'Trinity Walk',
            sequenceNumber: 8,
        },
        {
            stopPointRef: '390040491',
            commonName: 'The Street',
            sequenceNumber: 9,
        },
        {
            stopPointRef: '390041133',
            commonName: 'Post Box',
            sequenceNumber: 10,
        },
    ];

    it('doesnt return false if there is a sequence number of zero', () => {
        expect(validateSequenceNumbers(stopPoints)).toBeTruthy();
    });

    it('returns false if two stops share the same sequence number', () => {
        const input = [
            ...stopPoints,
            {
                stopPointRef: '39004133133',
                commonName: 'Post Office',
                sequenceNumber: 10,
            },
        ];

        expect(validateSequenceNumbers(input)).toBeFalsy();
    });
});
