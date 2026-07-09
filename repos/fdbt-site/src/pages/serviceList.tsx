import React, { ReactElement, useState } from 'react';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper, { FormGroupWrapper } from '../components/FormElementWrapper';
import { FullColumnLayout } from '../layout/Layout';
const FareZoneExampleCsv = '/files/Fare-Zone-Example.csv';
const csvImage = '/images/csv.png';
import {
    SERVICE_LIST_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    STOPS_EXEMPTION_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
} from '../constants/attributes';
import {
    getAdditionalNocsForMultiOpExtProduct,
    getAllServicesByNocCode,
    getServicesByNocCodeAndDataSource,
} from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession, ServicesInfo, FareType, TxcSourceAttribute } from '../interfaces';
import { getAdditionalNocMatchingJsonLink, getAndValidateNoc, getCsrfToken } from '../utils';
import CsrfForm from '../components/CsrfForm';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { redirectTo } from '../utils/apiUtils';
import BackButton from '../components/BackButton';
import FileAttachment from '../components/FileAttachment';
import { isExemptStopsAttributeWithErrors, isServiceListAttributeWithErrors } from '../interfaces/typeGuards';
import { getProductsSecondaryOperatorInfo } from '../data/s3';
import logger from '../utils/logger';
import { SelectedService, Stop } from '../interfaces/matchingJsonTypes';

const pageTitle = 'Service List - Create Fares Data Service';
const pageDescription = 'Service List selection page of the Create Fares Data Service';

interface ServiceListProps {
    serviceList: ServicesInfo[];
    errors: ErrorInfo[];
    multiOperator: boolean;
    dataSourceAttribute: TxcSourceAttribute;
    csrfToken: string;
    additional: boolean;
    backHref: string;
    selectedYesToExempt: boolean;
    exemptStops: string;
    isEditMode: boolean;
    secondaryOperatorNoc: string | null;
}

const containsErrorForServices = (errors: ErrorInfo[]): boolean => !!errors.find((error) => error.id === 'checkbox-0');

const containsErrorForExempt = (errors: ErrorInfo[]): boolean => !!errors.find((error) => error.id === 'csv-upload');

