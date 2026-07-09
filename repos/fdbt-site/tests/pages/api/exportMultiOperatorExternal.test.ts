import { NextApiResponse } from 'next';
import exportMultiOperatorExternal from '../../../src/pages/api/exportMultiOperatorExternal';
import * as exportUtils from '../../../src/utils/apiUtils/export';
import { NextApiRequestWithSession } from '../../../src/interfaces';
import * as aurora from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { DbProduct } from '../../../src/interfaces/dbTypes';
import * as apiUtils from '../../../src/utils/apiUtils';
import * as s3 from '../../../src/data/s3';

jest.mock('../../../src/utils/apiUtils/export');
jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/utils/apiUtils');
jest.mock('../../../src/data/s3');

const mockProducts: DbProduct[] = [
    {
        id: 1,
        nocCode: 'TEST',
        lineId: 'multiOperatorExt',
        fareType: 'single',
        matchingJsonLink: '/matching/json/link/1',
        startDate: '01/02/2022',
        incomplete: false,
    },
    {
        id: 2,
        nocCode: 'TEST',
        lineId: 'multiOperatorExt',
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
        endDate: '01/02/2023',
        incomplete: false,
    },
];

describe('exportMultiOperatorExternal', () => {
    const triggerExportSpy = jest.spyOn(exportUtils, 'triggerExport').mockResolvedValue();
    const getMultiOperatorExternalProductsByNocSpy = jest.spyOn(aurora, 'getMultiOperatorExternalProductsByNoc');
    const noc = 'testNoc';
    jest.spyOn(apiUtils, 'getAndValidateNoc').mockReturnValue(noc);
    jest.spyOn(s3, 'getS3Exports').mockResolvedValue(['aaaa', 'wwww']);
    const redirectToSpy = jest.spyOn(apiUtils, 'redirectTo');

    it('should trigger an export of all valid multi-operator external products', async () => {
        getMultiOperatorExternalProductsByNocSpy.mockResolvedValue(mockProducts);

        const { req, res } = getMockRequestAndResponse({
            body: {},
        });

        await exportMultiOperatorExternal(req as NextApiRequestWithSession, res as NextApiResponse);

        expect(triggerExportSpy).toHaveBeenCalledWith({
            noc,
            paths: ['/matching/json/link/1', '/matching/json/link/2'],
            exportPrefix: expect.stringMatching(/MULTIOPERATOR/),
        });
        expect(redirectToSpy).toHaveBeenCalledWith(res, '/products/exports?exportStarted=true');
    });
});
