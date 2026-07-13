import { AdminInitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import register, { nocsWithNoServices } from '../../../src/pages/api/register';
import * as auth from '../../../src/data/cognito';
import * as auroradb from '../../../src/data/auroradb';
import { getMockRequestAndResponse } from '../../testData/mockData';
import { USER_ATTRIBUTE } from '../../../src/constants/attributes';
import { getAllServicesByNocCode } from '../../../src/data/auroradb';
import * as sessions from '../../../src/utils/sessions';

describe('register', () => {
    const mockAuthResponse: AdminInitiateAuthCommandOutput = {
        $metadata: {},
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ChallengeParameters: {
            USER_ID_FOR_SRP: 'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
            userAttributes: JSON.stringify({
                'custom:noc': 'DCCL',
            }),
        },
        Session: 'session',
    };

    const getAllServicesByNocCodeSpy = jest.spyOn(auroradb, 'getAllServicesByNocCode');
    const authSignInSpy = jest.spyOn(auth, 'initiateAuth');
    const authCompletePasswordSpy = jest.spyOn(auth, 'respondToNewPasswordChallenge');
    const authUpdateAttributesSpy = jest.spyOn(auth, 'updateUserAttributes');
    const authSignOutSpy = jest.spyOn(auth, 'globalSignOut');
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    beforeEach(() => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockAuthResponse));
        authCompletePasswordSpy.mockImplementation(() => Promise.resolve());
        authSignOutSpy.mockImplementation(() => Promise.resolve());
        authUpdateAttributesSpy.mockImplementation(() => Promise.resolve());
        getAllServicesByNocCodeSpy.mockImplementation(() =>
            Promise.resolve([
                {
                    id: 11,
                    lineName: '2AC',
                    lineId: '3h3vb32ik',
                    startDate: '01012020',
                    description: 'linename for service ',
                    serviceCode: 'NW_05_BLAC_2C_1',
                    endDate: null,
                },
            ]),
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    const writeHeadMock = jest.fn();

    const cases = [
        [
            'empty email',
            {
                email: '',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: '',
                        id: 'email',
                        errorMessage: 'Enter an email address in the correct format, like name@example.com',
                    },
                ],
            },
        ],
        [
            'password less than 8 characters',
            {
                email: 'test@test.com',
                password: 'Abchi1!',
                confirmPassword: 'Abchi1!',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage: 'Password must be at least 8 characters long',
                    },
                ],
            },
        ],
        [
            'password is empty',
            {
                email: 'test@test.com',
                password: '',
                confirmPassword: 'chromosoneTelepathyDinosaur',
                regKey: 'abcdefg',
                checkboxUserResearch: '',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage: 'Enter a password',
                    },
                ],
            },
        ],
        [
            'passwords fields do not match',
            {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosa',
                regKey: 'abcdefg',
                checkboxUserResearch: '',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    { userInput: '', id: 'password', errorMessage: 'Passwords do not match' },
                ],
            },
        ],
        [
            'password does not contain special character',
            {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1',
                confirmPassword: 'chromosoneTelepathyDinosaur1',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage: 'Password must contain at least one special character',
                    },
                ],
            },
        ],
        [
            'password does not contain uppercase letter',
            {
                email: 'test@test.com',
                password: 'chromosonetelepathydinosaur1!',
                confirmPassword: 'chromosonetelepathydinosaur1!',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage: 'Password must contain at least one uppercase letter',
                    },
                ],
            },
        ],
        [
            'password does not contain lowercase letter',
            {
                email: 'test@test.com',
                password: 'CHROMOSONETELEPATHYDINOSAUR1!',
                confirmPassword: 'CHROMOSONETELEPATHYDINOSAUR1!',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage: 'Password must contain at least one lowercase letter',
                    },
                ],
            },
        ],
        [
            'password does not conform to multiple aspects of password policy',
            {
                email: 'test@test.com',
                password: 'chromosonetelepathydinosaur',
                confirmPassword: 'chromosonetelepathydinosaur',
                regKey: 'abcdefg',
                checkboxUserResearch: 'checkboxUserResearch',
            },
            {
                errors: [
                    {
                        userInput: 'test@test.com',
                        id: 'email',
                        errorMessage: '',
                    },
                    {
                        userInput: '',
                        id: 'password',
                        errorMessage:
                            'Password must contain at least one uppercase letter, contain at least one number, and contain at least one special character',
                    },
                ],
            },
        ],
    ];

    test.each(cases)('given %p, sets the correct error attribute', async (_, testData, expectedAttributeValue) => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: testData,
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, expectedAttributeValue);
    });

    it('should redirect when successfully signed in', async () => {
        authSignInSpy.mockImplementation(() => Promise.resolve(mockAuthResponse));
        authCompletePasswordSpy.mockImplementation(() => Promise.resolve());
        authSignOutSpy.mockImplementation(() => Promise.resolve());
        authUpdateAttributesSpy.mockImplementation(() => Promise.resolve());

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefg');
        expect(authCompletePasswordSpy).toHaveBeenCalledWith(
            'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
            'chromosoneTelepathyDinosaur1!',
            'session',
        );
        expect(authSignOutSpy).toHaveBeenCalled();
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/confirmRegistration',
        });
    });

    it('should redirect when there are no services for the noc code', async () => {
        (getAllServicesByNocCode as jest.Mock).mockImplementation(() => []);

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/noServices',
        });
    });

    it('should error when the sign in fails', async () => {
        authSignInSpy.mockImplementation(() => {
            throw new Error('Auth failed');
        });

        const mockUserAttributeValue = {
            errors: [
                {
                    userInput: 'test@test.com',
                    id: 'email',
                    errorMessage: '',
                },
                {
                    userInput: '',
                    id: 'email',
                    errorMessage: 'There was a problem creating your account',
                },
            ],
        };

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, USER_ATTRIBUTE, mockUserAttributeValue);
    });

    it('should update user attributes as contactable=yes if yes', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
                contactable: 'yes',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(authUpdateAttributesSpy).toHaveBeenCalledWith('test@test.com', [
            { Name: 'custom:contactable', Value: 'yes' },
        ]);
        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefg');
        expect(authCompletePasswordSpy).toHaveBeenCalledWith(
            'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
            'chromosoneTelepathyDinosaur1!',
            'session',
        );
        expect(authSignOutSpy).toHaveBeenCalled();
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/confirmRegistration',
        });
    });

    it('should update user attributes as contactable=no if empty', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                email: 'test@test.com',
                password: 'chromosoneTelepathyDinosaur1!',
                confirmPassword: 'chromosoneTelepathyDinosaur1!',
                regKey: 'abcdefg',
                contactable: '',
            },
            uuid: '',
            mockWriteHeadFn: writeHeadMock,
        });

        await register(req, res);

        expect(authUpdateAttributesSpy).toHaveBeenCalledWith('test@test.com', [
            { Name: 'custom:contactable', Value: 'no' },
        ]);
        expect(authSignInSpy).toHaveBeenCalledWith('test@test.com', 'abcdefg');
        expect(authCompletePasswordSpy).toHaveBeenCalledWith(
            'd3eddd2a-a1c6-4201-82d3-bdab8dcbb586',
            'chromosoneTelepathyDinosaur1!',
            'session',
        );
        expect(authSignOutSpy).toHaveBeenCalled();
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/confirmRegistration',
        });
    });
});

