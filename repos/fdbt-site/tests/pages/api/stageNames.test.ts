import * as sessions from '../../../src/utils/sessions';
import { STAGE_NAMES_ATTRIBUTE } from '../../../src/constants/attributes';
import stageNames, { isStageNameValid } from '../../../src/pages/api/stageNames';
import { getMockRequestAndResponse } from '../../testData/mockData';

describe('stageNames', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('isStageNameValid', () => {
        it('should return an array of invalid input checks when the user enters no data', () => {
            const mockBody = { stageNameInput: ['', '', '', ''] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-1', input: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-2', input: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-3', input: '' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-4', input: '' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of valid input checks when the user enters correct data', () => {
            const mockBody = { stageNameInput: ['abcd', 'efg', 'hijkl', 'mn'] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: '', id: 'fare-stage-name-1', input: 'abcd' },
                { error: '', id: 'fare-stage-name-2', input: 'efg' },
                { error: '', id: 'fare-stage-name-3', input: 'hijkl' },
                { error: '', id: 'fare-stage-name-4', input: 'mn' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of invalid and valid input checks when the user enters incorrect data', () => {
            const mockBody = {
                stageNameInput: [
                    'abcde',
                    '   ',
                    'xyz',
                    '',
                    'gggg',
                    'gggg',
                    'moreThan70Charactersmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                ],
            };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: '', id: 'fare-stage-name-1', input: 'abcde' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-2', input: '   ' },
                { error: '', id: 'fare-stage-name-3', input: 'xyz' },
                { error: 'Enter a name for this fare stage', id: 'fare-stage-name-4', input: '' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-5', input: 'gggg' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-6', input: 'gggg' },
                {
                    error: 'The name for Fare Stage 7 needs to be 70 characters or fewer',
                    id: 'fare-stage-name-7',
                    input: 'moreThan70Charactersmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
        it('should return an array of invalid and valid input checks when the user enters correct data but with duplicates', () => {
            const mockBody = { stageNameInput: ['abc', 'abc', 'a', 'b'] };
            const { req } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
            const expectedArray = [
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-1', input: 'abc' },
                { error: 'Stage names cannot share exact names', id: 'fare-stage-name-2', input: 'abc' },
                { error: '', id: 'fare-stage-name-3', input: 'a' },
                { error: '', id: 'fare-stage-name-4', input: 'b' },
            ];
            const inputCheck = isStageNameValid(req);
            expect(inputCheck).toEqual(expectedArray);
        });
    });

    it('should return 302 redirect to /stageNames (i.e. itself) when the session is valid, but there is no request body', () => {
        const mockBody = { stageNameInput: ['', '', '', ''] };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody, uuid: {}, mockWriteHeadFn });
        stageNames(req, res);
        expect(mockWriteHeadFn).toHaveBeenCalledWith(302, {
            Location: '/stageNames',
        });
    });

    it('should return 302 redirect to /priceEntry when session is valid and request body is present', () => {
        const mockBody = {
            stageNameInput: ['a', 'b', 'c', '70charactersgaregeargfvfevergergergergergergergergerfsawefwefwewefgerg'],
        };
        const mockWriteHeadFn = jest.fn();
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody, uuid: {}, mockWriteHeadFn });
        stageNames(req, res);
        expect(mockWriteHeadFn).toHaveBeenCalledWith(302, {
            Location: '/stageNamesConfirmation',
        });
    });

    it('should set the STAGE_NAMES_ATTRIBUTE with values matching the valid data entered by the user', () => {
        const setUpdateSessionspy = jest.spyOn(sessions, 'updateSessionAttribute');
        const mockBody = { stageNameInput: ['a', 'b', 'c', 'd'] };
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
        const mockStageNamesAttributeValue = ['a', 'b', 'c', 'd'];
        stageNames(req, res);
        expect(setUpdateSessionspy).toHaveBeenCalledWith(req, STAGE_NAMES_ATTRIBUTE, mockStageNamesAttributeValue);
    });

    it('should set the STAGE_NAMES_ATTRIBUTE with a value matching the invalid data entered by the user', () => {
        const setUpdateSessionspy = jest.spyOn(sessions, 'updateSessionAttribute');
        const mockBody = {
            stageNameInput: [
                ' ',
                'moreThan70Charactersmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                '   ',
                'b',
            ],
        };
        const { req, res } = getMockRequestAndResponse({ cookieValues: {}, body: mockBody });
        const mockInputCheck = [
            { input: ' ', error: 'Enter a name for this fare stage', id: 'fare-stage-name-1' },
            {
                input: 'moreThan70Charactersmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz',
                error: 'The name for Fare Stage 2 needs to be 70 characters or fewer',
                id: 'fare-stage-name-2',
            },
            { input: '   ', error: 'Enter a name for this fare stage', id: 'fare-stage-name-3' },
            { input: 'b', error: '', id: 'fare-stage-name-4' },
        ];
        stageNames(req, res);
        expect(setUpdateSessionspy).toHaveBeenCalledWith(req, STAGE_NAMES_ATTRIBUTE, mockInputCheck);
    });
});
