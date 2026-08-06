import { ReactElement } from 'react';
import upperFirst from 'lodash/upperFirst';
import { ErrorInfo, ServiceType, NextPageContextWithSession, TxcSourceAttribute } from '../interfaces';
import FormElementWrapper from '../components/FormElementWrapper';
import TwoThirdsLayout from '../layout/Layout';
import {
    OPERATOR_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
} from '../constants/attributes';
import { getServicesByNocCodeAndDataSource } from '../data/auroradb';
import ErrorSummary from '../components/ErrorSummary';
import { getAndValidateNoc, getCsrfToken, removeDuplicateServices } from '../utils';
import CsrfForm from '../components/CsrfForm';
import {
    isPassengerType,
    isServiceAttributeWithErrors,
    isServiceAttributeWithWarnings,
} from '../interfaces/typeGuards';
import { getSessionAttribute, getRequiredSessionAttribute } from '../utils/sessions';
import { redirectTo } from '../utils/apiUtils';

const title = 'Service - Create Fares Data Service';
const description = 'Service selection page of the Create Fares Data Service';
const errorId = 'service';

interface ServiceProps {
    operator: string;
    passengerType: string;
    services: ServiceType[];
    error: ErrorInfo[];
    dataSourceAttribute: TxcSourceAttribute;
    csrfToken: string;
    warning: ErrorInfo[];
}

const Service = ({
    operator,
    passengerType,
    services,
    dataSourceAttribute,
    error,
    csrfToken,
    warning,
}: ServiceProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={error}>
        <CsrfForm action="/api/service" method="post" csrfToken={csrfToken}>
            <>
                {warning && warning.length > 0 ? <input type="hidden" name="ignoreWarning" value={'true'} /> : null}
                <label htmlFor="service">
                    <h1 className="govuk-heading-l" id="service-page-heading">
                        Select a service
                    </h1>
                </label>
                <span className="govuk-hint" id="service-operator-passenger-type-hint">
                    {operator} - {upperFirst(passengerType)}
                </span>
                <ErrorSummary errors={error} />
                {warning && warning.length > 0 ? (
                    <div className="govuk-warning-text">
                        <span className="govuk-warning-text__icon" aria-hidden="true">
                            !
                        </span>
                        <strong className="govuk-warning-text__text">
                            <span className="govuk-visually-hidden">Warning</span>
                            {warning[0].errorMessage}
                        </strong>
                    </div>
                ) : null}
                <div className={`govuk-form-group ${error.length > 0 ? 'govuk-form-group--error' : ''}`}>
                    <FormElementWrapper errors={error} errorId={errorId} errorClass="govuk-select--error">
                        <select
                            className="govuk-select"
                            id="service"
                            name="serviceId"
                            defaultValue={
                                error.length > 0 && error[0].userInput
                                    ? error[0].userInput
                                    : warning && warning.length > 0
                                      ? warning[0].userInput
                                      : undefined
                            }
                        >
                            <option value="" disabled>
                                Select One
                            </option>
                            {services.map((service) => (
                                <option key={`${service.id}`} value={`${service.id}`} className="service-option">
                                    {dataSourceAttribute.source === 'tnds'
                                        ? `${service.lineName} - Start date ${service.startDate}`
                                        : `${service.lineName} ${service.origin || 'N/A'} - ${
                                              service.destination || 'N/A'
                                          } (Start date ${service.startDate})`}
                                </option>
                            ))}
                        </select>
                    </FormElementWrapper>
                    <span className="govuk-hint hint-text" id="traveline-hint">
                        This data is taken from the{' '}
                        <b>
                            {dataSourceAttribute.source === 'tnds'
                                ? 'Traveline National Dataset (TNDS)'
                                : 'Bus Open Data Service (BODS)'}
                        </b>
                        . If the service you are looking for is not listed, contact the BODS help desk for advice{' '}
                        <a href="/contact">on the contact page</a>
                    </span>
                </div>
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ServiceProps }> => {
    const csrfToken = getCsrfToken(ctx);

    const serviceAttribute = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE);

    const error: ErrorInfo[] =
        serviceAttribute && isServiceAttributeWithErrors(serviceAttribute) ? serviceAttribute.errors : [];

    const warning: ErrorInfo[] =
        serviceAttribute && isServiceAttributeWithWarnings(serviceAttribute) ? serviceAttribute.warnings : [];

    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const nocCode = getAndValidateNoc(ctx);

    const passengerTypeAttribute = getSessionAttribute(ctx.req, PASSENGER_TYPE_ATTRIBUTE);

    if (!operatorAttribute?.name || !isPassengerType(passengerTypeAttribute) || !nocCode) {
        throw new Error('Could not render the service selection page. Necessary attributes not found.');
    }

    const dataSourceAttribute = getRequiredSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE);

    const services: ServiceType[] = await getServicesByNocCodeAndDataSource(nocCode, dataSourceAttribute.source);
    const servicesWithNoDuplicates = removeDuplicateServices<ServiceType>(services);

    if (servicesWithNoDuplicates.length === 0) {
        if (ctx.res) {
            redirectTo(ctx.res, '/noServices');
        } else {
            throw new Error(`No services found in TNDS or BODS for NOC Code: ${nocCode}`);
        }
    }

    return {
        props: {
            operator: operatorAttribute.name,
            passengerType: passengerTypeAttribute.passengerType,
            services: servicesWithNoDuplicates,
            error,
            dataSourceAttribute,
            csrfToken,
            warning,
        },
    };
};

export default Service;
