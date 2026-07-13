import { GroupTicketAttributeWithErrors, GroupTicketAttribute } from '../../../src/interfaces';
import groupSize, { groupSizeSchema } from '../../../src/pages/api/groupSize';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { GROUP_SIZE_ATTRIBUTE } from '../../../src/constants/attributes';
import * as sessions from '../../../src/utils/sessions';

describe('groupSize', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('groupSizeSchema', () => {
        it.each([
            ['', false],
            ['  ', false],
            ['-12', false],
            ['1.23', false],
            ['0', false],
            ['1', true],
            ['30', true],
            ['31', false],
            ['not a number', false],
            [' 1    2   ', true],
        ])('should validate that %s is %s', (candidate, validity) => {
            const result = groupSizeSchema.isValidSync(candidate);
            expect(result).toEqual(validity);
        });
    });

    it('should update the GROUP_SIZE_ATTRIBUTE and redirect to itself (i.e. /groupSize) when there are validation errors', async () => {
        const { req, res } = getMockRequestAndResponse({ body: { maxGroupSize: 'wrong input' } });
        const groupTicketInfoWithErrors: GroupTicketAttributeWithErrors = {
            maxGroupSize: 'wronginput',
            errors: [
                {
                    errorMessage: 'Enter a whole number between 1 and 30',
                    id: 'max-group-size',
                    userInput: 'wronginput',
                },
            ],
        };
        await groupSize(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_SIZE_ATTRIBUTE, groupTicketInfoWithErrors);
        expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/groupSize' });
    });

    it('should update the GROUP_SIZE_ATTRIBUTE and redirect to /groupPassengerTypes when there are validation errors', async () => {
        const { req, res } = getMockRequestAndResponse({ body: { maxGroupSize: '5' } });
        const groupTicketInfo: GroupTicketAttribute = {
            maxGroupSize: '5',
        };
        await groupSize(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GROUP_SIZE_ATTRIBUTE, groupTicketInfo);
        expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/groupPassengerTypes' });
    });
});
