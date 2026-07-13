import { expectedFlatFareTicket, getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import pricingPerDistance, { validateInput } from '../../../src/pages/api/pricingPerDistance';
import { DistancePricingData, DistanceBand, ErrorInfo } from '../../../src/interfaces';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRICING_PER_DISTANCE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import * as userData from '../../../src/utils/apiUtils/userData';
import { TicketWithIds } from '../../../src/interfaces/matchingJsonTypes';

describe('pricingPerDistance', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('correctly generates pricing by distance info, updates the PRICING_PER_DISTANCE_ATTRIBUTE and then redirects to /additionalPricingStructures if all is valid', async () => {
        const mockPricingDataInfo: DistancePricingData = {
            maximumPrice: '4.50',
            minimumPrice: '3',
            distanceBands: [
                {
                    distanceFrom: '0',
                    distanceTo: '2',
                    pricePerKm: '5',
                },
                {
                    distanceFrom: '2',
                    distanceTo: 'Max',
                    pricePerKm: '5',
                },
            ],
            productName: 'Product',
        };

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '2',
                distanceTo0: '2',
                maximumPrice: '4.50',
                minimumPrice: '3',
                pricePerKm1: '5',
                pricePerKm0: '5',
                productName: 'Product',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            PRICING_PER_DISTANCE_ATTRIBUTE,
            mockPricingDataInfo,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/additionalPricingStructures' });
    });

    it('correctly generates pricing by distance info, updates the ticket and then redirects to /product details if all is valid', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '2',
                distanceTo0: '2',
                maximumPrice: '4',
                minimumPrice: '3',
                pricePerKm1: '5',
                pricePerKm0: '5',
                productName: 'Product',
            },
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedFlatFareTicket as TicketWithIds,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, undefined);
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/products/productDetails?productId=2' });
    });

    it('produces an error when distanceTo is empty', async () => {
        const errors: ErrorInfo[] = [
            {
                id: `distance-to-0`,
                errorMessage: 'Enter a value for the distance',
            },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '3',
                distanceTo0: '',
                maximumPrice: '4',
                minimumPrice: '3',
                pricePerKm1: '5',
                pricePerKm0: '6',
                productName: 'Product',
            },
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
            maximumPrice: '4',
            minimumPrice: '3',
            distanceBands: [
                {
                    distanceFrom: '0',
                    distanceTo: '',
                    pricePerKm: '6',
                },
                {
                    distanceFrom: '3',
                    distanceTo: 'Max',
                    pricePerKm: '5',
                },
            ],
            productName: 'Product',
            errors,
        });
    });

    it('produces an error when distanceFrom is empty', async () => {
        const errors: ErrorInfo[] = [
            {
                id: `distance-from-1`,
                errorMessage: 'Enter a value for the distance',
            },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '',
                distanceTo0: '2',
                maximumPrice: '4',
                minimumPrice: '3',
                pricePerKm1: '5',
                pricePerKm0: '5',
                productName: 'Product',
            },
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
            errors,
            maximumPrice: '4',
            minimumPrice: '3',
            distanceBands: [
                { distanceFrom: '0', distanceTo: '2', pricePerKm: '5' },
                {
                    distanceFrom: '',
                    distanceTo: 'Max',
                    pricePerKm: '5',
                },
            ],
            productName: 'Product',
        });
    });

    it('produces an error when maximumPrice is empty', async () => {
        const errors: ErrorInfo[] = [
            {
                id: `maximum-price`,
                errorMessage: 'Enter a price for the distance',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '2',
                distanceTo0: '2',
                maximumPrice: '',
                minimumPrice: '3',
                pricePerKm1: '5',
                pricePerKm0: '2',
                productName: 'Product',
            },
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
            maximumPrice: '',
            minimumPrice: '3',
            distanceBands: [
                {
                    distanceFrom: '0',
                    distanceTo: '2',
                    pricePerKm: '2',
                },
                {
                    distanceFrom: '2',
                    distanceTo: 'Max',
                    pricePerKm: '5',
                },
            ],
            productName: 'Product',
            errors,
        });
    });

    it('produces an error when minimumPrice is empty', async () => {
        const errors: ErrorInfo[] = [
            {
                id: `minimum-price`,
                errorMessage: 'Enter a price for the distance',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '2',
                distanceTo0: '2',
                maximumPrice: '3',
                minimumPrice: '',
                pricePerKm1: '5',
                pricePerKm0: '5',
                productName: 'Product',
            },
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
            maximumPrice: '3',
            minimumPrice: '',
            distanceBands: [
                {
                    distanceFrom: '0',
                    distanceTo: '2',
                    pricePerKm: '5',
                },
                {
                    distanceFrom: '2',
                    distanceTo: 'Max',
                    pricePerKm: '5',
                },
            ],
            productName: 'Product',
            errors,
        });
    });

    it('produces an error when pricePerKm is empty', async () => {
        const errors: ErrorInfo[] = [
            {
                id: `price-per-km-1`,
                errorMessage: 'Enter a price for the distance',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                distanceFrom1: '2',
                distanceTo0: '2',
                maximumPrice: '3',
                minimumPrice: '2',
                pricePerKm0: '2',
                pricePerKm1: '',
                productName: 'Product',
            },
        });

        await pricingPerDistance(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
            maximumPrice: '3',
            minimumPrice: '2',
            distanceBands: [
                { distanceFrom: '0', distanceTo: '2', pricePerKm: '2' },
                {
                    distanceFrom: '2',
                    distanceTo: 'Max',
                    pricePerKm: '',
                },
            ],
            productName: 'Product',
            errors,
        });
    });
});

