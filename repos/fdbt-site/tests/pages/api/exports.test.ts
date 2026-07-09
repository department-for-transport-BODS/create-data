import { NextApiResponse } from 'next';
import exports from '../../../src/pages/api/exports';
import * as exportUtils from '../../../src/utils/apiUtils/export';
import { NextApiRequestWithSession } from '../../../src/interfaces';
import * as aurora from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { DbProduct } from '../../../src/interfaces/dbTypes';
import * as index from '../../../src/utils/apiUtils';
import * as s3 from '../../../src/data/s3';

jest.mock('../../../src/utils/apiUtils/export');
jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/utils/apiUtils');
jest.mock('../../../src/data/s3');

const mockProducts: DbProduct[] = [
    {
        id: 1,
        nocCode: 'TEST',
        lineId: '231yevgy',
        fareType: 'single',
        matchingJsonLink: '/matching/json/link/1',
        startDate: '01/02/2022',
        incomplete: false,
    },
    {
        id: 2,
        nocCode: 'TEST',
        lineId: 'refg4q3g43',
        fareType: 'single',
        matchingJsonLink: '/matching/json/link/2',
        startDate: '01/02/2022',
        incomplete: false,
    },
    {
        id: 3,
        nocCode: 'TEST',
        lineId: 'q34t4tq234',
        fareType: 'multiOperatorExt',
        matchingJsonLink: '/matching/json/link/3',
        startDate: '01/02/2022',
        incomplete: false,
    },
    {
        id: 4,
        nocCode: 'TEST',
        lineId: 'q34t4tq234',
        fareType: 'multiOperatorExt',
        matchingJsonLink: '/matching/json/link/4',
        startDate: '01/02/2022',
        endDate: '01/02/2023',
        incomplete: false,
    },
];

describe('exportHandler', () => {
    const triggerExportSpy = jest.spyOn(exportUtils, 'triggerExport').mockResolvedValue();
    const getAllProductsByNocSpy = jest.spyOn(aurora, 'getAllProductsByNoc');
    const noc = 'testNoc';
    jest.spyOn(index, 'getAndValidateNoc').mockReturnValue(noc);
    jest.spyOn(s3, 'getS3Exports').mockResolvedValue(['aaaa', 'wwww']);

    it('should trigger an export of all products excluding multi-operator external products', async () => {
        getAllProductsByNocSpy.mockResolvedValue(mockProducts);

        const { req, res } = getMockRequestAndResponse({
            body: {},
        });

        await exports(
            req as NextApiRequestWithSession,
            { ...res, status: jest.fn().mockReturnThis(), send: jest.fn() } as NextApiResponse,
        );

        expect(triggerExportSpy).toHaveBeenCalledWith({
            noc,
            paths: ['/matching/json/link/1', '/matching/json/link/2'],
            exportPrefix: expect.any(String),
        });
    });
});