describe('nocsWithNoServices', () => {
    const getAllServicesByNocCodeSpy = jest.spyOn(auroradb, 'getAllServicesByNocCode');
    afterEach(() => {
        getAllServicesByNocCodeSpy.mockReset();
    });
    it('returns the correct noc codes if all noc codes have no TNDS data', async () => {
        getAllServicesByNocCodeSpy.mockImplementation(() => Promise.resolve([]));
        const result = await nocsWithNoServices(['AAA', 'BBB']);
        expect(result.length).toBe(2);
        expect(result).toStrictEqual(['AAA', 'BBB']);
    });

    it('returns the correct noc codes if some noc codes have no TNDS data', async () => {
        getAllServicesByNocCodeSpy
            .mockImplementationOnce(() =>
                Promise.resolve([
                    {
                        id: 11,
                        lineName: '2AC',
                        lineId: '3h3vb32ik',
                        startDate: '01012020',
                        description: 'linename for service ',
                        serviceCode: 'NW_05_BLAC_2C_1',
                        endDate: null,
                    },
                ]),
            )
            .mockImplementationOnce(() => Promise.resolve([]));
        const result = await nocsWithNoServices(['AAA', 'BBB']);
        expect(result.length).toBe(1);
        expect(result).toStrictEqual(['BBB']);
    });

    it('returns a result with true if noc codes have TNDS data', async () => {
        getAllServicesByNocCodeSpy
            .mockImplementationOnce(() =>
                Promise.resolve([
                    {
                        id: 11,
                        lineName: '2AC',
                        lineId: '3h3vb32ik',
                        startDate: '01012020',
                        description: 'linename for service ',
                        serviceCode: 'NW_05_BLAC_2C_1',
                        endDate: null,
                    },
                ]),
            )
            .mockImplementationOnce(() =>
                Promise.resolve([
                    {
                        id: 11,
                        lineName: '2AD',
                        lineId: '3h3vb32ik',
                        startDate: '03012020',
                        description: 'another linename for service ',
                        serviceCode: 'NW_05_BLAC_2C_1',
                        endDate: null,
                    },
                ]),
            );
        const result = await nocsWithNoServices(['AAA', 'BBB']);
        expect(result.length).toBe(0);
        expect(result).toStrictEqual([]);
    });
});
