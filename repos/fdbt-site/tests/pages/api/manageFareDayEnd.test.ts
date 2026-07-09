import * as aurora from '../../../src/data/auroradb';
import * as utils from '../../../src/utils/apiUtils/index';
import * as session from '../../../src/utils/sessions';
import { GS_FARE_DAY_END_ATTRIBUTE } from '../../../src/constants/attributes';
import { getMockRequestAndResponse } from '../../testData/mockData';
import manageFareDayEnd from '../../../src/pages/api/manageFareDayEnd';

jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/utils/apiUtils/index');

const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
const upsertFareDayEndSpy = jest.spyOn(aurora, 'upsertFareDayEnd');

describe('manageFareDayEnd', () => {
    const writeHeadMock = jest.fn();

    afterEach(jest.resetAllMocks);

    it('should error when time is invalid', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                fareDayEnd: '12345',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = {
            errors: [
                {
                    errorMessage: 'Time must be in 24hr format',
                    id: 'fare-day-end-input',
                },
            ],
            input: '12345',
        };

        await manageFareDayEnd(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_FARE_DAY_END_ATTRIBUTE, attributeValue);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/manageFareDayEnd' });
    });

    it('should upsert fare day end and set saved if valid', async () => {
        jest.spyOn(utils, 'getAndValidateNoc').mockReturnValue('mynoc');

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                fareDayEnd: '1234',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        const attributeValue = { saved: true };

        await manageFareDayEnd(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_FARE_DAY_END_ATTRIBUTE, attributeValue);

        expect(upsertFareDayEndSpy).toHaveBeenCalledWith('mynoc', '1234');

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/manageFareDayEnd' });
    });
});
