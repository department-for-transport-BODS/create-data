import { getMockRequestAndResponse } from '../../testData/mockData';
import * as s3 from '../../../src/data/s3';
import * as aurora from '../../../src/data/auroradb';
import * as index from '../../../src/utils/apiUtils/index';
import * as exporter from '../../../src/utils/apiUtils/export';
import selectExports from '../../../src/pages/api/selectExports';
import { MyFaresProduct } from '../../../src/interfaces/dbTypes';

const mockProducts: MyFaresProduct[] = [
    {
        id: 1,
        lineId: '231yevgy',
        matchingJsonLink: '/matching/json/link/1',
        startDate: '01/02/2022',
        nocCode: 'TEST',
        fareType: 'single',
        incomplete: false,
    },
    {
        id: 2,
        lineId: 'refg4q3g43',
        matchingJsonLink: '/matching/json/link/2',
        startDate: '01/02/2022',
        nocCode: 'TEST',
        fareType: 'single',
        incomplete: false,
    },
    {
        id: 3,
        lineId: 'q34t4tq234',
        matchingJsonLink: '/matching/json/link/3',
        startDate: '01/02/2022',
        nocCode: 'TEST',
        fareType: 'single',
        incomplete: false,
    },
];

describe('fareType', () => {
    const writeHeadMock = jest.fn();
    jest.spyOn(s3, 'getS3Exports').mockResolvedValue(['aaaa', 'wwww']);
    const getProductByIdSpy = jest.spyOn(aurora, 'getProductById');
    const triggerExportSpy = jest.spyOn(exporter, 'triggerExport').mockResolvedValue();
    const noc = 'testNoc';
    jest.spyOn(index, 'getAndValidateNoc').mockReturnValue(noc);

    it('returns the user to the select exports page if they do not select any products', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await selectExports(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/selectExports',
        });
    });

    it('sends a link per product to the triggerExports function, then redirects to /products/exports', async () => {
        getProductByIdSpy
            .mockResolvedValueOnce(mockProducts[0])
            .mockResolvedValueOnce(mockProducts[1])
            .mockResolvedValueOnce(mockProducts[2]);

        const { req, res } = getMockRequestAndResponse({
            body: { productsToExport: ['1', '2', '3'] },
            mockWriteHeadFn: writeHeadMock,
        });

        await selectExports(req, res);

        expect(triggerExportSpy).toHaveBeenCalledWith({
            noc,
            paths: [
                mockProducts[0].matchingJsonLink,
                mockProducts[1].matchingJsonLink,
                mockProducts[2].matchingJsonLink,
            ],
            exportPrefix: expect.any(String),
        });

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/exports?exportStarted=true',
        });
    });

    it('sends one link if only one product has been selected to the triggerExports function, then redirects to /products/exports', async () => {
        getProductByIdSpy.mockResolvedValueOnce(mockProducts[0]);
        const { req, res } = getMockRequestAndResponse({
            body: { productsToExport: '1' },
            mockWriteHeadFn: writeHeadMock,
        });

        await selectExports(req, res);

        expect(triggerExportSpy).toHaveBeenCalledWith({
            noc,
            paths: [mockProducts[0].matchingJsonLink],
            exportPrefix: expect.any(String),
        });

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/exports?exportStarted=true',
        });
    });
});