const ServiceList = ({
    serviceList,
    csrfToken,
    errors,
    multiOperator,
    dataSourceAttribute,
    additional,
    backHref,
    selectedYesToExempt,
    exemptStops,
    isEditMode,
    secondaryOperatorNoc,
}: ServiceListProps): ReactElement => {
    const seen: string[] = [];
    const uniqueServiceList =
        serviceList.filter((item) => (seen.includes(item.lineId) ? false : seen.push(item.lineId))) ?? [];

    const [buttonText, setButtonText] = useState(
        serviceList.every((service) => service.checked) ? 'Unselect All Services' : 'Select All Services',
    );

    const [checkedServices, setCheckedServices] = useState(uniqueServiceList.filter((service) => service.checked));

    const [userWantsToEditExemptStops, setUserWantsToEditExemptStops] = useState(false);

    const toggleAllServices = (): void => {
        if (checkedServices.length !== uniqueServiceList.length && buttonText === 'Select All Services') {
            setButtonText('Unselect All Services');
            setCheckedServices(uniqueServiceList);
        } else {
            setButtonText('Select All Services');
            setCheckedServices([]);
        }
    };

    const updateCheckedServiceList = (e: React.ChangeEvent<HTMLInputElement>, lineId: string) => {
        if (!e.target.checked) {
            setCheckedServices(checkedServices.filter((service) => service.lineId !== lineId));
        } else {
            const serviceToAdd = uniqueServiceList.find((service) => service.lineId === lineId);
            if (serviceToAdd) {
                setCheckedServices([...checkedServices, serviceToAdd]);
            }
        }
    };

    const multiOperatorText = multiOperator ? 'of your ' : '';

    const defaultCheckedYes = (!userWantsToEditExemptStops && isEditMode) || selectedYesToExempt || !!exemptStops;
    const defaultCheckedNo = !defaultCheckedYes;

    return (
        <FullColumnLayout title={pageTitle} description={pageDescription}>
            {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
            <CsrfForm action="/api/serviceList" method="post" csrfToken={csrfToken} encType="multipart/form-data">
                <>
                    <ErrorSummary errors={errors} />
                    <div
                        className={`govuk-form-group ${
                            containsErrorForServices(errors) ? 'govuk-form-group--error' : ''
                        }`}
                    >
                        <fieldset className="govuk-fieldset">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                                <h1 className="govuk-heading-l" id="service-list-page-heading">
                                    Which {additional ? 'additional ' : multiOperatorText}services is the ticket valid
                                    for?
                                </h1>
                            </legend>
                            <span className="govuk-heading-s">Select all {multiOperatorText}services that apply</span>
                            <input
                                type="button"
                                name="selectAll"
                                value={buttonText}
                                id="select-all-button"
                                className="govuk-button govuk-button--secondary"
                                onClick={toggleAllServices}
                            />
                            <br />
                            <span className="govuk-hint" id="txc-hint">
                                This data is taken from the{' '}
                                <b>
                                    {dataSourceAttribute.source === 'tnds'
                                        ? 'Traveline National Dataset (TNDS)'
                                        : 'Bus Open Data Service (BODS)'}
                                </b>
                                . If the service you are looking for is not listed, contact the BODS help desk for
                                advice <a href="/contact">on the contact page</a>.
                            </span>
                            <br />
                            <br />
                            <FormElementWrapper
                                errors={containsErrorForServices(errors) ? errors : []}
                                errorId="checkbox-0"
                                errorClass=""
                                addFormGroupError={false}
                            >
                                <div className="govuk-checkboxes">
                                    {uniqueServiceList.map((service, index) => {
                                        const {
                                            lineName,
                                            lineId,
                                            serviceCode,
                                            description,
                                            checked,
                                            origin,
                                            destination,
                                        } = service;

                                        const checkboxTitles =
                                            dataSourceAttribute.source === 'tnds'
                                                ? `${lineName} - ${description}`
                                                : `${lineName} ${origin || 'N/A'} - ${destination || 'N/A'}`;

                                        const checkBoxValues = `${description}`;

                                        return (
                                            <div className="govuk-checkboxes__item" key={`checkbox-item-${lineName}`}>
                                                <input
                                                    className="govuk-checkboxes__input"
                                                    id={`checkbox-${index}`}
                                                    name={`${lineName}#${lineId}#${serviceCode}`}
                                                    type="checkbox"
                                                    value={checkBoxValues}
                                                    defaultChecked={checked}
                                                    checked={
                                                        !!checkedServices.find((service) => service.lineId === lineId)
                                                    }
                                                    onChange={(e) => updateCheckedServiceList(e, lineId)}
                                                />
                                                <label
                                                    className="govuk-label govuk-checkboxes__label"
                                                    htmlFor={`checkbox-${index}`}
                                                >
                                                    {checkboxTitles}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormElementWrapper>
                        </fieldset>
                    </div>

                    {isEditMode ? (
                        <div className="govuk-!-margin-bottom-6">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                <h2 className="govuk-fieldset__heading">
                                    You previously uploaded{' '}
                                    {!!exemptStops
                                        ? `${exemptStops.split(', ').length} exempt stops`
                                        : 'no exempt stops'}
                                    . Do you want to edit them?{' '}
                                </h2>
                            </legend>
                            <div className="govuk-radios" data-module="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="exempt-yes"
                                        name="edit-exempt"
                                        value="yes"
                                        type="radio"
                                        data-aria-controls="conditional-yes"
                                        onChange={() => {
                                            setUserWantsToEditExemptStops(true);
                                        }}
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="exempt-yes">
                                        Yes
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        id="exempt-no"
                                        name="edit-exempt"
                                        value="no"
                                        type="radio"
                                        defaultChecked
                                        onChange={() => {
                                            setUserWantsToEditExemptStops(false);
                                        }}
                                    />
                                    <label className="govuk-label govuk-radios__label" htmlFor="exempt-no">
                                        No
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className={isEditMode && !userWantsToEditExemptStops ? `govuk-visually-hidden` : ''}>
                        <div className="govuk-warning-text">
                            <span className="govuk-warning-text__icon" aria-hidden="true">
                                !
                            </span>
                            <strong className="govuk-warning-text__text">
                                <span className="govuk-visually-hidden">Warning</span>
                                If there are stops exempt, you can omit them by selecting yes below and uploading the
                                stops you want to omit.
                            </strong>
                        </div>
                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                    <h2 className="govuk-fieldset__heading">Are there stops which are not included?</h2>
                                </legend>
                                <FormElementWrapper
                                    errorId="csv-upload"
                                    errorClass="govuk-form-group--error"
                                    errors={containsErrorForExempt(errors) ? errors : []}
                                >
                                    <div className="govuk-radios" data-module="govuk-radios">
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="yes"
                                                name="exempt"
                                                type="radio"
                                                value="yes"
                                                data-aria-controls="conditional-yes"
                                                defaultChecked={defaultCheckedYes}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="yes">
                                                Yes
                                            </label>
                                        </div>
                                        <div
                                            className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                            id="conditional-yes"
                                        >
                                            <>
                                                <div
                                                    className={`govuk-form-group ${
                                                        containsErrorForExempt(errors) ? 'govuk-form-group--error' : ''
                                                    }`}
                                                >
                                                    <label htmlFor="csv-upload">
                                                        <h1 className="govuk-heading-m">Upload exempt stops</h1>
                                                    </label>

                                                    <span
                                                        className="govuk-hint govuk-!-margin-bottom-5"
                                                        id="csv-upload-hint"
                                                    >
                                                        Upload exempt stops as a .csv or MS Excel file. Exempt stops are
                                                        all of the relevant NaPTAN or ATCO codes that the service(s) you
                                                        selected do not stop at.
                                                    </span>

                                                    {exemptStops && (
                                                        <span
                                                            className="govuk-hint govuk-!-margin-bottom-5"
                                                            id="previously-uploaded-stops"
                                                        >
                                                            You previously uploaded: {exemptStops}
                                                        </span>
                                                    )}

                                                    <FormGroupWrapper
                                                        errors={containsErrorForExempt(errors) ? errors : []}
                                                        errorIds={['csv-upload']}
                                                    >
                                                        <FormElementWrapper
                                                            errorId="csv-upload"
                                                            errorClass="govuk-file-upload--error"
                                                            errors={containsErrorForExempt(errors) ? errors : []}
                                                        >
                                                            <input
                                                                className="govuk-file-upload"
                                                                id="csv-upload"
                                                                name="csv-upload"
                                                                type="file"
                                                                accept=".csv,.xlsx,.xls"
                                                                aria-describedby="csv-upload-hint"
                                                            />
                                                        </FormElementWrapper>
                                                    </FormGroupWrapper>
                                                </div>

                                                <details
                                                    className="govuk-details govuk-!-margin-top-2"
                                                    data-module="govuk-details"
                                                >
                                                    <summary className="govuk-details__summary">
                                                        <span className="govuk-details__summary-text">
                                                            My exempt stops won&apos;t upload
                                                        </span>
                                                    </summary>
                                                    <div className="govuk-details__text">
                                                        <p>
                                                            Use the below template to upload your exempt stops. This is
                                                            the same template as used for fare zones, but just include
                                                            ATCO/NaPTAN codes of the stops that you wish to exempt.
                                                        </p>
                                                        <FileAttachment
                                                            displayName={
                                                                'Download fare zone CSV template - File Type CSV - File Size 673B'
                                                            }
                                                            attachmentUrl={`${FareZoneExampleCsv}`}
                                                            imageUrl={csvImage}
                                                            size={'673B'}
                                                        />
                                                    </div>
                                                </details>
                                            </>
                                        </div>
                                        <div className="govuk-radios__item">
                                            <input
                                                className="govuk-radios__input"
                                                id="no"
                                                name="exempt"
                                                type="radio"
                                                value="no"
                                                defaultChecked={defaultCheckedNo}
                                            />
                                            <label className="govuk-label govuk-radios__label" htmlFor="no">
                                                No
                                            </label>
                                        </div>
                                    </div>
                                </FormElementWrapper>
                            </fieldset>
                        </div>
                    </div>
                    <input type="hidden" name="secondary-operator-noc" value={secondaryOperatorNoc ?? undefined} />
                    <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
                </>
            </CsrfForm>
        </FullColumnLayout>
    );
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ServiceListProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const nocCode = getAndValidateNoc(ctx);
    const serviceListAttribute = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE);
    const exemptStopsAttribute = getSessionAttribute(ctx.req, STOPS_EXEMPTION_ATTRIBUTE);
    let dataSourceAttribute = getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE);
    const modesAttribute = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE);
    const exemptServicesAttribute = getSessionAttribute(ctx.req, SERVICE_LIST_EXEMPTION_ATTRIBUTE);
    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);

    const secondaryOperatorNoc =
        typeof ctx.query?.editAdditionalOperator === 'string' ? ctx.query.editAdditionalOperator : null;

    if (!ticket && !matchingJsonMetaData && secondaryOperatorNoc) {
        throw new Error('The editAdditionalOperator query parameter can not be provided for a new ticket');
    }

    if (ticket?.type !== 'multiOperatorExt' && secondaryOperatorNoc) {
        throw new Error(
            'The editAdditionalOperator query parameter provided for a ticket that is not a multiOperatorExt ticket',
        );
    }

    if (!dataSourceAttribute) {
        const services = await getAllServicesByNocCode(secondaryOperatorNoc ?? nocCode);
        const hasBodsServices = services.some((service) => service.dataSource && service.dataSource === 'bods');

        if (!hasBodsServices && !modesAttribute) {
            if (ctx.res) {
                redirectTo(ctx.res, '/noServices');
            } else {
                throw new Error(`No services found for NOC Code: ${nocCode}`);
            }
        }

        updateSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE, {
            source: hasBodsServices ? 'bods' : 'tnds',
            hasBods: true,
            hasTnds: false,
        });
        dataSourceAttribute = getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE) as TxcSourceAttribute;
    }

    let chosenDataSourceServices = await getServicesByNocCodeAndDataSource(
        secondaryOperatorNoc ?? nocCode,
        dataSourceAttribute.source,
    );

    if (!!exemptServicesAttribute && !isServiceListAttributeWithErrors(exemptServicesAttribute)) {
        const exemptServices = exemptServicesAttribute.selectedServices;
        // removing the services which the user has selected as exempted
        chosenDataSourceServices = chosenDataSourceServices.filter(
            (service) => !exemptServices.find((exemptService) => exemptService.lineId === service.lineId),
        );
    }

    const errors = [
        ...(!!serviceListAttribute && isServiceListAttributeWithErrors(serviceListAttribute)
            ? serviceListAttribute.errors
            : []),
        ...(!!exemptStopsAttribute && isExemptStopsAttributeWithErrors(exemptStopsAttribute)
            ? exemptStopsAttribute.errors
            : []),
    ];

    if (ticket && matchingJsonMetaData) {
        const backHref = `/products/productDetails?productId=${matchingJsonMetaData?.productId}`;

        if (secondaryOperatorNoc) {
            const additionalNocCodesForTicket = await getAdditionalNocsForMultiOpExtProduct(
                parseInt(matchingJsonMetaData?.productId),
            );

            if (secondaryOperatorNoc && !additionalNocCodesForTicket.find((prod) => prod === secondaryOperatorNoc)) {
                throw new Error('The secondary operator noc code provided is not valid for the ticket');
            }
        }

        let selectedServices: SelectedService[] = [];
        let exemptStops: Stop[] = [];
        let exemptedServices: SelectedService[] = [];
        const isNonLeadOperatorEditing =
            'nocCode' in ticket && ticket.nocCode !== nocCode && ticket.type === 'multiOperatorExt';

        if (isNonLeadOperatorEditing || secondaryOperatorNoc) {
            try {
                const additionalNocMatchingJsonLink = getAdditionalNocMatchingJsonLink(
                    matchingJsonMetaData.matchingJsonLink,
                    secondaryOperatorNoc ?? nocCode,
                );
                const secondaryOperatorFareInfo = await getProductsSecondaryOperatorInfo(additionalNocMatchingJsonLink);

                if ('selectedServices' in secondaryOperatorFareInfo) {
                    selectedServices = secondaryOperatorFareInfo.selectedServices;
                }

                if ('exemptStops' in secondaryOperatorFareInfo && secondaryOperatorFareInfo.exemptStops) {
                    exemptStops = secondaryOperatorFareInfo.exemptStops;
                }

                if ('exemptedServices' in secondaryOperatorFareInfo && secondaryOperatorFareInfo.exemptedServices) {
                    exemptedServices = secondaryOperatorFareInfo.exemptedServices;
                }
            } catch (error) {
                logger.warn(`Couldn't get additional operator info for noc: ${nocCode}`);
            }
        } else {
            if ('selectedServices' in ticket) {
                selectedServices = ticket.selectedServices;
            }

            if ('exemptStops' in ticket && ticket.exemptStops) {
                exemptStops = ticket.exemptStops;
            }

            if ('exemptedServices' in ticket && ticket.exemptedServices) {
                exemptedServices = ticket.exemptedServices;
            }
        }

        const services = selectedServices.map(({ lineName }) => lineName);

        const serviceListEdit: ServicesInfo[] = chosenDataSourceServices
            .map((service) => ({
                ...service,
                checked: services.includes(service.lineName),
            }))
            // removing the services which the user has selected as exempted
            .filter((service) => !exemptedServices.find((exemptService) => exemptService.lineId === service.lineId));

        return {
            props: {
                serviceList: serviceListEdit,
                errors,
                multiOperator: false,
                dataSourceAttribute,
                csrfToken,
                additional: false,
                backHref,
                selectedYesToExempt:
                    serviceListAttribute &&
                    isServiceListAttributeWithErrors(serviceListAttribute) &&
                    containsErrorForExempt(serviceListAttribute.errors)
                        ? true
                        : false,
                exemptStops: exemptStops.map((stop) => `${stop.atcoCode} - ${stop.stopName}`).join(', '),
                isEditMode: true,
                secondaryOperatorNoc,
            },
        };
    }

    const { fareType } = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE) as FareType;
    const multiOperator = fareType === 'multiOperator';

    const ticketRepresentation = getSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE);
    const additional =
        !!ticketRepresentation && 'name' in ticketRepresentation && ticketRepresentation.name === 'hybrid';

    const checkForSelectedServices =
        serviceListAttribute && !isServiceListAttributeWithErrors(serviceListAttribute)
            ? chosenDataSourceServices.map((service) => {
                  const checked = !!serviceListAttribute.selectedServices.find(
                      (selService) => selService.lineId === service.lineId,
                  );
                  return {
                      ...service,
                      checked,
                  };
              })
            : chosenDataSourceServices;

    return {
        props: {
            serviceList: checkForSelectedServices,
            errors,
            multiOperator,
            dataSourceAttribute,
            csrfToken,
            additional,
            backHref: '',
            selectedYesToExempt:
                exemptStopsAttribute && isExemptStopsAttributeWithErrors(exemptStopsAttribute) ? true : false,
            exemptStops: '',
            isEditMode: false,
            secondaryOperatorNoc,
        },
    };
};

export default ServiceList;
