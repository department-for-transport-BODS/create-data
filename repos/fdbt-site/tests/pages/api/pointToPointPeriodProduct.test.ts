import { POINT_TO_POINT_PRODUCT_ATTRIBUTE } from '../../../src/constants/attributes';
import * as sessions from '../../../src/utils/sessions';
import { getMockRequestAndResponse } from '../../testData/mockData';
import pointToPointPeriodProduct from '../../../src/pages/api/pointToPointPeriodProduct';

jest.mock('../../../src/utils/sessions');

describe('pointToPointPeriodProduct', () => {
    const updateAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    const writeHeadMock = jest.fn();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('should set PRODUCT_DETAILS_ATTRIBUTE with errors and redirect to carnetProductDetails when the user input is empty', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                productNameInput: '',
                productDuration: '',
                durationUnits: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const productInputWithErrors = {
            errors: [
                {
                    errorMessage: 'Product name cannot have less than 2 characters',
                    id: 'point-to-point-period-product-name',
                },
                { errorMessage: 'Product duration cannot be empty', id: 'product-details-expiry-quantity' },
                { errorMessage: 'Select a valid expiry unit', id: 'product-details-expiry-unit' },
            ],
            productDuration: '',
            productDurationUnits: '',
            productName: '',
        };

        pointToPointPeriodProduct(req, res);

        expect(updateAttributeSpy).toHaveBeenCalledWith(req, POINT_TO_POINT_PRODUCT_ATTRIBUTE, productInputWithErrors);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/pointToPointPeriodProduct',
        });
    });

    it('should set PRODUCT_DETAILS_ATTRIBUTE with errors and redirect to carnetProductDetails when the user input is present but invalid', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                productNameInput: 'd',
                productDuration: 'seven',
                durationUnits: 'fortnights',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const productInputWithErrors = {
            errors: [
                {
                    errorMessage: 'Product name cannot have less than 2 characters',
                    id: 'point-to-point-period-product-name',
                },
                {
                    errorMessage: 'Product duration must be a whole, positive number',
                    id: 'product-details-expiry-quantity',
                },
                { errorMessage: 'Select a valid expiry unit', id: 'product-details-expiry-unit' },
            ],
            productDuration: 'seven',
            productDurationUnits: 'fortnights',
            productName: 'd',
        };

        pointToPointPeriodProduct(req, res);

        expect(updateAttributeSpy).toHaveBeenCalledWith(req, POINT_TO_POINT_PRODUCT_ATTRIBUTE, productInputWithErrors);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/pointToPointPeriodProduct',
        });
    });

    it('should set PRODUCT_DETAILS_ATTRIBUTE with the inputted product and redirect to carnetProductDetails when the user input is present and valid', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                productNameInput: 'My product',
                productDuration: '7',
                durationUnits: 'week',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const productInput = {
            productDuration: '7',
            productDurationUnits: 'week',
            productName: 'My product',
        };

        pointToPointPeriodProduct(req, res);

        expect(updateAttributeSpy).toHaveBeenCalledWith(req, POINT_TO_POINT_PRODUCT_ATTRIBUTE, productInput);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPeriodValidity',
        });
    });

    it('should clear any excess whitespace and set the product as per happy path', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                productNameInput: '   My      product    ',
                productDuration: '    7   ',
                durationUnits: 'week',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        const productInput = {
            productDuration: '7',
            productDurationUnits: 'week',
            productName: 'My product',
        };

        pointToPointPeriodProduct(req, res);

        expect(updateAttributeSpy).toHaveBeenCalledWith(req, POINT_TO_POINT_PRODUCT_ATTRIBUTE, productInput);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/selectPeriodValidity',
        });
    });
});
