/* eslint-disable jsx-a11y/interactive-supports-focus */
import React, { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import BackButton from '../components/BackButton';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import InsetText from '../components/InsetText';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
} from '../constants/attributes';
import {
    getFerryAndTramServices,
    getOperatorDetailsFromNocTable,
    getServicesByNocCodeAndDataSourceWithGrouping,
} from '../data/auroradb';
import {
    ErrorInfo,
    MultiOperatorInfo,
    MultiOperatorInfoWithErrors,
    NextPageContextWithSession,
    ServiceWithOriginAndDestination,
} from '../interfaces';
import { AdditionalOperator, OperatorDetails } from '../interfaces/matchingJsonTypes';
import { isWithErrors } from '../interfaces/typeGuards';
import { BaseLayout } from '../layout/Layout';
import { getCsrfToken } from '../utils';
import { getSessionAttribute } from '../utils/sessions';

const pageTitle = 'Multiple Operators Service List - Create Fares Data Service';
const pageDescription = 'Multiple Operators Service List selection page of the Create Fares Data Service';

interface MultiOperatorsServiceListProps {
    multiOperatorData: MultiOperatorInfo[];
    errors: ErrorInfo[];
    csrfToken: string;
    backHref: string;
}

const bodsDataSourceHtml = (
    <>
        This data is taken from the <b>Bus Open Data Service (BODS)</b>. If the service you are looking for is not
        listed, contact the BODS help desk for advice <a href="/contact">on the contact page</a>.
    </>
);

const tndsDataSourceHtml = (
    <>
        This data is taken from the <b>Traveline National Dataset (TNDS)</b>. If the you are looking for service data
        published on BODS, contact the BODS help desk for advice <a href="/contact">on the contact page</a>.
    </>
);

const getNumberOfOperatorsWithSelectedServices = (operators: MultiOperatorInfo[]): number => {
    let count = 0;

    operators.forEach((operator) => {
        if (operator.selectedServices.length > 0) {
            count += 1;
        }
    });

    return count;
};

const getOrderOfOperators = (operators: MultiOperatorInfo[]): string[] => operators.map((operator) => operator.nocCode);

const addAllServices = (
    operators: MultiOperatorInfo[],
    currentOperator: MultiOperatorInfo,
    order: string[],
    setOperators: Dispatch<SetStateAction<MultiOperatorInfo[]>>,
) => {
    const currentStateOfOperators = operators;
    const thisOperator = currentStateOfOperators.find(
        (operator) => operator.nocCode === currentOperator.nocCode,
    ) as MultiOperatorInfo;

    const remadeOperators = [
        ...currentStateOfOperators.filter((operator) => operator.nocCode !== thisOperator.nocCode),
        { ...thisOperator, selectedServices: thisOperator.services },
    ];
    const sortedOperators = sortOperators(remadeOperators, order);
    setOperators(sortedOperators);
};

const removeAllServices = (
    operators: MultiOperatorInfo[],
    currentOperator: MultiOperatorInfo,
    order: string[],
    setOperators: Dispatch<SetStateAction<MultiOperatorInfo[]>>,
) => {
    const currentStateOfOperators = operators;
    const thisOperator = currentStateOfOperators.find(
        (operator) => operator.nocCode === currentOperator.nocCode,
    ) as MultiOperatorInfo;

    const remadeOperators = [
        ...currentStateOfOperators.filter((operator) => operator.nocCode !== thisOperator.nocCode),
        { ...thisOperator, selectedServices: [] },
    ];
    const sortedOperators = sortOperators(remadeOperators, order);
    setOperators(sortedOperators);
};

const removeService = (
    operators: MultiOperatorInfo[],
    currentOperator: MultiOperatorInfo,
    order: string[],
    setOperators: Dispatch<SetStateAction<MultiOperatorInfo[]>>,
    service: ServiceWithOriginAndDestination,
) => {
    const currentStateOfOperators = operators;
    const thisOperator = currentStateOfOperators.find(
        (operator) => operator.nocCode === currentOperator.nocCode,
    ) as MultiOperatorInfo;

    const remadeSelectedServices = thisOperator.selectedServices.filter(
        (selectedService) =>
            selectedService.lineId !== service.lineId || selectedService.startDate !== service.startDate,
    );

    const remadeOperators = [
        ...currentStateOfOperators.filter((operator) => operator.nocCode !== thisOperator.nocCode),
        { ...thisOperator, selectedServices: remadeSelectedServices },
    ];
    const sortedOperators = sortOperators(remadeOperators, order);
    setOperators(sortedOperators);
};

