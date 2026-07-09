import productDateInformation from '../../../src/pages/api/productDateInformation';
import * as sessions from '../../../src/utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import { expectedSingleTicket, getMockRequestAndResponse } from '../../testData/mockData';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as aurora from '../../../src/data/auroradb';

jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/data/auroradb');

describe('productDataInformation', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    const auroraSpy = jest.spyOn(aurora, 'updateProductDates');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));
    auroraSpy.mockImplementation(() => Promise.resolve());
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('it should add error to session if there is no start date entered', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            errors: [{ errorMessage: 'Enter a full start date', id: 'start-day-input' }],
            dates: {},
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/productDateInformation',
        });
    });

    it('it should throw an error and update the PRODUCT_DATE_ATTRIBUTE if the start or end date are not filled in correctly', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '',
                endDateDay: '12',
                endDateMonth: '',
                endDateYear: '2020',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            errors: [{ errorMessage: 'Enter a full start date', id: 'start-day-input' }],
            dates: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '',
                endDateDay: '12',
                endDateMonth: '',
                endDateYear: '2020',
            },
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/productDateInformation',
        });
    });

    it('it should validate the start and end date and error if the end date is less than the start date', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2020',
                endDateDay: '12',
                endDateMonth: '12',
                endDateYear: '2019',
                productDates: 'Yes',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'The end date must be after the start date',
                    id: 'end-day-input',
                },
            ],
            dates: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2020',
                endDateDay: '12',
                endDateMonth: '12',
                endDateYear: '2019',
            },
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/productDateInformation',
        });
    });

    it('it should not let the user enter a start year or end date year beyond 2099', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2150',
                endDateDay: '12',
                endDateMonth: '12',
                endDateYear: '2019',
                productDates: 'Yes',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            errors: [
                {
                    errorMessage: 'Enter a date with a year before 2099',
                    id: 'start-year-input',
                },
            ],
            dates: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2150',
                endDateDay: '12',
                endDateMonth: '12',
                endDateYear: '2019',
            },
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/productDateInformation',
        });
    });

    it('it should set the start and end date when entered correctly and redirect to confirmation page', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2020',
                endDateDay: '15',
                endDateMonth: '12',
                endDateYear: '2020',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            startDate: '2020-12-12T00:00:00.000Z',
            endDate: '2020-12-15T23:59:59.000Z',
            dateInput: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2020',
                endDateDay: '15',
                endDateMonth: '12',
                endDateYear: '2020',
            },
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/salesConfirmation',
        });
    });

    it('it should only set the start date when start date only entered and redirect to confirmation page', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '06',
                startDateMonth: '08',
                startDateYear: '2021',
                endDateDay: '',
                endDateMonth: '',
                endDateYear: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await productDateInformation(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRODUCT_DATE_ATTRIBUTE, {
            startDate: '2021-08-06T00:00:00.000Z',
            dateInput: {
                startDateDay: '06',
                startDateMonth: '08',
                startDateYear: '2021',
                endDateDay: '',
                endDateMonth: '',
                endDateYear: '',
            },
        });

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/salesConfirmation',
        });
    });

    it('should update the product Date information when in edit mode and redirect back to products/productDetails', async () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                startDateDay: '12',
                startDateMonth: '12',
                startDateYear: '2020',
                endDateDay: '15',
                endDateMonth: '12',
                endDateYear: '2020',
                productDates: 'Yes',
            },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedSingleTicket,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    serviceId: '22D',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await productDateInformation(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            {
                ...expectedSingleTicket,
                ticketPeriod: {
                    startDate: '2020-12-12T00:00:00.000Z',
                    endDate: '2020-12-15T23:59:59.000Z',
                },
            },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2&serviceId=22D',
        });
    });
});
