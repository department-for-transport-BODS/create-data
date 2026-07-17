import { ReactElement } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import ErrorSummary from '../components/ErrorSummary';
import { AdditionalPricing, ErrorInfo, NextPageContextWithSession, WithErrors } from '../interfaces';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../../src/utils/sessions';
import { ADDITIONAL_PRICING_ATTRIBUTE } from '../../src/constants/attributes';
import { isWithErrors } from '../../src/interfaces/typeGuards';
import FormElementWrapper from '../../src/components/FormElementWrapper';

const title = 'Additional Pricing Structures - Create Fares Data Service';
const description = 'Additional Pricing Structures page of the Create Fares Data Service';

interface SelectTimeRestrictionsProps {
    csrfToken: string;
    errors: ErrorInfo[];
    additionalPricingStructures: AdditionalPricing | WithErrors<AdditionalPricing>;
    clickedYes: boolean;
}

const AdditionalPricingStructures = ({
    csrfToken,
    errors,
    additionalPricingStructures,
    clickedYes,
}: SelectTimeRestrictionsProps): ReactElement => {
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <ErrorSummary errors={errors} />
            <CsrfForm action="/api/additionalPricingStructures" method="post" csrfToken={csrfToken}>
                <>
                    <fieldset className="govuk-fieldset">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                            <h1 className="govuk-fieldset__heading">Are there additional pricing structures?</h1>
                        </legend>
                        <label className="govuk-label govuk-!-margin-bottom-4" htmlFor="additional-discounts">
                            Do you have additional discounts related to this product?
                        </label>
                        <div className="govuk-radios govuk-radios--conditional" data-module="govuk-radios">
                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="additional-discounts"
                                    name="additionalDiscounts"
                                    type="radio"
                                    value="yes"
                                    data-aria-controls="conditional-additional-discounts"
                                    defaultChecked={errors.length > 0 && clickedYes}
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="yes-choice">
                                    Yes
                                </label>
                            </div>

                            <div
                                className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                id="conditional-additional-discounts"
                            >
                                <>
                                    <h1 className="govuk-heading-m" id="pricing-structure-start-heading">
                                        When does the next structure start?
                                    </h1>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="pricing-structure-start">
                                            Pricing structure starts after
                                        </label>
                                        <div id="pricing-structure-start-hint" className="govuk-hint">
                                            Time allowance after first journey
                                        </div>
                                        <div className="govuk-input__wrapper">
                                            <FormElementWrapper
                                                errors={errors}
                                                errorId={'pricing-structure-start'}
                                                errorClass="govuk-input--error"
                                                hideText
                                                addFormGroupError={false}
                                            >
                                                <input
                                                    className="govuk-input govuk-input--width-3"
                                                    id="pricing-structure-start"
                                                    name="pricingStructureStart"
                                                    type="text"
                                                    defaultValue={additionalPricingStructures.pricingStructureStart}
                                                />
                                            </FormElementWrapper>
                                            <div className="govuk-input__suffix" aria-hidden="true">
                                                min
                                            </div>
                                        </div>
                                    </div>
                                    <div className="govuk-form-group">
                                        <label className="govuk-label" htmlFor="structure-discount">
                                            Structure discount
                                        </label>
                                        <div id="structure-discount-hint" className="govuk-hint">
                                            Percentage discount
                                        </div>
                                        <div className="govuk-input__wrapper">
                                            <FormElementWrapper
                                                errors={errors}
                                                errorId={'structure-discount'}
                                                errorClass="govuk-input--error"
                                                hideText
                                                addFormGroupError={false}
                                            >
                                                <input
                                                    className="govuk-input govuk-input--width-3"
                                                    id="structure-discount"
                                                    name="structureDiscount"
                                                    type="text"
                                                    defaultValue={additionalPricingStructures.structureDiscount}
                                                />
                                            </FormElementWrapper>
                                            <div className="govuk-input__suffix" aria-hidden="true">
                                                %
                                            </div>
                                        </div>
                                    </div>
                                </>
                            </div>

                            <div className="govuk-radios__item">
                                <input
                                    className="govuk-radios__input"
                                    id="no-additional-discounts"
                                    name="additionalDiscounts"
                                    type="radio"
                                    value="no"
                                    data-aria-controls="conditional-no-additional-discounts"
                                    defaultChecked={errors.length > 0 && !clickedYes}
                                />
                                <label className="govuk-label govuk-radios__label" htmlFor="no-choice">
                                    No
                                </label>
                            </div>
                        </div>
                        <br />
                        <input
                            type="submit"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button govuk-!-margin-right-2"
                        />
                    </fieldset>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: SelectTimeRestrictionsProps } => {
    const csrfToken = getCsrfToken(ctx);
    const additionalPricingStructures:
        | AdditionalPricing
        | { clickedYes: boolean; additionalPricingStructures: WithErrors<AdditionalPricing> }
        | undefined = getSessionAttribute(ctx.req, ADDITIONAL_PRICING_ATTRIBUTE);

    let clickedYes = false;
    let errors: ErrorInfo[] = [];
    let additionalPricing: AdditionalPricing = {
        pricingStructureStart: '',
        structureDiscount: '',
    };
    if (
        additionalPricingStructures &&
        'additionalPricingStructures' in additionalPricingStructures &&
        isWithErrors(additionalPricingStructures.additionalPricingStructures)
    ) {
        errors = additionalPricingStructures.additionalPricingStructures.errors;
        additionalPricing = additionalPricingStructures.additionalPricingStructures;
        clickedYes = additionalPricingStructures.clickedYes;
    } else if (additionalPricingStructures && 'pricingStructureStart' in additionalPricingStructures) {
        additionalPricing = additionalPricingStructures;
        clickedYes = true;
    }

    return {
        props: {
            csrfToken,
            errors,
            additionalPricingStructures: additionalPricing,
            clickedYes,
        },
    };
};

export default AdditionalPricingStructures;
