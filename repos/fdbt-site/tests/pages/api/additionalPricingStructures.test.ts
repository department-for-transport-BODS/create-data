import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import additionalPricingStructures, {
    validateAdditionalStructuresInput,
} from '../../../src/pages/api/additionalPricingStructures';
import { ErrorInfo, AdditionalPricing } from '../../../src/interfaces';
import { ADDITIONAL_PRICING_ATTRIBUTE } from '../../../src/constants/attributes';

describe('additionalPricingStructures', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('correctly generates additional capPricing structures info, updates the  ADDITIONAL_PRICING_ATTRIBUTE and then redirects to /capConfirmation if all is valid', () => {
        const mockAdditionalStructuresInfo: AdditionalPricing = {
            pricingStructureStart: '2',
            structureDiscount: '2',
        };

        const { req, res } = getMockRequestAndResponse({
            body: {
                additionalDiscounts: 'yes',
                pricingStructureStart: '2',
                structureDiscount: '2',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        additionalPricingStructures(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            ADDITIONAL_PRICING_ATTRIBUTE,
            mockAdditionalStructuresInfo,
        );

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/capConfirmation' });
    });

    it('produces an error when additionalDiscounts is empty', () => {
        const errors: ErrorInfo[] = [{ id: 'additional-discounts', errorMessage: 'Select an option' }];

        const { req, res } = getMockRequestAndResponse({
            body: {
                additionalDiscounts: '',
                pricingStructureStart: '2',
                structureDiscount: '2',
            },
        });

        additionalPricingStructures(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ADDITIONAL_PRICING_ATTRIBUTE, {
            additionalPricingStructures: {
                pricingStructureStart: '2',
                structureDiscount: '2',
                errors,
            },
            clickedYes: false,
        });
    });

    it('does not generate additional capPricing structures info, then redirects to /capConfirmation when no is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                additionalDiscounts: 'no',
                pricingStructureStart: '',
                structureDiscount: '',
            },
            mockWriteHeadFn: writeHeadMock,
        });

        additionalPricingStructures(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ADDITIONAL_PRICING_ATTRIBUTE, undefined);

        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/capConfirmation' });
    });

    it('produces an error when pricingStructureStart is empty', () => {
        const errors: ErrorInfo[] = [
            {
                id: 'capPricing-structure-start',
                errorMessage: 'Enter a value for the Time allowance after first journey',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                additionalDiscounts: 'yes',
                pricingStructureStart: '',
                structureDiscount: '2',
            },
        });

        additionalPricingStructures(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ADDITIONAL_PRICING_ATTRIBUTE, {
            additionalPricingStructures: {
                pricingStructureStart: '',
                structureDiscount: '2',
                errors,
            },
            clickedYes: true,
        });
    });

    it('produces an error when structureDiscount is empty', () => {
        const errors: ErrorInfo[] = [
            {
                id: 'structure-discount',
                errorMessage: 'Enter a value for the Percentage discount',
            },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                additionalDiscounts: 'yes',
                pricingStructureStart: '2',
                structureDiscount: '',
            },
        });

        additionalPricingStructures(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, ADDITIONAL_PRICING_ATTRIBUTE, {
            additionalPricingStructures: {
                pricingStructureStart: '2',
                structureDiscount: '',
                errors,
            },
            clickedYes: true,
        });
    });
});

describe('validate additional structures input tests', () => {
    it('validates input for pricingStructureStart', () => {
        const pricingStructureStart = '2.22';
        const structureDiscount = '2';

        const errorsResult: ErrorInfo[] = [
            {
                id: 'capPricing-structure-start',
                errorMessage: 'Time allowance after first journey must be a whole number',
            },
        ];

        const errors = validateAdditionalStructuresInput(pricingStructureStart, structureDiscount);

        expect(errors).toEqual(errorsResult);
    });
    it('validates input for structureDiscount', () => {
        const pricingStructureStart = '2';
        const structureDiscount = '2.222';

        const errorsResult: ErrorInfo[] = [
            {
                id: 'structure-discount',
                errorMessage: 'This must be a valid Percentage discount number to 2 decimal places',
            },
        ];

        const errors = validateAdditionalStructuresInput(pricingStructureStart, structureDiscount);

        expect(errors).toEqual(errorsResult);
    });
    it('makes sure no negative numbers are allowed', () => {
        const pricingStructureStart = '-2';
        const structureDiscount = '-2.22';

        const errorsResult: ErrorInfo[] = [
            {
                id: 'capPricing-structure-start',
                errorMessage: 'Time allowance after first journey cannot be a negative number',
            },
            {
                id: 'structure-discount',
                errorMessage: 'Percentage discount cannot be a negative number',
            },
        ];

        const errors = validateAdditionalStructuresInput(pricingStructureStart, structureDiscount);

        expect(errors).toEqual(errorsResult);
    });
});
