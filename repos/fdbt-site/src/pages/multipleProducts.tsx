import { ReactElement, useEffect, useState } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import {
    MULTIPLE_PRODUCT_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../constants/attributes';
import ProductRow from '../components/ProductRow';
import { ErrorInfo, NextPageContextWithSession, MultiProduct } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import CsrfForm from '../components/CsrfForm';
import { isWithErrors, isFareTypeAttributeWithErrors } from '../interfaces/typeGuards';
import { getSessionAttribute } from '../utils/sessions';
import { getCsrfToken } from '../utils';
import { isSchoolFareType } from '../utils/apiUtils';

const title = 'Multiple Product - Create Fares Data Service';
const description = 'Multiple Product entry page of the Create Fares Data Service';

interface MultipleProductProps {
    errors?: ErrorInfo[];
    userInput: MultiProduct[];
    csrfToken: string;
    flatFare: boolean;
    carnet: boolean;
    numberOfProductsToRender: number;
    school: boolean;
}

const MultipleProducts = ({
    errors = [],
    userInput = [],
    csrfToken,
    flatFare,
    carnet,
    school,
    numberOfProductsToRender,
}: MultipleProductProps): ReactElement => {
    const [numberOfProducts, setNumberOfProducts] = useState(numberOfProductsToRender);
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);
    const displayButton = (carnet || !flatFare) && isMounted;
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/multipleProducts" method="post" csrfToken={csrfToken}>
                <>
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-l" id="multiple-product-page-heading">
                        Enter your product details
                    </h1>
                    <div className="govuk-grid-row">
                        <ProductRow
                            numberOfProductsToDisplay={numberOfProducts}
                            errors={errors}
                            userInput={userInput}
                            flatFare={flatFare}
                            carnet={carnet}
                            school={school}
                        />
                        {displayButton ? (
                            <div className="flex-container">
                                {numberOfProducts < 10 ? (
                                    <button
                                        id="add-another-button"
                                        type="button"
                                        className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3 time-restrictions-button-placement"
                                        onClick={(): void => setNumberOfProducts(numberOfProducts + 1)}
                                    >
                                        Add another product
                                    </button>
                                ) : (
                                    ''
                                )}

                                {numberOfProducts > 1 ? (
                                    <button
                                        id="remove-button"
                                        type="button"
                                        className="govuk-button govuk-button--secondary govuk-!-margin-left-3 govuk-!-margin-bottom-3"
                                        onClick={(): void => setNumberOfProducts(numberOfProducts - 1)}
                                    >
                                        Remove last product
                                    </button>
                                ) : (
                                    ''
                                )}
                            </div>
                        ) : (
                            ''
                        )}

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

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: MultipleProductProps } => {
    const csrfToken = getCsrfToken(ctx);
    const multiProductAttribute = getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE);
    const carnetFareTypeAttribute = getSessionAttribute(ctx.req, CARNET_FARE_TYPE_ATTRIBUTE);
    const ticketRepresentationAttribute = getSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE);

    const carnet = carnetFareTypeAttribute === undefined ? false : carnetFareTypeAttribute;

    const ticketRepresentation =
        ticketRepresentationAttribute && !isWithErrors(ticketRepresentationAttribute)
            ? ticketRepresentationAttribute.name
            : '';
    const fareTypeAttribute = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);
    if (!fareTypeAttribute || isFareTypeAttributeWithErrors(fareTypeAttribute)) {
        throw new Error('Faretype attribute not found, could not ascertain fareType.');
    }

    const { fareType } = fareTypeAttribute;
    const flatFare =
        fareType === 'flatFare' ||
        ticketRepresentation === 'multipleServicesFlatFareMultiOperator' ||
        ticketRepresentation === 'geoZoneFlatFareMultiOperator';
    const numberOfProductsToRender = getSessionAttribute(ctx.req, NUMBER_OF_PRODUCTS_ATTRIBUTE) || 1;

    return {
        props: {
            errors: isWithErrors(multiProductAttribute) ? multiProductAttribute.errors : [],
            userInput: multiProductAttribute ? multiProductAttribute.products : [],
            csrfToken,
            flatFare,
            carnet,
            numberOfProductsToRender,
            school: isSchoolFareType(fareTypeAttribute) && !carnet,
        },
    };
};

export default MultipleProducts;
