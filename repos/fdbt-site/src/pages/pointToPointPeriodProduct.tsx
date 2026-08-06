import { ReactElement } from 'react';
import upperFirst from 'lodash/upperFirst';
import ExpirySelector from '../components/ExpirySelector';
import TwoThirdsLayout from '../layout/Layout';
import { POINT_TO_POINT_PRODUCT_ATTRIBUTE, OPERATOR_ATTRIBUTE, FARE_TYPE_ATTRIBUTE } from '../constants/attributes';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import FormElementWrapper, { FormErrorBlock, FormGroupWrapper } from '../components/FormElementWrapper';
import ErrorSummary from '../components/ErrorSummary';
import { getRequiredSessionAttribute, getSessionAttribute } from '../utils/sessions';
import { getCsrfToken } from '../utils';
import { PointToPointPeriodProduct } from '../interfaces/matchingJsonTypes';
import { isSchoolFareType } from '../utils/apiUtils';

const title = 'Point to Point Period Product - Create Fares Data Service';
const description = 'Point to point period product details entry page of the Create Fares Data Service';

interface PointToPointPeriodProductProps {
    product: PointToPointPeriodProduct | null;
    operator: string;
    passengerType: string;
    school: boolean;
    errors: ErrorInfo[];
    csrfToken: string;
}

const ProductDetails = ({
    product,
    operator,
    passengerType,
    school,
    csrfToken,
    errors,
}: PointToPointPeriodProductProps): ReactElement => {
    const productName = product?.productName;
    const periodValue = product?.productDuration || '';
    const periodUnits = product?.productDurationUnits;

    return (
        <TwoThirdsLayout title={title} description={description}>
            <CsrfForm action="/api/pointToPointPeriodProduct" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <div className="govuk-form-group">
                        <fieldset
                            className="govuk-fieldset"
                            aria-describedby="point-to-point-period-product-page-heading"
                        >
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                <h1 className="govuk-fieldset__heading" id="point-to-point-period-product-page-heading">
                                    Enter your period product details
                                </h1>
                            </legend>
                            <span className="govuk-hint" id="service-operator-hint">
                                {operator} - {upperFirst(passengerType)}
                            </span>
                            <FormGroupWrapper errors={errors} errorIds={['point-to-point-period-product-name']}>
                                <>
                                    <label className="govuk-label" htmlFor="point-to-point-period-product-name">
                                        Product Name
                                    </label>
                                    <span className="govuk-hint" id="product-name-hint">
                                        Must be between 2 and 50 characters long
                                    </span>
                                    <FormElementWrapper
                                        errors={errors}
                                        errorId="point-to-point-period-product-name"
                                        errorClass="govuk-input--error"
                                    >
                                        <input
                                            className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                            id="point-to-point-period-product-name"
                                            name="productNameInput"
                                            type="text"
                                            aria-describedby="product-name-hint"
                                            maxLength={50}
                                            defaultValue={productName || ''}
                                        />
                                    </FormElementWrapper>
                                </>
                            </FormGroupWrapper>
                            <FormGroupWrapper
                                errors={errors}
                                errorIds={['product-details-expiry-quantity', 'product-details-expiry-unit']}
                            >
                                <>
                                    <label className="govuk-label" htmlFor="product-details-expiry">
                                        Period duration
                                    </label>
                                    <span className="govuk-hint" id="product-expiry-hint">
                                        How long does the ticket last for. For example, 2 months
                                    </span>

                                    <FormErrorBlock
                                        errors={errors}
                                        errorIds={['product-details-expiry-quantity', 'product-details-expiry-unit']}
                                    />

                                    <ExpirySelector
                                        defaultDuration={periodValue}
                                        defaultUnit={periodUnits}
                                        quantityName="productDuration"
                                        quantityId="product-details-expiry-quantity"
                                        hintId="product-expiry-hint"
                                        unitName="durationUnits"
                                        unitId="product-details-expiry-unit"
                                        errors={errors}
                                        school={school}
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

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: PointToPointPeriodProductProps } => {
    const csrfToken = getCsrfToken(ctx);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const product = getSessionAttribute(ctx.req, POINT_TO_POINT_PRODUCT_ATTRIBUTE);
    const fareTypeAttribute = getRequiredSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);

    const school = isSchoolFareType(fareTypeAttribute);

    if (!operatorAttribute?.name) {
        throw new Error('The Operator Attribute name was not set');
    }

    return {
        props: {
            product: product || null,
            operator: operatorAttribute.name,
            passengerType: 'adult',
            school,
            errors: product && 'errors' in product ? product.errors : [],
            csrfToken,
        },
    };
};

export default ProductDetails;
