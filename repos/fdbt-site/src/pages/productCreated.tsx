import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';
import { FEEDBACK_LINK, INTERNAL_NOC } from '../constants';
import { getUuidFromSession, deleteAllCookiesOnServerSide, getAndValidateNoc, getCsrfToken } from '../utils';
import { NextPageContextWithSession } from '../interfaces';
import logger from '../utils/logger';
import { regenerateSession } from '../utils/sessions';
import CsrfForm from '../components/CsrfForm';

const title = 'Product Created - Create Fares Data Service';
const description = 'Product created page for the Create Fares Data Service';

export interface ProductCreatedProps {
    isMultiOperatorExternalProduct: boolean;
    csrfToken: string;
}

const ProductCreated = ({ isMultiOperatorExternalProduct = false, csrfToken }: ProductCreatedProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description}>
        <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title" id="thank-you-page-heading" data-test-id="final-page-banner">
                Product created
            </h1>
        </div>
        <h2 className="govuk-heading-m">What happens next</h2>
        <p className="govuk-body">Your product has now been stored in the system.</p>
        {isMultiOperatorExternalProduct ? (
            <p className="govuk-body">
                To view, manage or export your multi-operator products go to{' '}
                <a href="/products/multiOperatorProductsExternal">view and manage my multi-operator fares</a>.
            </p>
        ) : (
            <p className="govuk-body">
                To continue creating more products go to <a href="/products/services">view and manage my fares</a>.
            </p>
        )}

        {!isMultiOperatorExternalProduct && (
            <>
                <p className="govuk-body">
                    Once you have finished creating products you can navigate to{' '}
                    <a href={'/products/exports'} className="govuk-link" aria-label="Export your data">
                        Export your data
                    </a>
                    , to export and download NeTEx for this product and all other active products in the system.
                </p>
                <p className="govuk-body">
                    {' '}
                    Once downloaded you should upload your fares data to{' '}
                    <a
                        href={'https://publish.bus-data.dft.gov.uk/'}
                        className="govuk-link"
                        aria-label="Bus open data service"
                    >
                        BODS
                    </a>
                    .
                </p>
            </>
        )}
        <p className="govuk-body">
            <a href={FEEDBACK_LINK} className="govuk-link" aria-label="Provide feedback on this service">
                What did you think of this service?
            </a>
        </p>
        <br />

        {isMultiOperatorExternalProduct ? (
            <CsrfForm action="/api/fareType" method="post" csrfToken={csrfToken}>
                <input type="hidden" name="fareType" value="multiOperatorExt" />
                <button type="submit" className="govuk-button">
                    Add another multi-operator fare
                </button>
            </CsrfForm>
        ) : (
            <>
                <a href="/fareType" role="button" draggable="false" className="govuk-button" data-module="govuk-button">
                    Add another fare
                </a>
                <a
                    href="/products/exports"
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--secondary govuk-!-margin-left-3"
                    data-module="govuk-button"
                    aria-label="Export your products"
                >
                    Export your products
                </a>
            </>
        )}
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): {} => {
    const uuid = getUuidFromSession(ctx);
    const noc = getAndValidateNoc(ctx);

    if (noc !== INTERNAL_NOC) {
        logger.info('', { context: 'pages.productCreated', message: 'transaction complete', uuid });
    }

    if (ctx.req) {
        regenerateSession(ctx.req);
        deleteAllCookiesOnServerSide(ctx);
    }

    const isMultiOperatorExternalProduct = ctx.query.isMultiOperatorExternal === 'true';

    return {
        props: {
            isMultiOperatorExternalProduct,
            csrfToken: getCsrfToken(ctx),
        },
    };
};

export default ProductCreated;
