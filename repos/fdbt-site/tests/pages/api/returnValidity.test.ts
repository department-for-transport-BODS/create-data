import {
    expectedPeriodMultipleServicesTicketWithMultipleProducts,
    getMockRequestAndResponse,
} from '../../testData/mockData';
import returnValidity, {
    returnValiditySchema,
    getErrorIdFromValidityError,
    formatRequestBody,
} from '../../../src/pages/api/returnValidity';
import * as sessions from '../../../src/utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    RETURN_VALIDITY_ATTRIBUTE,
} from '../../../src/constants/attributes';
import { ErrorInfo } from '../../../src/interfaces';
import * as userData from '../../../src/utils/apiUtils/userData';

jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/utils/apiUtils/userData');

describe('returnValidity', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('returnValiditySchema', () => {
        it.each([
            [{}, false],
            [{ validity: 'No' }, true],
            [{ validity: 'Yes' }, false],
            [{ validity: 'Yes', amount: '5' }, false],
            [{ validity: 'Yes', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '7', duration: 'day' }, true],
            [{ validity: 'Yes', amount: 'abc', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '   ', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '0', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '-17', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '1.74', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '6', duration: 'hello there' }, false],
            [{ validity: 'Yes', amount: '365', duration: 'day' }, true],
            [{ validity: 'Yes', amount: '366', duration: 'day' }, false],
            [{ validity: 'Yes', amount: '260', duration: 'week' }, true],
            [{ validity: 'Yes', amount: '1001', duration: 'week' }, false],
            [{ validity: 'Yes', amount: '120', duration: 'month' }, true],
            [{ validity: 'Yes', amount: '1210', duration: 'month' }, false],
            [{ validity: 'Yes', amount: '5', duration: 'year' }, true],
        ])('should validate that %s is %s', (candidate, validity) => {
            const result = returnValiditySchema.isValidSync(candidate);
            expect(result).toEqual(validity);
        });
    });

    describe('getErrorIdFromValidityError', () => {
        it.each([
            ['return-validity-defined', 'validity'],
            ['return-validity-amount', 'amount'],
            ['return-validity-units', 'duration'],
        ])('should return the id as %s when the error path is %s', (expectedId, errorPath) => {
            const actualId = getErrorIdFromValidityError(errorPath);
            expect(actualId).toEqual(expectedId);
        });

        it('should throw an error when the error path does not match a valid input field', () => {
            expect(() => getErrorIdFromValidityError('notValid')).toThrow();
        });
    });

    describe('formatRequestBody', () => {
        it('should remove whitespace from the request body text input of amount', () => {
            const reqBodyParams = { validity: 'Yes' };
            const { req } = getMockRequestAndResponse({
                cookieValues: {},
                body: { amount: '   2   4', ...reqBodyParams },
            });
            const filtered = formatRequestBody(req);
            expect(filtered).toEqual({ amount: '24', ...reqBodyParams });
        });
    });

    it('should set the RETURN_VALIDITY_ATTRIBUTE and redirect to /selectSalesOfferPackage when no errors are found and validity info is entered', async () => {
        const mockPassengerTypeDetails = {
            amount: '6',
            typeOfDuration: 'week',
        };
        const mockBody = {
            amount: '6',
            duration: 'week',
            validity: 'Yes',
        };
        const { req, res } = getMockRequestAndResponse({
            body: mockBody,
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            RETURN_VALIDITY_ATTRIBUTE,
            mockPassengerTypeDetails,
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/ticketConfirmation',
        });
    });

    it('should set the RETURN_VALIDITY_ATTRIBUTE to 1 day and redirect to /selectSalesOfferPackage when no errors are found and no validity info is entered', async () => {
        const mockBody = {
            validity: 'No',
        };
        const { req, res } = getMockRequestAndResponse({
            body: mockBody,
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, {
            amount: '1',
            typeOfDuration: 'day',
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/ticketConfirmation',
        });
    });

    it('should set the RETURN_VALIDITY_ATTRIBUTE with errors and redirect to itself (i.e. /returnValidity) when there are errors present', async () => {
        const mockReturnValidityDetails = {
            validity: 'Yes',
            amount: '1500',
            duration: 'week',
        };
        const mockErrors: ErrorInfo[] = [
            {
                errorMessage: 'Enter a whole number greater than 0 and less than 1000',
                id: 'return-validity-amount',
                userInput: '1500',
            },
        ];
        const { req, res } = getMockRequestAndResponse({
            body: mockReturnValidityDetails,
            mockWriteHeadFn: writeHeadMock,
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, {
            amount: mockReturnValidityDetails.amount,
            typeOfDuration: mockReturnValidityDetails.duration,
            errors: mockErrors,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/returnValidity',
        });
    });

    it('should clear the RETURN_VALIDITY_ATTRIBUTE, update the ticket with a returnPeriodValidity in s3, and redirect back to /productDetails when in edit mode', async () => {
        const mockReturnValidityDetails = {
            validity: 'Yes',
            amount: '200',
            duration: 'week',
        };
        const { req, res } = getMockRequestAndResponse({
            body: mockReturnValidityDetails,
            mockWriteHeadFn: writeHeadMock,
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedPeriodMultipleServicesTicketWithMultipleProducts,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, undefined);
        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedPeriodMultipleServicesTicketWithMultipleProducts,
                returnPeriodValidity: { amount: '200', typeOfDuration: 'week' },
            },
            'test/path',
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=22D',
        });
    });

    it('should clear the RETURN_VALIDITY_ATTRIBUTE, update the ticket with no returnPeriodValidity in s3, and redirect back to /productDetails when in edit mode', async () => {
        const mockReturnValidityDetails = {
            validity: 'No',
        };
        const { req, res } = getMockRequestAndResponse({
            body: mockReturnValidityDetails,
            mockWriteHeadFn: writeHeadMock,
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedPeriodMultipleServicesTicketWithMultipleProducts,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
        });
        await returnValidity(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, RETURN_VALIDITY_ATTRIBUTE, undefined);
        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedPeriodMultipleServicesTicketWithMultipleProducts,
                returnPeriodValidity: undefined,
            },
            'test/path',
        );
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=22D',
        });
    });
});
