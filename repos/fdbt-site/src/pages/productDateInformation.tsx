import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import CsrfForm from '../components/CsrfForm';
import { ErrorInfo, ProductDateInformation, NextPageContextWithSession } from '../interfaces';
import { getSessionAttribute } from '../utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
} from '../constants/attributes';
import { isTicketPeriodAttributeWithErrors } from '../interfaces/typeGuards';
import ErrorSummary from '../components/ErrorSummary';
import { getCsrfToken } from '../utils';
import DateSelector from '../components/DateSelector';
import BackButton from '../components/BackButton';

const title = 'Product Date Information - Create Fares Data Service';
const description = 'Product Date Information page of the Create Fares Data Service';

interface ProductDateInformationProps {
    startDateErrors: ErrorInfo[];
    endDateErrors: ErrorInfo[];
    csrfToken: string;
    inputs: ProductDateInformation;
    backHref: string;
}

const ProductDateInfo = ({
    csrfToken,
    startDateErrors = [],
    endDateErrors = [],
    inputs,
    backHref,
}: ProductDateInformationProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            {!!backHref && startDateErrors.length === 0 && endDateErrors.length === 0 ? (
                <BackButton href={backHref} />
            ) : null}
            <CsrfForm action="/api/productDateInformation" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={startDateErrors.concat(endDateErrors)} />
                    <div
                        className={`govuk-form-group ${
                            startDateErrors.concat(endDateErrors).length > 0 ? 'govuk-form-group--error' : ''
                        }`}
                    >
                        <fieldset className="govuk-fieldset" role="group" aria-describedby="product-date-hint">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading">Enter dates for your product(s)</h1>
                            </legend>
                            <div id="product-date-hint" className="govuk-hint">
                                Start dates are mandatory. End dates should only be added where appropriate.
                            </div>

                            <DateSelector
                                errors={startDateErrors}
                                startOrEnd="start"
                                inputs={{
                                    dayInput: inputs.startDateDay,
                                    monthInput: inputs.startDateMonth,
                                    yearInput: inputs.startDateYear,
                                }}
                            />

                            <DateSelector
                                errors={endDateErrors}
                                startOrEnd="end"
                                inputs={{
                                    dayInput: inputs.endDateDay,
                                    monthInput: inputs.endDateMonth,
                                    yearInput: inputs.endDateYear,
                                }}
                            />
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: ProductDateInformationProps } => {
    const csrfToken = getCsrfToken(ctx);
    const productDateAttribute = getSessionAttribute(ctx.req, PRODUCT_DATE_ATTRIBUTE);

    const startDateErrors: ErrorInfo[] = [];
    const endDateErrors: ErrorInfo[] = [];
    let inputs: ProductDateInformation = {
        startDateDay: '',
        startDateMonth: '',
        startDateYear: '',
        endDateDay: '',
        endDateMonth: '',
        endDateYear: '',
    };
    if (productDateAttribute) {
        if (isTicketPeriodAttributeWithErrors(productDateAttribute)) {
            productDateAttribute.errors.forEach((error) => {
                if (error.id.includes('start')) {
                    startDateErrors.push(error);
                } else {
                    endDateErrors.push(error);
                }
            });

            inputs = productDateAttribute.dates;
        } else {
            inputs = productDateAttribute.dateInput;
        }
    }

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const backHref =
        ticket && matchingJsonMetaData
            ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                  matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
              }`
            : '';

    return {
        props: {
            startDateErrors,
            endDateErrors,
            csrfToken,
            inputs,
            backHref,
        },
    };
};

export default ProductDateInfo;
