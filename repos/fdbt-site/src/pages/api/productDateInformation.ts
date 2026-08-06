import { NextApiResponse } from 'next';
import * as yup from 'yup';
import dayjs from '../../utils/dayjs';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
} from '../../constants/attributes';
import { ErrorInfo, NextApiRequestWithSession, ProductDateInformation } from '../../interfaces';
import { redirectTo, redirectToError } from '../../utils/apiUtils';
import { invalidCharactersArePresent } from '../../../src/utils/apiUtils/validator';
import { putUserDataInProductsBucketWithFilePath } from '../../utils/apiUtils/userData';
import { updateProductDates } from '../../data/auroradb';

export const combinedDateSchema = yup.object({
    endDate: yup.date().min(yup.ref('startDate'), 'The end date must be after the start date'),
});

const isDatesFieldEmpty = (day: string, month: string, year: string): boolean =>
    day === '' && month === '' && year === '';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        let errors: ErrorInfo[] = [];

        const { startDateDay, startDateMonth, startDateYear, endDateDay, endDateMonth, endDateYear } = req.body;

        const dateInput: ProductDateInformation = {
            startDateDay,
            startDateMonth,
            startDateYear,
            endDateDay,
            endDateMonth,
            endDateYear,
        };

        if (!startDateDay || !startDateMonth || !startDateYear) {
            errors.push({ errorMessage: 'Enter a full start date', id: 'start-day-input' });
            updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, { errors, dates: dateInput });
            redirectTo(res, '/productDateInformation');
            return;
        }

        let endDate;

        const isEndDateEmpty = isDatesFieldEmpty(endDateDay, endDateMonth, endDateYear);

        const startDateDayHasInvalidCharacters = invalidCharactersArePresent(startDateDay);

        if (startDateDayHasInvalidCharacters) {
            errors.push({
                id: 'start-day-input',
                errorMessage: 'Start date day has an invalid character',
            });
        }

        const startDateMonthHasInvalidCharacters = invalidCharactersArePresent(startDateMonth);

        if (startDateMonthHasInvalidCharacters) {
            errors.push({
                id: 'start-month-input',
                errorMessage: 'Start date month has an invalid character',
            });
        }

        const startDateYearHasInvalidCharacters = invalidCharactersArePresent(startDateYear);

        if (startDateYearHasInvalidCharacters) {
            errors.push({
                id: 'start-year-input',
                errorMessage: 'Start date year has an invalid character',
            });
        }

        if (!isEndDateEmpty) {
            endDate = dayjs.utc(
                new Date(Date.UTC(Number(endDateYear), Number(endDateMonth) - 1, Number(endDateDay), 23, 59, 59)),
            );

            const endDateDayHasInvalidCharacters = invalidCharactersArePresent(endDateDay);

            if (endDateDayHasInvalidCharacters) {
                errors.push({
                    id: 'end-day-input',
                    errorMessage: 'End date day has an invalid character',
                });
            }

            const endDateMonthHasInvalidCharacters = invalidCharactersArePresent(endDateMonth);

            if (endDateMonthHasInvalidCharacters) {
                errors.push({
                    id: 'end-month-input',
                    errorMessage: 'End date month has an invalid character',
                });
            }

            const endDateYearHasInvalidCharacters = invalidCharactersArePresent(endDateYear);

            if (endDateYearHasInvalidCharacters) {
                errors.push({
                    id: 'end-year-input',
                    errorMessage: 'End date year has an invalid character',
                });
            }

            if (Number(endDateYear) > 2099) {
                errors.push({
                    errorMessage: 'Enter a date with a year before 2099',
                    id: 'end-year-input',
                });
            }
        }

        const startDate = dayjs.utc(
            new Date(Date.UTC(Number(startDateYear), Number(startDateMonth) - 1, Number(startDateDay))),
        );

        if (!startDate.isValid()) {
            errors.push({ errorMessage: 'Start date must be a real date', id: 'start-day-input' });
        }

        if (endDate && !endDate.isValid() && !isEndDateEmpty) {
            errors.push({ errorMessage: 'End date must be a real date', id: 'end-day-input' });
        }

        if (Number(startDateYear) > 2099) {
            errors.push({
                errorMessage: 'Enter a date with a year before 2099',
                id: 'start-year-input',
            });
        }

        if (errors.length > 0) {
            updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, { errors, dates: dateInput });
            redirectTo(res, '/productDateInformation');
            return;
        }

        if (startDate && endDate) {
            try {
                await combinedDateSchema.validate(
                    { startDate: startDate.toDate(), endDate: endDate?.toDate() },
                    { abortEarly: false },
                );
            } catch (validationErrors) {
                const validityErrors: yup.ValidationError = validationErrors;
                errors = validityErrors.inner.map((error) => ({
                    id: 'end-day-input',
                    errorMessage: error.message,
                }));

                updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, {
                    errors,
                    dates: dateInput,
                });
                redirectTo(res, '/productDateInformation');
                return;
            }
        }

        const ticket = getSessionAttribute(req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(req, MATCHING_JSON_META_DATA_ATTRIBUTE);
        if (ticket && matchingJsonMetaData) {
            const updatedTicket = {
                ...ticket,
                ticketPeriod: {
                    startDate: startDate.toISOString(),
                    endDate: endDate?.toISOString(),
                },
            };
            await putUserDataInProductsBucketWithFilePath(updatedTicket, matchingJsonMetaData.matchingJsonLink);
            await updateProductDates(matchingJsonMetaData.productId, startDate.toISOString(), endDate?.toISOString());
            redirectTo(
                res,
                `/products/productDetails?productId=${matchingJsonMetaData.productId}${
                    matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData.serviceId}` : ''
                }`,
            );
            return;
        }

        updateSessionAttribute(req, PRODUCT_DATE_ATTRIBUTE, {
            startDate: startDate.toISOString(),
            endDate: endDate?.toISOString(),
            dateInput,
        });

        redirectTo(res, '/salesConfirmation');
    } catch (error) {
        const message = 'There was a problem in the productDateInformation API.';
        redirectToError(res, message, 'api.productDateInformation', error);
    }
};
