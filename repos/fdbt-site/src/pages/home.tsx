import { ReactElement } from 'react';
import { NextPageContextWithSession } from '../interfaces';
import { BaseLayout } from '../layout/Layout';
import { checkIfMultipleOperators, getCsrfToken } from '../utils';
import { getSessionAttribute, regenerateSession, updateSessionAttribute } from '../utils/sessions';
import { MULTI_MODAL_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../constants/attributes';
import { redirectTo } from '../utils/apiUtils';
import { getAllServicesByNocCode, getIncompleteMultiOperatorExternalProductsByNoc } from '../data/auroradb';
import { ProductAdditionaNocs } from '../interfaces/dbTypes';
import InformationSummary from '../components/InformationSummary';

const title = 'Create Fares Data';
const description = 'Create Fares Data is a service that allows you to generate data in NeTEx format';

interface HomeProps {
    csrfToken: string;
    showDeleteProductsLink: boolean;
    multiOperatorFaresRequiringAttentionCount: number;
}

const Home = ({
    csrfToken,
    showDeleteProductsLink,
    multiOperatorFaresRequiringAttentionCount,
}: HomeProps): ReactElement => (
    <BaseLayout title={title} description={description}>
        {multiOperatorFaresRequiringAttentionCount > 0 && (
            <InformationSummary
                informationText={`You have ${multiOperatorFaresRequiringAttentionCount} multi-operator fare${
                    multiOperatorFaresRequiringAttentionCount > 1 ? 's ' : ' '
                }that require${multiOperatorFaresRequiringAttentionCount > 1 ? ' ' : 's '}your attention.`}
                informationLinkText={'View here'}
                informationLinkHref={'products/multiOperatorProductsExternal#fares-awaiting-your-input'}
            />
        )}
        <h1 className="govuk-heading-xl">Create fares data</h1>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <div>
                    <h2 className="govuk-heading-s">Create fares data</h2>
                    <p className="govuk-body">
                        For bus operators running commercial bus services in England, and local authorities that need to
                        create NeTEx data for the services they operate.
                    </p>
                    <a href="/fareType" className="govuk-link govuk-!-font-size-19" id="faretype-link">
                        Create NeTEx data for your fares
                    </a>
                </div>

                <div className="govuk-!-margin-top-7">
                    <h2 className="govuk-heading-s">Manage fares</h2>
                    <p className="govuk-body">View and manage all of your products and services in one place.</p>

                    <a href="/products/services" className="govuk-link govuk-!-font-size-19" id="manage-fares-link">
                        {'View and manage fares'}
                    </a>
                </div>

                <div className="govuk-!-margin-top-7">
                    <h2 className="govuk-heading-s">
                        <strong className="govuk-tag new-tag">New</strong>
                        Multi-operator fares
                    </h2>
                    <p className="govuk-body">
                        This is where operators can collaborate with other operators to define and export multi-operator
                        products.
                    </p>

                    <a
                        href={'/products/multiOperatorProductsExternal'}
                        className="govuk-link govuk-!-font-size-19"
                        id="multi-operator-fares-link"
                    >
                        {'View and manage multi-operator fares'}
                    </a>
                </div>

                <div className="govuk-!-margin-top-7">
                    <h2 className="govuk-heading-s">Operator settings</h2>
                    <p className="govuk-body">
                        Operator settings is where operators can define and save settings specific to a National
                        Operator Code (NOC), such as passenger types, time restrictions and more. We recommend
                        completing this section before creating your fares data.
                    </p>

                    <a href={'/globalSettings'} className="govuk-link govuk-!-font-size-19" id="account-link">
                        {'Define and manage settings'}
                    </a>
                </div>

                <div className="govuk-!-margin-top-7 govuk-!-padding-bottom-7">
                    <h2 className="govuk-heading-s govuk-!-margin-top-3">Related services</h2>
                    <p className="govuk-body">
                        <a
                            href="https://www.bus-data.dft.gov.uk/contact/"
                            aria-label="go to the bus open data service"
                            className="underline govuk-link"
                        >
                            https://www.bus-data.dft.gov.uk/contact/
                        </a>
                        <br />
                        <br />
                        The Bus Open Data Service deals with queries relating to the use of Bus Open Data.
                    </p>
                    {showDeleteProductsLink ? (
                        <p>
                            <a
                                className="govuk-button govuk-button--warning"
                                href={`/api/deleteAllProducts?_csrf=${csrfToken}`}
                                aria-label="go to the bus open data service"
                            >
                                Clear products
                            </a>
                        </p>
                    ) : null}
                </div>
            </div>

            <div className="govuk-grid-column-one-third">
                <h2 className="govuk-heading-s">Public information</h2>
                <a href="/contact" className="govuk-link govuk-!-font-size-19" id="contact-link">
                    Contact Us
                </a>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<object> => {
    regenerateSession(ctx.req);
    const multipleOperators = checkIfMultipleOperators(ctx);

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const sessionNoc = operatorAttribute?.nocCode;

    if ((!sessionNoc || sessionNoc.includes('|')) && multipleOperators && ctx.res) {
        redirectTo(ctx.res, '/multipleOperators');
    }
    const csrfToken = getCsrfToken(ctx);
    const showDeleteProductsLink = process.env.NODE_ENV === 'development' || process.env.STAGE === 'test';

    let uniqueModes: string[] = [];
    let multiOperatorFaresRequiringAttentionCount = 0;

    if (sessionNoc) {
        const services = await getAllServicesByNocCode(sessionNoc);
        const hasBodsServices = services.some((service) => service.dataSource && service.dataSource === 'bods');
        const tndsServices = services.filter((service) => service.dataSource && service.dataSource === 'tnds');

        if (!hasBodsServices && tndsServices.length > 0) {
            const modes = tndsServices
                .map((service) => {
                    return service.mode ? service.mode : '';
                })
                .filter((mode) => mode !== '');

            uniqueModes = Array.from(new Set(modes));
        }

        const multiOperatorProductsRequiringAttention: ProductAdditionaNocs[] =
            await getIncompleteMultiOperatorExternalProductsByNoc(sessionNoc);
        multiOperatorFaresRequiringAttentionCount = multiOperatorProductsRequiringAttention.length;
    }
    updateSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE, uniqueModes.length > 0 ? { modes: uniqueModes } : undefined);

    return {
        props: {
            csrfToken,
            showDeleteProductsLink,
            multiOperatorFaresRequiringAttentionCount,
        },
    };
};

export default Home;
