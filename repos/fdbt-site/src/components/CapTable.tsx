import { ReactElement } from 'react';
import { CapDetails, ErrorInfo } from '../interfaces';
import ExpirySelector from './ExpirySelector';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';

interface CapTableProps {
    numberOfEntitesByDistancesToDisplay: number;
    errors: ErrorInfo[];
    userInputtedCaps: CapDetails[];
}

export const renderTable = (index: number, errors: ErrorInfo[], userInputtedCaps: CapDetails[] = []): ReactElement => (
    <fieldset key={index} className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-visually-hidden">{`Enter details for cap ${index + 1}`}</legend>
        <div className="flex-container">
            <div className="govuk-!-margin-left-4 govuk-!-margin-right-2">
                <FormGroupWrapper errors={errors} errorIds={[`cap-name-${index}`]} hideErrorBar>
                    <>
                        {index === 0 ? (
                            <>
                                <label className="govuk-label" htmlFor={`cap-name-${index}`}>
                                    <span className="govuk-visually-hidden">{`Cap Name - Cap ${index + 1}`}</span>
                                    <span aria-hidden>Cap name</span>
                                </label>
                                <span className="govuk-hint" id={`cap-name-hint-${index}`}>
                                    50 characters max
                                </span>{' '}
                            </>
                        ) : (
                            ''
                        )}

                        <FormElementWrapper
                            errors={errors}
                            errorId={`cap-name-${index}`}
                            errorClass="govuk-input--error"
                            hideText
                            addFormGroupError={false}
                        >
                            <input
                                className="govuk-input govuk-input--width-40 govuk-product-name-input__inner__input"
                                id={`cap-name-${index}`}
                                name={`capNameInput${index}`}
                                type="text"
                                aria-describedby={`cap-name-hint-${index}`}
                                maxLength={50}
                                defaultValue={userInputtedCaps[index]?.name ?? ''}
                            />
                        </FormElementWrapper>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                <FormGroupWrapper errors={errors} errorIds={[`cap-price-${index}`]} hideErrorBar>
                    <>
                        {index === 0 ? (
                            <>
                                <label className="govuk-label" htmlFor={`cap-price-${index}`}>
                                    <span className="govuk-visually-hidden">{`Cap Price, in pounds - Cap ${
                                        index + 1
                                    }`}</span>
                                    <span aria-hidden>Price</span>
                                </label>
                                <span className="govuk-hint" id={`cap-price-hint-${index}`}>
                                    e.g. 2.99
                                </span>
                            </>
                        ) : (
                            ''
                        )}

                        <div className="govuk-currency-input">
                            <div className="govuk-currency-input__inner">
                                <span className="govuk-currency-input__inner__unit">£</span>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`cap-price-${index}`}
                                    errorClass="govuk-input--error"
                                    hideText
                                    addFormGroupError={false}
                                >
                                    <input
                                        className="govuk-input govuk-input--width-4 govuk-currency-input__inner__input"
                                        name={`capPriceInput${index}`}
                                        data-non-numeric
                                        type="text"
                                        aria-describedby={`cap-price-hint-${index}`}
                                        id={`cap-price-${index}`}
                                        defaultValue={userInputtedCaps[index]?.price ?? ''}
                                    />
                                </FormElementWrapper>
                            </div>
                        </div>
                    </>
                </FormGroupWrapper>
            </div>
            <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                <FormGroupWrapper
                    errors={errors}
                    errorIds={[`cap-period-duration-quantity-${index}`, `cap-period-duration-unit-${index}`]}
                    hideErrorBar
                >
                    <>
                        {index === 0 ? (
                            <>
                                <label className="govuk-label" htmlFor="cap-period-duration">
                                    Cap duration
                                </label>
                                <span className="govuk-hint" id="cap-duration-hint">
                                    For example, 3 days
                                </span>
                            </>
                        ) : (
                            ''
                        )}

                        <ExpirySelector
                            defaultDuration={userInputtedCaps[index]?.durationAmount ?? ''}
                            defaultUnit={userInputtedCaps[index]?.durationUnits ?? undefined}
                            quantityName={`capDurationInput${index}`}
                            quantityId={`cap-period-duration-quantity-${index}`}
                            hintId="cap-duration-hint"
                            unitName={`capDurationUnitsInput${index}`}
                            unitId={`cap-duration-unit-${index}`}
                            errors={errors}
                            hideFormGroupError
                            cap={true}
                        />
                    </>
                </FormGroupWrapper>
            </div>
        </div>
    </fieldset>
);

export const renderRows = (
    numberOfEntitesByDistancesToDisplay: number,
    errors: ErrorInfo[],
    userInputtedCaps: CapDetails[] = [],
): ReactElement[] => {
    const elements: ReactElement[] = [];
    for (let i = 0; i < numberOfEntitesByDistancesToDisplay; i += 1) {
        elements.push(renderTable(i, errors, userInputtedCaps));
    }
    return elements;
};

const CapTable = ({
    errors,
    userInputtedCaps = [],
    numberOfEntitesByDistancesToDisplay,
}: CapTableProps): ReactElement => {
    return <div>{renderRows(numberOfEntitesByDistancesToDisplay, errors, userInputtedCaps)}</div>;
};

export default CapTable;
