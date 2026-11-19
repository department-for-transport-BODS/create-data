import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { deleteExport } from '../../src/data/s3';

describe('s3', () => {
    describe('deleteExport', () => {
        const sendSpy = jest.spyOn(S3Client.prototype, 'send');

        afterEach(() => {
            sendSpy.mockReset();
        });

        const mockListResponses = (keysByPrefix: Record<string, string[]>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sendSpy.mockImplementation(async (command: any) => {
                if (command instanceof ListObjectsV2Command) {
                    const keys = keysByPrefix[command.input.Prefix as string] ?? [];
                    return { Contents: keys.map((Key) => ({ Key })) };
                }
                return {};
            });
        };

        const getSentCommands = <T>(commandType: new (...args: never[]) => T): T[] =>
            sendSpy.mock.calls
                .map(([command]) => command as unknown)
                .filter((command): command is T => command instanceof commandType);

        const getDeleteCommands = (): DeleteObjectsCommand[] => getSentCommands(DeleteObjectsCommand);

        it('only lists objects for the given export and deletes them', async () => {
            mockListResponses({
                'BLAC/exports/BLAC_2022_09_29/': ['BLAC/exports/BLAC_2022_09_29/a.json'],
                'BLAC/zips/BLAC_2022_09_29/': ['BLAC/zips/BLAC_2022_09_29/BLAC_2022_09_29.zip'],
            });

            await deleteExport('BLAC', 'BLAC_2022_09_29', 'test-bucket');

            const listPrefixes = getSentCommands(ListObjectsV2Command).map((command) => command.input.Prefix);
            expect(listPrefixes).toEqual(['BLAC/exports/BLAC_2022_09_29/', 'BLAC/zips/BLAC_2022_09_29/']);

            const deleteCommands = getDeleteCommands();
            expect(deleteCommands).toHaveLength(1);
            expect(deleteCommands[0].input.Delete?.Objects).toEqual([
                { Key: 'BLAC/exports/BLAC_2022_09_29/a.json' },
                { Key: 'BLAC/zips/BLAC_2022_09_29/BLAC_2022_09_29.zip' },
            ]);
        });

        it('does not send a delete request when the export has no objects in the bucket', async () => {
            mockListResponses({});

            await deleteExport('BLAC', 'BLAC_2022_09_29', 'test-bucket');

            expect(getDeleteCommands()).toHaveLength(0);
        });

        it('deletes in batches of at most 1000 objects', async () => {
            const keys = Array.from({ length: 2000 }, (_, i) => `BLAC/exports/BLAC_2022_09_29/${i}.xml`);
            mockListResponses({ 'BLAC/exports/BLAC_2022_09_29/': keys });

            await deleteExport('BLAC', 'BLAC_2022_09_29', 'test-bucket');

            const deleteCommands = getDeleteCommands();
            expect(deleteCommands.map((command) => command.input.Delete?.Objects?.length)).toEqual([1000, 1000]);
        });
    });
});
