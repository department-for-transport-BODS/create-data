import startCase from 'lodash/startCase';
import { NextApiResponse } from 'next';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRICING_PER_DISTANCE_ATTRIBUTE,
} from '../../constants/attributes';
import { getFareTypeFromFromAttributes, redirectTo, redirectToError } from '../../utils/apiUtils';
import { checkProductOrCapNameIsValid, isCurrency } from '../../utils/apiUtils/validator';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import { DistanceBand, DistancePricingData, ErrorInfo, NextApiRequestWithSession } from '../../interfaces';
import { putUserDataInProductsBucketWithFilePath } from '../../utils/apiUtils/userData';
import { Ticket, WithIds } from '../../interfaces/matchingJsonTypes';

export const checkInputIsValid = (inputtedValue: string | undefined, inputType: string): string => {
    let error;

    if (!inputtedValue) {
        error = inputType === 'price' ? 'Enter a price for the distance' : 'Enter a value for the distance';
    } else if (Math.sign(Number(inputtedValue)) === -1) {
        error = `${startCase(inputType)}s cannot be negative numbers`;
    } else if (!isCurrency(inputtedValue) && inputType === 'price') {
        error = 'This must be a valid price in pounds and pence';
    } else if (!Number.isInteger(Number(inputtedValue)) && inputtedValue !== 'Max' && inputType !== 'price') {
        error = 'Distances must be whole numbers';
    }

    if (error) {
        return error;
    }

    return '';
};

export const validateInput = (
    pricePerDistances: DistanceBand[],
    lastIndex: number,
    minimumPrice: string,
    maximumPrice: string,
    productName: string,
): ErrorInfo[] => {
    const errors: ErrorInfo[] = [];

    const productNameError = checkProductOrCapNameIsValid(productName, 'product');
    if (productNameError) {
        errors.push({
            id: 'product-name',
            errorMessage: productNameError,
        });
    }
    const minimumPriceError = checkInputIsValid(minimumPrice, 'price');
    if (minimumPriceError) {
        errors.push({
            id: 'minimum-price',
            errorMessage: minimumPriceError,
        });
    }
    const maximumPriceError = checkInputIsValid(maximumPrice, 'price');
    if (maximumPriceError) {
        errors.push({
            id: 'maximum-price',
            errorMessage: maximumPriceError,
        });
    }
    pricePerDistances.forEach((distancePricing, index: number) => {
        const { distanceFrom, distanceTo, pricePerKm } = distancePricing;

        if (lastIndex !== index) {
            const distanceToError = checkInputIsValid(distanceTo, 'distance');
            if (distanceToError) {
                errors.push({
                    id: `distance-to-${index}`,
                    errorMessage: distanceToError,
                });
            }
        }

        const pricePerKmError = checkInputIsValid(pricePerKm, 'price');
        if (pricePerKmError) {
            errors.push({
                id: `price-per-km-${index}`,
                errorMessage: pricePerKmError,
            });
        }
        if (index !== 0) {
            const distanceFromError = checkInputIsValid(distanceFrom, 'distance');
            if (distanceFromError) {
                errors.push({
                    id: `distance-from-${index}`,
                    errorMessage: distanceFromError,
                });
            }
        }
    });

    for (let i = pricePerDistances.length - 1; i >= 1; i--) {
        if (Number(pricePerDistances[i].distanceFrom) !== Number(pricePerDistances[i - 1].distanceTo)) {
            errors.push({
                id: `distance-from-${i}`,
                errorMessage: 'Distance from must be the same as distance to in the previous row',
            });
        }
        if (pricePerDistances[i].distanceTo !== 'Max') {
            if (Number(pricePerDistances[i].distanceFrom) >= Number(pricePerDistances[i].distanceTo)) {
                errors.push({
                    id: `distance-from-${i}`,
                    errorMessage: 'Distance from must be less than distance to in the same row',
                });
            }
        }
    }

    return errors;
};

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const pricePerDistances: DistanceBand[] = [];
        let i = 0;
        let errors: ErrorInfo[] = [];
        const { productName, minimumPrice, maximumPrice } = req.body;

        while (req.body[`pricePerKm${i}`] !== undefined) {
            const distanceFrom = req.body[`distanceFrom${i}`];
            const distanceTo = req.body[`distanceTo${i}`];
            const pricePerKm = req.body[`pricePerKm${i}`];
            const distancePricing = {
                distanceFrom,
                distanceTo,
                pricePerKm,
            };
            pricePerDistances.push(distancePricing);
            i += 1;
        }
        pricePerDistances[0] = { ...pricePerDistances[0], distanceFrom: '0' };
        pricePerDistances[i - 1] = { ...pricePerDistances[i - 1], distanceTo: 'Max' };
        errors = validateInput(pricePerDistances, i - 1, minimumPrice, maximumPrice, productName);
        const distancePricing: DistancePricingData = {
            maximumPrice,
            minimumPrice,
            distanceBands: pricePerDistances,
            productName: productName,
        };
        if (errors.length > 0) {
            updateSessionAttribute(req, PRICING_PER_DISTANCE_ATTRIBUTE, {
                errors,
                ...distancePricing,
            });
            redirectTo(res, '/definePricingPerDistance');
            return;
        }

        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);

        // edit mode
        if (ticket && matchingJsonMetaData) {
            const product = ticket.products[0];
            const updatedProduct = { ...product, pricingByDistance: distancePricing };

            const updatedTicket: WithIds<Ticket> = {
                ...ticket,
                products: [updatedProduct],
            };

            // put the now updated matching json into s3
            await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonMetaData.matchingJsonLink);
            updateSessionAttribute(req, PRICING_PER_DISTANCE_ATTRIBUTE, undefined);
            redirectTo(
                res,
                `/products/productDetails?productId=${matchingJsonMetaData.productId}${
                    matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
                }`,
            );
            return;
        }

        updateSessionAttribute(req, PRICING_PER_DISTANCE_ATTRIBUTE, distancePricing);
        const fareType = getFareTypeFromFromAttributes(req);
        if (fareType === 'flatFare') {
            redirectTo(res, '/ticketConfirmation');
            return;
        }
        redirectTo(res, '/additionalPricingStructures');
        return;
    } catch (error) {
        const message = 'There was a problem entering the pricing by distance information:';
        redirectToError(res, message, 'api.pricingPerDistance', error);
    }
};
