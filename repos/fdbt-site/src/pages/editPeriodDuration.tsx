import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { ErrorInfo, NextPageContextWithSession } from '../interfaces';
import ErrorSummary from '../components/ErrorSummary';
import CsrfForm from '../components/CsrfForm';
import { getCsrfToken } from '../utils';
import ExpirySelector from '../../src/components/ExpirySelector';
import { getSessionAttribute } from '../../src/utils/sessions';
import {
    EDIT_PERIOD_DURATION_ERROR,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
} from '../../src/constants/attributes';
import { ExpiryUnit } from '../../src/interfaces/matchingJsonTypes';
import BackButton from '../components/BackButton';

const title = 'Edit Period Duration - Create Fares Data Service';
const description = 'Edit Period Duration page of the Create Fares Data Service';

interface EditPeriodDurationProps {
    errors: ErrorInfo[];
    csrfToken: string;
    productDurationValue: string;
    productDurationUnit: string;
    backHref: string;
}

const EditPeriodDuration = ({
    errors = [],
    csrfToken,
    productDurationValue,
    productDurationUnit,
    backHref,
}: EditPeriodDurationProps): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <CsrfForm action="/api/editPeriodDuration" method="post" csrfToken={csrfToken}>
                <div className="govuk-form-group">
                    <ErrorSummary errors={errors} />
                    <h1 className="govuk-heading-l" id="edit-period-duration-page-heading">
                        Edit Period Duration
                    </h1>

                    <>
                        <label className="govuk-label" htmlFor="edit-period-duration">
                            Period duration
                        </label>
                        <span className="govuk-hint" id="edit-period-duration-hint">
                            For example, 3 days
                        </span>
                    </>
                    <ExpirySelector
                        defaultDuration={productDurationValue || undefined}
                        defaultUnit={(productDurationUnit as ExpiryUnit) || undefined}
                        quantityName={'periodDurationInput'}
                        quantityId={'edit-period-duration-quantity'}
                        hintId="edit-period-duration-hint"
                        unitName={'periodDurationUnitsInput'}
                        unitId={'edit-period-duration-unit'}
                        carnet={false}
                        errors={errors}
                        school={false}
                        hideFormGroupError
                    />
                    <br />
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </div>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: EditPeriodDurationProps } => {
    const csrfToken = getCsrfToken(ctx);
    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const errors: ErrorInfo[] = getSessionAttribute(ctx.req, EDIT_PERIOD_DURATION_ERROR) || [];

    let productDuration = '';
    if (ticket) {
        const product = ticket.products[0];

        if ('productDuration' in product) {
            productDuration = product.productDuration;
        } else {
            throw new Error('productDuration is undefined');
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

    const productDurationSplit = productDuration.split(' ');
    const productDurationValue = productDurationSplit[0];
    const productDurationUnit = productDurationSplit[1];
    return {
        props: {
            errors,
            csrfToken,
            productDurationValue,
            productDurationUnit,
            backHref,
        },
    };
};

export default EditPeriodDuration;