const sortOperators = (operators: MultiOperatorInfo[], order: string[]): MultiOperatorInfo[] => {
    const sortedOperators: MultiOperatorInfo[] = [];

    order.forEach((noc) => {
        const foundOperator = operators.find((operator) => operator.nocCode === noc) as MultiOperatorInfo;
        sortedOperators.push(foundOperator);
    });

    return sortedOperators;
};

const getActiveOperator = (activeOperatorNoc: string, operators: MultiOperatorInfo[]): MultiOperatorInfo => {
    return operators.find((operator) => operator.nocCode === activeOperatorNoc) as MultiOperatorInfo;
};

const addServiceToOperator = (
    activeOperator: MultiOperatorInfo,
    operators: MultiOperatorInfo[],
    setOperators: Dispatch<SetStateAction<MultiOperatorInfo[]>>,
    service: ServiceWithOriginAndDestination,
    order: string[],
): void => {
    const remadeOperators = [
        ...operators.filter((operator) => operator.nocCode !== activeOperator.nocCode),
        { ...activeOperator, selectedServices: [...activeOperator.selectedServices, service] },
    ];
    const sortedOperators = sortOperators(remadeOperators, order);
    setOperators(sortedOperators);
};

const MultiOperatorsServiceList = ({
    errors,
    multiOperatorData,
    csrfToken,
    backHref,
}: MultiOperatorsServiceListProps): ReactElement => {
    const order = getOrderOfOperators(multiOperatorData);
    const [activeOperatorNoc, setActiveOperatorNoc] = useState(multiOperatorData[0].nocCode);
    const [operators, setOperators] = useState(multiOperatorData);
    const operator = getActiveOperator(activeOperatorNoc, operators);
    const numberOfOperatorsWithSelectedServices = getNumberOfOperatorsWithSelectedServices(operators);
    const dataSourceText = operator.dataSource === 'bods' ? bodsDataSourceHtml : tndsDataSourceHtml;

    return (
        <BaseLayout title={pageTitle} description={pageDescription}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <ErrorSummary errors={errors} />
            <div className={errors.length > 0 ? 'govuk-form-group--error' : ''}>
                <div>
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                        <h1 className="govuk-heading-l" id="service-list-page-heading">
                            {`Select all services that apply for ${operator.name}`}
                        </h1>
                    </legend>

                    <span className="govuk-hint" id="txc-hint">
                        {dataSourceText}
                    </span>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-column-two-thirds">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                            <h1 className="govuk-heading-m govuk-!-margin-top-3" id="service-list-page-heading">
                                {`${operator.name}`}
                            </h1>
                        </legend>
                        {operator.selectedServices.length !== operator.services.length ? (
                            <button
                                onClick={() => addAllServices(operators, operator, order, setOperators)}
                                id="select-all-button"
                                className="govuk-button govuk-button--secondary"
                            >
                                Select All
                            </button>
                        ) : (
                            <InsetText text={'All services have been added'} italic />
                        )}

                        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                            {operator.services.map((service, index) => {
                                const serviceIsAlreadySelected = !!operator.selectedServices.find(
                                    (selectedService) =>
                                        service.lineId === selectedService.lineId &&
                                        service.startDate === selectedService.startDate,
                                );

                                if (serviceIsAlreadySelected) {
                                    return null;
                                }

                                const { lineName, origin, destination } = service;
                                const checkboxTitles = `${lineName} ${origin || 'N/A'} - ${destination || 'N/A'}`;
                                return (
                                    <div
                                        className="govuk-checkboxes__item dft-padding-left"
                                        key={`checkbox-item-${index}`}
                                    >
                                        <input
                                            id={`add-operator-checkbox-${index}`}
                                            className="govuk-checkboxes__input"
                                            type="checkbox"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addServiceToOperator(operator, operators, setOperators, service, order);
                                            }}
                                        />
                                        <label
                                            className="govuk-label govuk-checkboxes__label"
                                            htmlFor={`add-operator-checkbox-${index}`}
                                        >
                                            {checkboxTitles}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="govuk-grid-column-one-third ">
                        <div>
                            <table className="govuk-table border-collapse govuk-!-width-full">
                                <caption className={`govuk-table__caption govuk-table__caption--m `}>
                                    Selected Services
                                </caption>
                                <thead className="selectedOperators-header-color">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="govuk-!-padding-left-2 govuk-table__header govuk-table__caption--s govuk-!-font-size-16"
                                        >
                                            {operator.selectedServices.length} added
                                        </th>
                                        <th scope="col" className="govuk-table__header text-align-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="govuk-table__body">
                                    {operators.map((operator, index) => (
                                        <tr key={`selected-operator-${index}`}>
                                            <td
                                                className="govuk-label govuk-!-font-size-16 govuk-!-padding-top-1"
                                                key={`td0-${index}`}
                                            >
                                                <details
                                                    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                                                    role="button"
                                                    id={`details-${operator.nocCode}`}
                                                    className="govuk-details margin-bottom-0"
                                                    data-module="govuk-details"
                                                    open={operator.nocCode === activeOperatorNoc}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setActiveOperatorNoc(operator.nocCode);
                                                    }}
                                                >
                                                    <summary
                                                        className="govuk-details__summary width-x"
                                                        role="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveOperatorNoc(operator.nocCode);
                                                        }}
                                                        id={`operator-${index}`}
                                                    >
                                                        <span className="govuk-details__summary-text">
                                                            {operator.name}
                                                        </span>
                                                    </summary>
                                                    <div className="govuk-details__text">
                                                        <button
                                                            id="removeAll"
                                                            className="govuk-!-margin-right-2 button-link"
                                                            onClick={() =>
                                                                removeAllServices(
                                                                    operators,
                                                                    operator,
                                                                    order,
                                                                    setOperators,
                                                                )
                                                            }
                                                            name="removeOperator"
                                                        >
                                                            Remove all
                                                        </button>
                                                        {operator.selectedServices.map((service, index) => {
                                                            const checkboxTitles = `${service.lineName} ${
                                                                service.origin || 'N/A'
                                                            } - ${service.destination || 'N/A'}`;

                                                            return (
                                                                <React.Fragment key={service.lineName}>
                                                                    <div className="govuk-grid-row govuk-!-margin-bottom-2">
                                                                        <div className="govuk-grid-column-three-quarters govuk-!-margin-top-2">
                                                                            {checkboxTitles}
                                                                        </div>
                                                                        <div className="govuk-grid-column-one-quarter govuk-!-margin-top-2">
                                                                            <button
                                                                                id={`remove-from-${operator.nocCode}-${index}`}
                                                                                className="govuk-link button-link"
                                                                                onClick={() =>
                                                                                    removeService(
                                                                                        operators,
                                                                                        operator,
                                                                                        order,
                                                                                        setOperators,
                                                                                        service,
                                                                                    )
                                                                                }
                                                                                name="removeOperator"
                                                                            >
                                                                                Remove
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <hr className="govuk-section-break govuk-section-break--visible" />
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </div>
                                                </details>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <CsrfForm action="/api/multipleOperatorsServiceList" method="post" csrfToken={csrfToken}>
                            <div>
                                {operators.map((operator, index) => {
                                    const { nocCode, selectedServices } = operator;
                                    const elements: ReactElement[] = selectedServices.map((service, index2) => {
                                        const { lineName, lineId, serviceCode, serviceDescription, startDate } =
                                            service;

                                        return (
                                            <input
                                                key={`service-to-add-${index}-${index2}`}
                                                id={`add-OP${index}`}
                                                name={`${nocCode}#${lineName}#${lineId}#${serviceCode}#${startDate}`}
                                                type="hidden"
                                                value={`${serviceDescription}`}
                                            />
                                        );
                                    });
                                    return elements;
                                })}

                                <input
                                    id="selected-operator-count"
                                    name="selectedOperatorCount"
                                    type="hidden"
                                    value={numberOfOperatorsWithSelectedServices}
                                />

                                <input
                                    id="operator-count"
                                    name="operatorCount"
                                    type="hidden"
                                    value={operators.length}
                                />

                                <input
                                    type="submit"
                                    value="Confirm services and continue"
                                    id="continue-button"
                                    className="govuk-button govuk-!-width-full"
                                />
                            </div>
                        </CsrfForm>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: MultiOperatorsServiceListProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const multiOperatorAttribute = getSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE);
    const multiOperatorServicesAttribute = getSessionAttribute(ctx.req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE);
    let multiOperatorData: MultiOperatorInfo[] = [];
    let errors: ErrorInfo[] = [];
    let backHref = '';

    if (!multiOperatorAttribute) {
        // edit mode
        const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
        const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

        if (!ticket || !matchingJsonMetaData || !('additionalOperators' in ticket)) {
            throw new Error('Page navigated to manually without necessary session attributes.');
        }

        backHref =
            ticket && matchingJsonMetaData
                ? `/products/productDetails?productId=${matchingJsonMetaData?.productId}${
                      matchingJsonMetaData.serviceId ? `&serviceId=${matchingJsonMetaData?.serviceId}` : ''
                  }`
                : '';

        // map over all additional operators in the ticket
        multiOperatorData = await Promise.all(
            ticket.additionalOperators.map(async (operator) => {
                let dataSource: 'bods' | 'tnds' = 'bods';
                let services = await getServicesByNocCodeAndDataSourceWithGrouping(operator.nocCode, dataSource);

                if (services.length === 0) {
                    services = await getFerryAndTramServices(operator.nocCode);
                    dataSource = 'tnds';
                }
                // get the operators name, as we only have the nocCode
                const operatorDetails = (await getOperatorDetailsFromNocTable(operator.nocCode)) as OperatorDetails;

                // as we dont have the origin / destination of any of the selected services
                // we need to enrich the service using
                // the services we get back from the database

                const updatedSelectedServices = operator.selectedServices.map((service) => {
                    const matchingService = services.find(
                        (serviceWithOandD) =>
                            serviceWithOandD.lineId === service.lineId &&
                            serviceWithOandD.startDate === service.startDate,
                    ) as ServiceWithOriginAndDestination;

                    return {
                        ...service,
                        origin: matchingService.origin,
                        destination: matchingService.destination,
                    };
                });

                return {
                    name: operatorDetails.operatorName,
                    nocCode: operator.nocCode,
                    services,
                    selectedServices: updatedSelectedServices,
                    dataSource,
                };
            }),
        );
    } else {
        multiOperatorData = await Promise.all(
            multiOperatorAttribute.selectedOperators.map(async (operator) => {
                let dataSource: 'bods' | 'tnds' = 'bods';
                let services = await getServicesByNocCodeAndDataSourceWithGrouping(operator.nocCode, dataSource);

                if (services.length === 0) {
                    services = await getFerryAndTramServices(operator.nocCode);
                    dataSource = 'tnds';
                }

                return {
                    name: operator.name,
                    nocCode: operator.nocCode,
                    services,
                    selectedServices: [],
                    dataSource,
                };
            }),
        );
    }

    if (!!multiOperatorServicesAttribute && isWithErrors(multiOperatorServicesAttribute)) {
        errors = multiOperatorServicesAttribute.errors;
        // as we dont have the origin / destination of any of the selected services
        // we need to enrich the service using
        // the services we get back from the database
        multiOperatorData = multiOperatorData.map((operator) => {
            const matchingOperator: AdditionalOperator | undefined =
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                (multiOperatorServicesAttribute as MultiOperatorInfoWithErrors).multiOperatorInfo.find(
                    (op: AdditionalOperator) => op.nocCode === operator.nocCode,
                );
            if (!matchingOperator) {
                return operator;
            }

            const matchingSelectedServices = matchingOperator.selectedServices;
            const servicesWithOriginAndDestination = operator.services;

            const updatedSelectedServices = matchingSelectedServices.map((service) => {
                const matchingService = servicesWithOriginAndDestination.find(
                    (serviceWithOandD) =>
                        serviceWithOandD.lineId === service.lineId && serviceWithOandD.startDate === service.startDate,
                ) as ServiceWithOriginAndDestination;

                return {
                    ...service,
                    origin: matchingService.origin,
                    destination: matchingService.destination,
                };
            });

            return {
                ...operator,
                selectedServices: updatedSelectedServices,
            };
        });
    }

    return {
        props: {
            multiOperatorData,
            errors,
            csrfToken,
            backHref,
        },
    };
};

export default MultiOperatorsServiceList;
