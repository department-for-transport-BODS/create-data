import manageTimeRestriction from '../../../src/pages/api/manageTimeRestriction';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as session from '../../../src/utils/sessions';
import * as aurora from '../../../src/data/auroradb';
import { GS_TIME_RESTRICTION_ATTRIBUTE } from '../../../src/constants/attributes';

const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');
const getTimeRestrictionByNameAndNocSpy = jest.spyOn(aurora, 'getTimeRestrictionByNameAndNoc');
const insertTimeRestrictionSpy = jest.spyOn(aurora, 'insertTimeRestriction').mockResolvedValue();

beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(aurora, 'getFareDayEnd').mockResolvedValue('1234');
});

describe('manageTimeRestriction', () => {
    it('should return 302 redirect to /manageTimeRestriction when there have been no user inputs and update session with errors', async () => {
        const writeHeadMock = jest.fn();
        getTimeRestrictionByNameAndNocSpy.mockResolvedValueOnce([]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startTimemonday: '',
                endTimemonday: '',
                startTimetuesday: '',
                endTimetuesday: '',
                startTimewednesday: '',
                endTimewednesday: '',
                startTimethursday: '',
                endTimethursday: '',
                startTimefriday: '',
                endTimefriday: '',
                startTimesaturday: '',
                endTimesaturday: '',
                startTimesunday: '',
                endTimesunday: '',
                startTimebankHoliday: '',
                endTimebankHoliday: '',
                timeRestrictionName: '',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await manageTimeRestriction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/manageTimeRestriction',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_TIME_RESTRICTION_ATTRIBUTE, {
            errors: [
                { id: 'time-restriction-name', errorMessage: 'Time restriction name is required.', userInput: '' },
                { id: 'time-restriction-days', errorMessage: 'You must select at least one day.' },
            ],
            inputs: {
                name: '',
                contents: [],
            },
        });
    });

    it('should return 302 redirect to /manageTimeRestriction when there have been incorrect user inputs and update session with errors and inputs', async () => {
        const writeHeadMock = jest.fn();
        getTimeRestrictionByNameAndNocSpy.mockResolvedValueOnce([]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                timeRestrictionDays: ['monday', 'tuesday', 'wednesday', 'thursday'],
                startTimemonday: '',
                endTimemonday: '2200',
                startTimetuesday: '1200',
                endTimetuesday: '1200',
                startTimewednesday: '1200',
                endTimewednesday: '2400',
                startTimethursday: '-1',
                endTimethursday: '',
                startTimefriday: '',
                endTimefriday: '',
                startTimesaturday: '',
                endTimesaturday: '',
                startTimesunday: '',
                endTimesunday: '',
                startTimebankHoliday: '',
                endTimebankHoliday: '',
                timeRestrictionName: 'test',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await manageTimeRestriction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/manageTimeRestriction',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_TIME_RESTRICTION_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'Start time is required if end time is provided.',
                    id: 'start-time-monday-0',
                    userInput: '',
                },
                {
                    errorMessage: 'Start time and end time cannot be the same.',
                    id: 'start-time-tuesday-0',
                    userInput: '1200',
                },
                { errorMessage: '2400 is not a valid input. Use 0000.', id: 'end-time-wednesday-0', userInput: '2400' },
                { errorMessage: 'Time must be in 24hr format.', id: 'start-time-thursday-0', userInput: '-1' },
            ],
            inputs: {
                name: 'test',
                contents: [
                    { day: 'monday', timeBands: [{ startTime: '', endTime: '2200' }] },
                    { day: 'tuesday', timeBands: [{ startTime: '1200', endTime: '1200' }] },
                    { day: 'wednesday', timeBands: [{ startTime: '1200', endTime: '2400' }] },
                    { day: 'thursday', timeBands: [{ startTime: '-1', endTime: '' }] },
                ],
            },
        });
    });

    it('should return 302 redirect to /manageTimeRestriction when there have been correct user inputs but there is a group with the same name', async () => {
        const writeHeadMock = jest.fn();
        getTimeRestrictionByNameAndNocSpy.mockResolvedValueOnce([
            {
                id: 1,
                name: 'test',
                contents: [{ day: 'monday', timeBands: [] }],
            },
        ]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                timeRestrictionDays: ['monday', 'tuesday', 'wednesday', 'bankHoliday'],
                startTimemonday: '0600',
                endTimemonday: '2200',
                startTimetuesday: ['0600', '1300'],
                endTimetuesday: ['1200', '2200'],
                startTimewednesday: '0600',
                endTimewednesday: '',
                startTimethursday: '',
                endTimethursday: '',
                startTimefriday: '',
                endTimefriday: '',
                startTimesaturday: '',
                endTimesaturday: '',
                startTimesunday: '',
                endTimesunday: '',
                startTimebankHoliday: '',
                endTimebankHoliday: '',
                timeRestrictionName: 'test',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await manageTimeRestriction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/manageTimeRestriction',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_TIME_RESTRICTION_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: `You already have a time restriction named test. Choose another name.`,
                    id: 'time-restriction-name',
                    userInput: 'test',
                },
            ],
            inputs: {
                name: 'test',
                contents: [
                    { day: 'monday', timeBands: [{ startTime: '0600', endTime: '2200' }] },
                    {
                        day: 'tuesday',
                        timeBands: [
                            { startTime: '0600', endTime: '1200' },
                            { startTime: '1300', endTime: '2200' },
                        ],
                    },
                    { day: 'wednesday', timeBands: [{ startTime: '0600', endTime: '' }] },
                    { day: 'bankHoliday', timeBands: [] },
                ],
            },
        });
    });

    it('should return 302 redirect to /viewTimeRestrictions when there have been correct user inputs and the time restriction is saved to the db', async () => {
        const writeHeadMock = jest.fn();
        getTimeRestrictionByNameAndNocSpy.mockResolvedValueOnce([]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                timeRestrictionDays: ['monday', 'tuesday', 'wednesday', 'bankHoliday'],
                startTimemonday: '0600',
                endTimemonday: '2200',
                startTimetuesday: ['0600', '1300'],
                endTimetuesday: ['1200', '2200'],
                startTimewednesday: '0600',
                endTimewednesday: '',
                startTimethursday: '',
                endTimethursday: '',
                startTimefriday: '',
                endTimefriday: '',
                startTimesaturday: '',
                endTimesaturday: '',
                startTimesunday: '',
                endTimesunday: '',
                startTimebankHoliday: '',
                endTimebankHoliday: '',
                timeRestrictionName: 'test',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await manageTimeRestriction(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/viewTimeRestrictions',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_TIME_RESTRICTION_ATTRIBUTE, undefined);
        expect(insertTimeRestrictionSpy).toHaveBeenCalledWith(
            'TEST',
            [
                { day: 'monday', timeBands: [{ startTime: '0600', endTime: '2200' }] },
                {
                    day: 'tuesday',
                    timeBands: [
                        { startTime: '0600', endTime: '1200' },
                        { startTime: '1300', endTime: '2200' },
                    ],
                },
                { day: 'wednesday', timeBands: [{ startTime: '0600', endTime: '' }] },
                { day: 'bankHoliday', timeBands: [] },
            ],
            'test',
        );
    });

    it('should handle fare day end for time restrictions', async () => {
        const writeHeadMock = jest.fn();
        getTimeRestrictionByNameAndNocSpy.mockResolvedValueOnce([]);
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                timeRestrictionDays: ['monday', 'tuesday', 'wednesday', 'bankHoliday'],
                startTimemonday: '0600',
                endTimemonday: '2200',
                startTimetuesday: ['0600', '1300'],
                endTimetuesday: ['1200'],
                fareDayEndtuesday: 'on',
                startTimewednesday: '0600',
                fareDayEndwednesday: 'on',
                startTimethursday: '',
                endTimethursday: '',
                startTimefriday: '',
                endTimefriday: '',
                startTimesaturday: '',
                endTimesaturday: '',
                startTimesunday: '',
                endTimesunday: '',
                startTimebankHoliday: '',
                endTimebankHoliday: '',
                timeRestrictionName: 'test',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await manageTimeRestriction(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, GS_TIME_RESTRICTION_ATTRIBUTE, undefined);
        expect(insertTimeRestrictionSpy).toHaveBeenCalledWith(
            'TEST',
            [
                { day: 'monday', timeBands: [{ startTime: '0600', endTime: '2200' }] },
                {
                    day: 'tuesday',
                    timeBands: [
                        { startTime: '0600', endTime: '1200' },
                        { startTime: '1300', endTime: { fareDayEnd: true } },
                    ],
                },
                { day: 'wednesday', timeBands: [{ startTime: '0600', endTime: { fareDayEnd: true } }] },
                { day: 'bankHoliday', timeBands: [] },
            ],
            'test',
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/viewTimeRestrictions',
        });
    });
});
