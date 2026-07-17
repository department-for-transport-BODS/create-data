import howManyStages from '../../../src/pages/api/howManyStages';
import { getMockRequestAndResponse } from '../../testData/mockData';

describe('howManyStages', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /howManyStages when a number of fare stages is not selected', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        howManyStages(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/howManyStages',
        });
    });

    it('should return 302 redirect to /error when an number of fare stages value we dont expect is passed', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { howManyStages: '100' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        howManyStages(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/error',
        });
    });

    it('should return 302 redirect to /csvUpload when more then 20 fare stages is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { howManyStages: 'moreThan20' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        howManyStages(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/csvUpload',
        });
    });

    it('should return 302 redirect to /chooseStages when less than 20 fare stages is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { howManyStages: 'lessThan20' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        howManyStages(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/chooseStages',
        });
    });
});
