import { ReactElement } from 'react';
import upperFirst from 'lodash/upperFirst';
import TwoThirdsLayout from '../layout/Layout';
import {
    OPERATOR_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    CARNET_PRODUCT_DETAILS_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
} from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import ExpirySelector from '../components/ExpirySelector';
import CsrfForm from '../components/CsrfForm';
import FormElementWrapper, { FormErrorBlock, FormGroupWrapper } from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { getSessionAttribute } from '../utils/sessions';
import { isFareType, isPassengerType, isWithErrors } from '../interfaces/typeGuards';
import { getCsrfToken } from '../utils';
import { CarnetProductInfo } from '../interfaces/matchingJsonTypes';

const title = 'Product Details - Create Fares Data Service';
const description = 'Product Details entry page of the Create Fares Data Service';

interface CarnetProductDetailsProps {
    product: CarnetProductInfo | null;
    hintText: string;
    errors: ErrorInfo[];
    csrfToken: string;
}

const CarnetProductDetails = ({ product, hintText, csrfToken, errors }: CarnetProductDetailsProps): ReactElement => {
    const { productName } = product || {};
    const { quantity, expiryTime, expiryUnit } = product?.carnetDetails || {};

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/carnetProductDetails" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="product-details-page-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="product-details-page-heading">
                                    Enter your product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {hintText}
                            </span>
                            <FormGroupWrapper errors={errors} errorIds={['product-details-name']}>
                                <>
                                    <label className="govuk-label" htmlFor="product-details-name">
                                        Product Name
                                    </label>
                                    <span className="govuk-hint" id="product-name-hint">
                                        Must be between 2 and 50 characters long
                                    </span>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="product-details-name"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                            id="product-details-name"
                                            name="productDetailsNameInput"
                                            type="text"
                                            aria-describedby="product-name-hint"
                                            maxLength={50}
                                            defaultValue={productName || ''}
                                        />
                                    </FormElementWrapper>
                                </>
                            </FormGroupWrapper>
                            <FormGroupWrapper errors={errors} errorIds={['product-details-carnet-quantity']}>
                                <>
                                    <label className="govuk-label" htmlFor="product-details-carnet-quantity">
                                        Quantity in bundle
                                    </label>
                                    <span className="govuk-hint" id="product-quantity-hint">
                                        Must be 2 or more
                                    </span>

                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="product-details-carnet-quantity"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input govuk-input--width-5"
                                            name="productDetailsQuantityInput"
                                            data-non-numeric
                                            type="text"
                                            id="product-details-carnet-quantity"
                                            aria-describedby="product-quantity-hint"
                                            defaultValue={quantity || ''}
                                        />
                                    </FormElementWrapper>
                                </>
                            </FormGroupWrapper>
                            <FormGroupWrapper
                                errors={errors}
                                errorIds={[
                                    'product-details-carnet-expiry-quantity',
                                    'product-details-carnet-expiry-unit',
                                ]}
                            >
                                <>
                                    <label className="govuk-label" htmlFor="product-details-carnet-expiry">
                                        Carnet expiry
                                    </label>
                                    <span className="govuk-hint" id="product-carnet-expiry-hint">
                                        For example, 2 months
                                    </span>

                                    <FormErrorBlock
                                        errors={errors}
                                        errorIds={[
                                            'product-details-carnet-expiry-quantity',
                                            'product-details-carnet-expiry-unit',
                                        ]}
                                    />

                                    <ExpirySelector
                                        defaultDuration={expiryTime}
                                        defaultUnit={expiryUnit}
                                        quantityName="productDetailsExpiryDurationInput"
                                        quantityId="product-details-carnet-expiry-quantity"
                                        hintId="product-carnet-expiry-hint"
                                        unitName="productDetailsExpiryUnitInput"
                                        unitId="product-details-carnet-expiry-unit"
                                        errors={errors}
                                        carnet
                                    />
                                </>
                            </FormGroupWrapper>
                        </fieldset>
                    </div>
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: CarnetProductDetailsProps } => {
    const csrfToken = getCsrfToken(ctx);

    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);
    const productDetailsAttribute = getSessionAttribute(ctx.req, CARNET_PRODUCT_DETAILS_ATTRIBUTE);

    if (!operatorAttribute?.name || !isFareType(fareTypeAttribute)) {
        throw new Error('Failed to retrieve the necessary session objects');
    }

    if (!isPassengerType(passengerTypeAttribute)) {
        throw new Error('Failed to retrieve passenger type attribute for product details page');
    }

    return {
        props: {
            product: productDetailsAttribute || null,
            errors:
                productDetailsAttribute && isWithErrors(productDetailsAttribute) ? productDetailsAttribute.errors : [],
            hintText: `${operatorAttribute.name} - ${upperFirst(
                passengerTypeAttribute.passengerType,
            )} Carnet ${upperFirst(fareTypeAttribute.fareType)}`,
            csrfToken,
        },
    };
};

export default CarnetProductDetails;
