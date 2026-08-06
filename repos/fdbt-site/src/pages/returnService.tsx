import { ReactElement } from 'react';
import upperFirst from 'lodash/upperFirst';
import { ErrorInfo, NextPageContextWithSession, ServiceType } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import TwoThirdsLayout from '../layout/Layout';
import {
    OPERATOR_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
} from '../constants/attributes';
import {
    getPassengerTypeById,
    getServicesByNocCodeAndDataSource,
    getTndsServicesByNocAndModes,
} from '../data/auroradb';
import ErrorSummary from '../components/ErrorSummary';
import { getAndValidateNoc, getCsrfToken, isReturnTicket } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute } from '../utils/sessions';
import { redirectTo } from '../utils/apiUtils';
import InformationSummary from '../components/InformationSummary';
import BackButton from '../components/BackButton';

const title = 'Return Service - Create Fares Data Service';
const description = 'Return Service selection page of the Create Fares Data Service';
const errorId = 'returnService';

interface ReturnServiceProps {
    operator: string;
    passengerType: string;
    services: ServiceType[];
    errors: ErrorInfo[];
    csrfToken: string;
    selectedServiceId: number;
    backHref: string;
    dataSource: string;
}

const ReturnService = ({
    operator,
    passengerType,
    services,
    errors,
    csrfToken,
    selectedServiceId,
    backHref,
    dataSource,
}: ReturnServiceProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={errors}>
        <BackButton href={backHref} />
        <CsrfForm action="/api/returnService" method="post" csrfToken={csrfToken}>
            <>
                <label htmlFor="service">
                    <h1 className="govuk-heading-l" id="service-page-heading">
                        Select another service for return leg
                    </h1>
                </label>

                <InformationSummary informationText="No stops are being changed, you are only adding a service" />
                <span className="govuk-hint" id="service-operator-passenger-type-hint">
                    {operator} - {upperFirst(passengerType)}
                </span>
                <ErrorSummary errors={errors} />

                <div className={`govuk-form-group ${errors.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <FormElementWrapper errors={errors} errorId={errorId} errorClass="govuk-select--error">
                        <select
                            className="govuk-select"
                            id="service"
                            name="serviceId"
                            defaultValue={errors.length > 0 && errors[0].userInput ? errors[0].userInput : undefined}
                        >
                            <option value="" disabled>
                                Select One
                            </option>
                            {services
                                .filter((service) => {
                                    return service.id != selectedServiceId;
                                })
                                .map((service) => (
                                    <option key={`${service.id}`} value={`${service.id}`} className="service-option">
                                        {service.lineName} {service.origin || 'N/A'} - {service.destination || 'N/A'}{' '}
                                        (Start date {service.startDate})
                                    </option>
                                ))}
                        </select>
                    </FormElementWrapper>
                    <span className="govuk-hint hint-text" id="traveline-hint">
                        This data is taken from the{' '}
                        <b>
                            {dataSource === 'tnds'
                                ? 'Traveline National Dataset (TNDS)'
                                : 'Bus Open Data Service (BODS)'}
                        </b>
                        . If the service you are looking for is not listed, contact the BODS help desk for advice{' '}
                        <a href="/contact">on the contact page</a>
                    </span>
                </div>
                <input type="hidden" name="selectedServiceId" value={selectedServiceId} />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ReturnServiceProps }> => {
    const csrfToken = getCsrfToken(ctx);

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);
    const modesAttribute = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE);
    const nocCode = getAndValidateNoc(ctx);
    const selectedServiceId = Number(ctx.query.selectedServiceId);

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);

    if (!ticket || !matchingJsonMetaData) {
        throw new Error('Ticket details not found');
    }
    if (!selectedServiceId) {
        throw new Error('Added service is missing');
    }

    if (!isReturnTicket(ticket)) {
        throw new Error('Ticket should be return type');
    }

    let dataSource = 'bods';
    let services;
    if (modesAttribute) {
        dataSource = 'tnds';
        services = await getTndsServicesByNocAndModes(nocCode, modesAttribute.modes);
    } else {
        services = await getServicesByNocCodeAndDataSource(nocCode, 'bods');
    }

    if (services.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/noServices');
        } else {
            throw new Error(`No services found in BODS for NOC Code: ${nocCode}`);
        }
    }

    const passengerType = await getPassengerTypeById(ticket.passengerType.id, nocCode);

    const backHref = `/products/productDetails?productId=${matchingJsonMetaData.productId}${
        matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
    }`;

    return {
        props: {
            operator: operatorAttribute && operatorAttribute.name ? operatorAttribute.name : '',
            passengerType: passengerType ? passengerType.name : '',
            services: services,
            errors: [],
            csrfToken,
            selectedServiceId,
            backHref,
            dataSource,
        },
    };
};

export default ReturnService;
