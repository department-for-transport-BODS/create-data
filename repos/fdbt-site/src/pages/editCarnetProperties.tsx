import { ReactElement } from 'react';
import { FullColumnLayout } from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import ExpirySelector from '../components/ExpirySelector';
import { getSessionAttribute } from '../utils/sessions';
import {
    EDIT_CARNET_PROPERTIES_ERROR,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../constants/attributes';
import { CarnetDetails, CarnetExpiryUnit } from '../interfaces/matchingJsonTypes';
import BackButton from '../components/BackButton';

const title = 'Edit Carnet Properties - Create Fares Data Service';
const description = 'Edit Carnet Properties page of the Create Fares Data Service';

interface EditCarnetPropertiesProps {
    errors: ErrorInfo[];
    csrfToken: string;
    expiryTime: string;
    expiryUnit: CarnetExpiryUnit;
    quantity: string;
    backHref: string;
}

const EditCarnetProperties = ({
    errors = [],
    csrfToken,
    expiryTime,
    expiryUnit,
    quantity,
    backHref,
}: EditCarnetPropertiesProps): ReactElement => {
    return (
        <FullColumnLayout title={title} description={description} errors={errors}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <CsrfForm action="/api/editCarnetProperties" method="post" csrfToken={csrfToken}>
                <ErrorSummary errors={errors} />
                <h1 className="govuk-heading-l" id="edit-carnet-properties-page-heading">
                    Edit Carnet Properties
                </h1>
                <div className="flex-container">
                    <div className="govuk-!-margin-right-2">
                        <>
                            <label className="govuk-label" htmlFor="edit-carnet-quantity">
                                <span aria-hidden>Quantity in bundle</span>
                            </label>
                            <span className="govuk-hint" id="edit-carnet-quantity-hint">
                                Must be 2 or more
                            </span>
                        </>
                        <input
                            className="govuk-input govuk-input--width-6"
                            name="carnetQuantity"
                            data-non-numeric
                            type="text"
                            id="edit-carnet-quantity"
                            aria-describedby="edit-carnet-quantity-hint"
                            defaultValue={quantity || ''}
                        />
                    </div>
                    <div className="govuk-!-margin-left-2 govuk-!-margin-right-2">
                        <>
                            <label className="govuk-label" htmlFor="edit-carnet-expiry-duration">
                                Carnet expiry
                            </label>
                            <span className="govuk-hint" id="edit-carnet-expiry-hint">
                                e.g. 2 months
                            </span>
                        </>
                        <ExpirySelector
                            defaultDuration={expiryTime || undefined}
                            defaultUnit={expiryUnit || undefined}
                            quantityName={'carnetExpiryDuration'}
                            quantityId={'edit-carnet-expiry-duration'}
                            hintId="edit-carnet-expiry-hint"
                            unitName={'carnetExpiryUnit'}
                            unitId={'edit-carnet-expiry-unit'}
                            carnet
                            errors={errors}
                            hideFormGroupError
                        />
                    </div>
                </div>
                <br />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: EditCarnetPropertiesProps } => {
    const csrfToken = getCsrfToken(ctx);
    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const errors: ErrorInfo[] = getSessionAttribute(ctx.req, EDIT_CARNET_PROPERTIES_ERROR) || [];

    let carnetDetails: CarnetDetails = { quantity: '', expiryTime: '', expiryUnit: CarnetExpiryUnit.NO_EXPIRY };
    if (ticket) {
        const product = ticket.products[0];

        if ('carnetDetails' in product) {
            carnetDetails = product.carnetDetails as CarnetDetails;
        } else {
            throw new Error('carnetDetails is undefined');
        }
    } else {
        throw new Error('Ticket is undefined');
    }

    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const backHref =
        ticket && matchingJsonMetaData
            ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                  matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
              }`
            : '';

    return {
        props: {
            errors,
            csrfToken,
            expiryTime: carnetDetails.expiryTime || '',
            expiryUnit: carnetDetails.expiryUnit,
            quantity: carnetDetails.quantity,
            backHref,
        },
    };
};

export default EditCarnetProperties;
