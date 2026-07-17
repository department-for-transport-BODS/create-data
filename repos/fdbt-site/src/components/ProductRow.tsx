import { ReactElement } from 'react';
import { ErrorInfo, MultiProduct } from '../interfaces';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';
import ExpirySelector from './ExpirySelector';

interface ProductRowProps {
    numberOfProductsToDisplay: number;
    errors: ErrorInfo[];
    userInput: MultiProduct[];
    flatFare: boolean;
    carnet: boolean;
    school: boolean;
}

export const renderTable = (
    index: number,
    errors: ErrorInfo[],
    userInput: MultiProduct[] = [],
    flatFare: boolean,
    carnet: boolean,
    school: boolean,
): ReactElement => (
    <fieldset key={index} className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-visually-hidden">
            {`Enter details for product ${index + 1}`}
        </legend>
        <div className="flex-container">
            <div className="govuk-!-margin-left-4 govuk-!-margin-right-2">
                <FormGroupWrapper errors={errors} errorIds={[`multiple-product-name-${index}`]} hideErrorBar>
                    <>
                        <>
                            <label
                                className={`govuk-label ${index > 0 ? 'govuk-visually-hidden' : ''}`}
                                htmlFor={`multiple-product-name-${index}`}
                            >
                                <span className="govuk-visually-hidden">{`Product Name - Product ${index + 1}`}</span>
                                <span aria-hidden>Product name</span>
                            </label>
                            <span
                                className={`govuk-hint ${index > 0 ? 'govuk-visually-hidden' : ''}`}
                                id={`product-name-hint-${index}`}
                            >
                                50 characters max
                            </span>{' '}
                        </>

                        <FormElementWrapper
                            errors={errors}
                            errorId={`multiple-product-name-${index}`}
                            errorClass="govuk-input--error"
                            hideText
                            addFormGroupError={false}
                        >
                            <input
                                className="govuk-input govuk-input--width-40 govuk-product-name-input__inner__input"
                                id={`multiple-product-name-${index}`}
                                name={`multipleProductNameInput${index}`}
                                type="text"
                                aria-labelledby={`product-name-hint-${index}`}
                                maxLength={50}
                                defaultValue={userInput[index]?.productName ?? ''}
                            />
                        </FormElementWrapper>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                <FormGroupWrapper errors={errors} errorIds={[`multiple-product-price-${index}`]} hideErrorBar>
                    <>
                        <>
                            <label
                                className={`govuk-label ${index > 0 ? 'govuk-visually-hidden' : ''}`}
                                htmlFor={`multiple-product-price-${index}`}
                            >
                                <span className="govuk-visually-hidden">{`Product Price, in pounds - Product ${
                                    index + 1
                                }`}</span>
                                <span aria-hidden>Price</span>
                            </label>
                            <span
                                className={`govuk-hint ${index > 0 ? 'govuk-visually-hidden' : ''}`}
                                id={`product-price-hint-${index}`}
                            >
                                e.g. 2.99
                            </span>
                        </>

                        <div className="govuk-currency-input">
                            <div className="govuk-currency-input__inner">
                                <span className="govuk-currency-input__inner__unit">£</span>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`multiple-product-price-${index}`}
                                    errorClass="govuk-input--error"
                                    hideText
                                    addFormGroupError={false}
                                >
                                    <input
                                        className="govuk-input govuk-input--width-4 govuk-currency-input__inner__input"
                                        name={`multipleProductPriceInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        aria-labelledby={`product-price-hint-${index}`}
                                        id={`multiple-product-price-${index}`}
                                        defaultValue={userInput[index]?.productPrice ?? ''}
                                    />
                                </FormElementWrapper>
                            </div>
                        </div>
                    </>
                </FormGroupWrapper>
            </div>
            {!flatFare ? (
                <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                    <FormGroupWrapper
                        errors={errors}
                        errorIds={[
                            `product-details-period-duration-quantity-${index}`,
                            `product-details-period-duration-unit-${index}`,
                        ]}
                        hideErrorBar
                    >
                        <>
                            <>
                                <p className={`govuk-label ${index > 0 ? 'govuk-visually-hidden' : ''}`}>
                                    Period duration
                                </p>
                                <span
                                    className={`govuk-hint ${index > 0 ? 'govuk-visually-hidden' : ''}`}
                                    id={`product-period-duration-hint-${index}`}
                                >
                                    For example, 3 days
                                </span>
                            </>

                            <ExpirySelector
                                defaultDuration={userInput[index]?.productDuration ?? ''}
                                defaultUnit={userInput[index]?.productDurationUnits ?? undefined}
                                quantityName={`multipleProductDurationInput${index}`}
                                quantityId={`product-details-period-duration-quantity-${index}`}
                                hintId={`product-period-duration-hint-${index}`}
                                unitName={`multipleProductDurationUnitsInput${index}`}
                                unitId={`product-details-period-duration-unit-${index}`}
                                carnet={false}
                                errors={errors}
                                school={school}
                                hideFormGroupError
                            />
                        </>
                    </FormGroupWrapper>
                </div>
            ) : null}
            {carnet ? (
                <>
                    <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                        <FormGroupWrapper errors={errors} errorIds={['product-details-carnet-quantity']} hideErrorBar>
                            <>
                                {index === 0 ? (
                                    <>
                                        <label
                                            className="govuk-label"
                                            htmlFor={`product-details-carnet-quantity-${index}`}
                                        >
                                            <span aria-hidden>Quantity in bundle</span>
                                        </label>
                                        <span className="govuk-hint" id="product-quantity-hint">
                                            Must be 2 or more
                                        </span>
                                    </>
                                ) : (
                                    ''
                                )}

                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`product-details-carnet-quantity-${index}`}
                                    errorClass="govuk-input--error"
                                    hideText
                                    addFormGroupError={false}
                                >
                                    <input
                                        className="govuk-input govuk-input--width-6"
                                        name={`carnetQuantityInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        id={`product-details-carnet-quantity-${index}`}
                                        aria-describedby="product-quantity-hint"
                                        defaultValue={
                                            userInput[index] && userInput[index].carnetDetails?.quantity
                                                ? userInput[index].carnetDetails?.quantity
                                                : ''
                                        }
                                    />
                                </FormElementWrapper>
                            </>
                        </FormGroupWrapper>
                    </div>
                    <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                        <FormGroupWrapper
                            errors={errors}
                            errorIds={['product-details-carnet-expiry-quantity', 'product-details-carnet-expiry-unit']}
                            hideErrorBar
                        >
                            <>
                                {index === 0 ? (
                                    <>
                                        <p className="govuk-label">Carnet expiry</p>
                                        <span className="govuk-hint" id={`product-carnet-expiry-hint-${index}`}>
                                            e.g. 2 months
                                        </span>
                                    </>
                                ) : (
                                    ''
                                )}

                                <ExpirySelector
                                    defaultDuration={userInput[index]?.carnetDetails?.expiryTime ?? ''}
                                    defaultUnit={userInput[index]?.carnetDetails?.expiryUnit ?? undefined}
                                    quantityName={`carnetExpiryDurationInput${index}`}
                                    quantityId={`product-details-carnet-expiry-quantity-${index}`}
                                    hintId={`product-carnet-expiry-hint-${index}`}
                                    unitName={`carnetExpiryUnitInput${index}`}
                                    unitId={`product-details-carnet-expiry-unit-${index}`}
                                    carnet
                                    errors={errors}
                                    hideFormGroupError
                                />
                            </>
                        </FormGroupWrapper>
                    </div>
                </>
            ) : (
                ''
            )}
        </div>
    </fieldset>
);

export const renderRows = (
    numberOfRows: number,
    errors: ErrorInfo[],
    userInput: MultiProduct[] = [],
    flatFare: boolean,
    carnet: boolean,
    school: boolean,
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfRows; i += 1) {
        elements.push(renderTable(i, errors, userInput, flatFare, carnet, school));
    }
    return elements;
};

const ProductRow = ({
    numberOfProductsToDisplay,
    errors,
    userInput = [],
    flatFare,
    carnet,
    school,
}: ProductRowProps): ReactElement => {
    return <div>{renderRows(numberOfProductsToDisplay, errors, userInput, flatFare, carnet, school)}</div>;
};

export default ProductRow;
