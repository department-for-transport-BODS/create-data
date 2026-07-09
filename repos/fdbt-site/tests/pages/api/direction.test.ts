import * as apiUtils from '../../../src/utils/apiUtils/index';
import direction from '../../../src/pages/api/direction';
import { getMockRequestAndResponse } from '../../testData/mockData';

jest.mock('../../../src/utils/apiUtils/index');

describe('direction', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /direction (i.e. itself) when there is no direction', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        direction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/direction',
        });
    });

    it('should return 302 redirect to /inputMethod when request body is present and fareType is single', () => {
        const { req, res } = getMockRequestAndResponse({
            body: { direction: 'outbound' },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        jest.spyOn(apiUtils, 'setCookieOnResponseObject');
        direction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/inputMethod',
        });
    });
});
