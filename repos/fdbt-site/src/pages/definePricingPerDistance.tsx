import { ReactElement, useState } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import DistanceRow from '../components/DistanceRow';
import { DistancePricingData, ErrorInfo, NextPageContextWithSession, WithErrors } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    PRICING_PER_DISTANCE_ATTRIBUTE,
} from '../constants/attributes';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { isWithErrors } from '../interfaces/typeGuards';
import BackButton from '../components/BackButton';
import { PriceByDistanceProduct } from '../interfaces/matchingJsonTypes';

const title = 'Pricing Per Distance - Create Fares Data Service';
const description = 'Pricing Per Distance entry page of the Create Fares Data Service';

interface DefinePricingPerDistanceProps {
    errors: ErrorInfo[];
    csrfToken: string;
    pricingPerDistanceData: DistancePricingData;
    numberOfEntitesByDistanceInitial: number;
    backHref: string;
}

const DefinePricingPerDistance = ({
    errors,
    csrfToken,
    pricingPerDistanceData,
    numberOfEntitesByDistanceInitial,
    backHref,
}: DefinePricingPerDistanceProps): ReactElement => {
    const [numberOfEntitesByDistance, setnumberOfEntitesByDistances] = useState(numberOfEntitesByDistanceInitial);
    const [pricingPerDistance, setPricingPerDistance] = useState(pricingPerDistanceData);
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <CsrfForm action="/api/pricingPerDistance" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-l" id="pricing-per-distance-heading">
                        Enter your distance details
                    </h1>

                    <div className="govuk-!-margin-bottom-3 govuk-!-margin-left-1">
                        <label className="govuk-label" htmlFor="product-name">
                            Product name
                        </label>
                        <span className="govuk-hint">Enter the name of your product</span>
                        <div className="govuk-input__wrapper">
                            <FormElementWrapper
                                errors={errors}
                                errorId="product-name"
                                errorClass="govuk-input--error"
                                hideText
                            >
                                <input
                                    className="govuk-input govuk-input--width-30"
                                    id="product-name"
                                    name="productName"
                                    type="text"
                                    defaultValue={pricingPerDistance.productName || ''}
                                />
                            </FormElementWrapper>
                        </div>
                    </div>

                    <div className="flex-container">
                        <div className="govuk-!-margin-left-1 govuk-!-margin-right-2">
                            <FormGroupWrapper errors={errors} errorIds={['minimum-price']} hideErrorBar>
                                <>
                                    <label className="govuk-label" htmlFor="minimum-price">
                                        Minimum price (£)
                                    </label>
                                    <span className="govuk-hint" id="minimum-price-hint">
                                        e.g. £2.99
                                    </span>
                                    <div className="govuk-input__wrapper">
                                        <div className="govuk-input__prefix" aria-hidden="true">
                                            £
                                        </div>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="minimum-price"
                                            errorClass="govuk-input--error"
                                            hideText
                                        >
                                            <input
                                                className="govuk-input govuk-input--width-3"
                                                id="minimum-price"
                                                name="minimumPrice"
                                                type="text"
                                                onChange={(e) => {
                                                    setPricingPerDistance({
                                                        ...pricingPerDistance,
                                                        minimumPrice: e.target.value,
                                                    });
                                                }}
                                                value={pricingPerDistance.minimumPrice || ''}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </>
                            </FormGroupWrapper>
                        </div>

                        <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                            <FormGroupWrapper errors={errors} errorIds={['maximum-price']} hideErrorBar>
                                <>
                                    <label className="govuk-label" htmlFor="maximum-price">
                                        Maximum price (£)
                                    </label>

                                    <span className="govuk-hint" id="maximum-price-hint">
                                        e.g. £2.99
                                    </span>

                                    <div className="govuk-input__wrapper">
                                        <div className="govuk-input__prefix" aria-hidden="true">
                                            £
                                        </div>
                                        <FormElementWrapper
                                            errors={errors}
                                            errorId="maximum-price"
                                            errorClass="govuk-input--error"
                                            hideText
                                        >
                                            <input
                                                className="govuk-input govuk-input--width-3"
                                                id="maximum-price"
                                                name="maximumPrice"
                                                type="text"
                                                onChange={(e) => {
                                                    setPricingPerDistance({
                                                        ...pricingPerDistance,
                                                        maximumPrice: e.target.value,
                                                    });
                                                }}
                                                value={pricingPerDistance.maximumPrice || ''}
                                            />
                                        </FormElementWrapper>
                                    </div>
                                </>
                            </FormGroupWrapper>
                        </div>
                    </div>
                    <div className="govuk-grid-row">
                        <DistanceRow
                            numberToDisplay={numberOfEntitesByDistance}
                            errors={errors}
                            pricingPerDistance={pricingPerDistance}
                            setPricingPerDistance={setPricingPerDistance}
                        />
                        <div className="flex-container">
                            {numberOfEntitesByDistance < 10 ? (
                                <button
                                    id="add-another-button"
                                    type="button"
                                    className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3 time-restrictions-button-placement"
                                    onClick={(): void => {
                                        setnumberOfEntitesByDistances(numberOfEntitesByDistance + 1);
                                        const items = [...pricingPerDistance.distanceBands];
                                        let item = {
                                            ...pricingPerDistance.distanceBands[numberOfEntitesByDistance - 1],
                                        };
                                        item.distanceTo = '';
                                        items[numberOfEntitesByDistance - 1] = item;
                                        setPricingPerDistance({
                                            ...pricingPerDistance,
                                            distanceBands: items,
                                        });
                                        item = { ...pricingPerDistance.distanceBands[numberOfEntitesByDistance] };
                                        item.distanceTo = 'Max';
                                        items[numberOfEntitesByDistance] = item;
                                        setPricingPerDistance({
                                            ...pricingPerDistance,
                                            distanceBands: items,
                                        });
                                        for (let i = 0; i < numberOfEntitesByDistance; i += 1) {
                                            if (
                                                !pricingPerDistance?.distanceBands[i]?.distanceFrom &&
                                                i !== 0 &&
                                                pricingPerDistance?.distanceBands[i - 1]?.distanceTo
                                            ) {
                                                const items = [...pricingPerDistance.distanceBands];
                                                item = { ...pricingPerDistance.distanceBands[i] };
                                                item.distanceFrom = pricingPerDistance.distanceBands[i - 1].distanceTo;
                                                item.distanceTo = '';
                                                items[i] = item;
                                                setPricingPerDistance({
                                                    ...pricingPerDistance,
                                                    distanceBands: items,
                                                });
                                            }
                                        }
                                    }}
                                >
                                    Add another row
                                </button>
                            ) : (
                                ''
                            )}

                            {numberOfEntitesByDistance > 1 ? (
                                <button
                                    id="remove-button"
                                    type="button"
                                    className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3"
                                    onClick={(): void => {
                                        setPricingPerDistance((current) => {
                                            const copy = { ...current };
                                            if (numberOfEntitesByDistance !== 1) {
                                                if (copy?.distanceBands[numberOfEntitesByDistance - 1]?.distanceFrom) {
                                                    copy.distanceBands[numberOfEntitesByDistance - 1].distanceFrom = '';
                                                }
                                                if (copy?.distanceBands[numberOfEntitesByDistance - 1]?.distanceTo) {
                                                    copy.distanceBands[numberOfEntitesByDistance - 1].distanceTo = '';
                                                }
                                                if (copy?.distanceBands[numberOfEntitesByDistance - 1]?.pricePerKm) {
                                                    copy.distanceBands[numberOfEntitesByDistance - 1].pricePerKm = '';
                                                }
                                            }
                                            return { ...copy };
                                        });
                                        setnumberOfEntitesByDistances(numberOfEntitesByDistance - 1);
                                    }}
                                >
                                    Remove last row
                                </button>
                            ) : (
                                ''
                            )}
                        </div>
                        <input
                            type="submit"
                            value="Continue"
                            id="continue-button"
                            className="govuk-button govuk-!-margin-left-3"
                        />
                    </div>
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: DefinePricingPerDistanceProps } => {
    const csrfToken = getCsrfToken(ctx);
    let pricingPerDistanceData: DistancePricingData | WithErrors<DistancePricingData> | undefined = getSessionAttribute(
        ctx.req,
        PRICING_PER_DISTANCE_ATTRIBUTE,
    );
    let errors: ErrorInfo[] = [];
    if (pricingPerDistanceData && isWithErrors(pricingPerDistanceData)) {
        errors = pricingPerDistanceData.errors;
    }

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    let backHref = '';
    if (ticket && matchingJsonMetaData) {
        backHref = `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
            matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
        }`;

        if (!pricingPerDistanceData) {
            const product = ticket.products[0] as PriceByDistanceProduct;
            pricingPerDistanceData = product.pricingByDistance;
        }
    }

    return {
        props: {
            errors,
            pricingPerDistanceData: pricingPerDistanceData || {
                distanceBands: [{ distanceFrom: '0', distanceTo: 'Max', pricePerKm: '' }],
                minimumPrice: '',
                maximumPrice: '',
                productName: '',
            },
            csrfToken,
            numberOfEntitesByDistanceInitial: pricingPerDistanceData?.distanceBands?.length || 1,
            backHref,
        },
    };
};

export default DefinePricingPerDistance;