describe('validate input tests', () => {
    it('validates input for distance from', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '2',
                pricePerKm: '5',
            },
            {
                distanceFrom: 'a',
                distanceTo: 'Max',
                pricePerKm: '5',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: `distance-from-1`, errorMessage: 'Distances must be whole numbers' },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
        ];

        const errors = validateInput(pricePerDistances, 1, '3', '4', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('validates input for distance to', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: 'b',
                pricePerKm: '5',
            },
            {
                distanceFrom: '3',
                distanceTo: 'Max',
                pricePerKm: '5',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: 'distance-to-0', errorMessage: 'Distances must be whole numbers' },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
        ];

        const errors = validateInput(pricePerDistances, 1, '3', '4', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('checks that distances input must be whole numbers', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '1.56',
                pricePerKm: '5',
            },
            {
                distanceFrom: '3',
                distanceTo: 'Max',
                pricePerKm: '5',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: 'distance-to-0', errorMessage: 'Distances must be whole numbers' },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
        ];

        const errors = validateInput(pricePerDistances, 1, '3', '4', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('validates input for maximum price', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '3',
                pricePerKm: '5',
            },
            {
                distanceFrom: '3',
                distanceTo: 'Max',
                pricePerKm: '5',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: `maximum-price`, errorMessage: 'This must be a valid price in pounds and pence' },
        ];

        const errors = validateInput(pricePerDistances, 1, '2', 'a', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('validates input for minimum price', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '3',
                pricePerKm: '5',
            },
            {
                distanceFrom: '3',
                distanceTo: 'Max',
                pricePerKm: '5',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: `minimum-price`, errorMessage: 'This must be a valid price in pounds and pence' },
        ];

        const errors = validateInput(pricePerDistances, 1, 'a', '2', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('validates input for price per km', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '3',
                pricePerKm: '2',
            },
            {
                distanceFrom: '3',
                distanceTo: 'Max',
                pricePerKm: 'a',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            { id: `price-per-km-1`, errorMessage: 'This must be a valid price in pounds and pence' },
        ];

        const errors = validateInput(pricePerDistances, 1, '1', '2', 'Product');

        expect(errors).toEqual(errorsResult);
    });

    it('validates ranges so that distanceFrom must be less than distanceTo and distanceTo of prior row is equal to distanceFrom', () => {
        const pricePerDistances: DistanceBand[] = [
            {
                distanceFrom: '0',
                distanceTo: '3',
                pricePerKm: '2',
            },
            {
                distanceFrom: '4',
                distanceTo: '3',
                pricePerKm: '2',
            },
            {
                distanceFrom: '5',
                distanceTo: 'Max',
                pricePerKm: '2',
            },
        ];
        const errorsResult: ErrorInfo[] = [
            {
                id: 'distance-from-2',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
            {
                id: 'distance-from-1',
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            },
            { id: 'distance-from-1', errorMessage: 'Distance from must be less than distance to in the same row' },
        ];

        const errors = validateInput(pricePerDistances, 1, '1', '2', 'Product');

        expect(errors).toEqual(errorsResult);
    });
});
