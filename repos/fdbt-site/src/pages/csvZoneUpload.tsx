import React, { ReactElement, useState } from 'react';
import { BaseLayout } from '../layout/Layout';
import UserDataUploadComponent from '../components/UserDataUploads';
import {
    FARE_ZONE_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
} from '../constants/attributes';
import FareZoneExampleCsv from '../assets/files/Fare-Zone-Example.csv';
import HowToUploadFareZone from '../assets/files/How-to-Upload-a-Fare-Zone.pdf';
import {
    NextPageContextWithSession,
    ErrorInfo,
    UserDataUploadsProps,
    FareZoneWithErrors,
    ServicesInfo,
    TxcSourceAttribute,
} from '../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { getAdditionalNocMatchingJsonLink, getAndValidateNoc, getCsrfToken } from '../utils';
import { getAllServicesByNocCode, getServicesByNocCodeAndDataSource } from '../data/auroradb';
import { redirectTo } from '../utils/apiUtils';
import FormElementWrapper from '../components/FormElementWrapper';
import BackButton from '../components/BackButton';
import ErrorSummary from '../components/ErrorSummary';
import FileAttachment from '../components/FileAttachment';
import guidanceDocImage from '../assets/images/Guidance-doc-front-page.png';
import csvImage from '../assets/images/csv.png';
import CsrfForm from '../components/CsrfForm';
import { isServiceListAttributeWithErrors } from '../interfaces/typeGuards';
import AccessibilityDetails from '../components/AccessibilityDetails';
import { SUPPORT_EMAIL_ADDRESS } from '../constants';
import { SelectedService } from '../interfaces/matchingJsonTypes';
import logger from '../utils/logger';
import { getProductsSecondaryOperatorInfo } from '../data/s3';

const title = 'CSV Zone Upload - Create Fares Data Service';
const description = 'CSV Zone Upload page of the Create Fares Data Service';

interface CSVZoneUploadProps extends UserDataUploadsProps {
    serviceList: ServicesInfo[];
    dataSourceAttribute: TxcSourceAttribute;
    clickedYes: boolean;
    backHref: string;
    guidanceDocDisplayName: string;
    guidanceDocSize: string;
    csvTemplateDisplayName: string;
    csvTemplateSize: string;
    csrfToken: string;
    supportEmail: string;
}

const CsvZoneUpload = ({
    errors,
    serviceList,
    clickedYes,
    dataSourceAttribute,
    backHref,
    guidanceDocDisplayName,
    guidanceDocSize,
    csvTemplateDisplayName,
    csvTemplateSize,
    csrfToken,
    supportEmail,
    ...uploadProps
}: CSVZoneUploadProps): ReactElement => {
    const seen: string[] = [];
    const uniqueServiceList =
        serviceList.filter((item) => (seen.includes(item.lineId) ? false : seen.push(item.lineId))) ?? [];

    const [buttonText, setButtonText] = useState(
        serviceList.every((service) => service.checked) ? 'Unselect All Services' : 'Select All Services',
    );
    const [checkedServices, setCheckedServices] = useState(uniqueServiceList.filter((service) => service.checked));

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

    return (
        <BaseLayout title={title} description={description} errors={errors}>
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    {!!backHref && errors.length === 0 ? <BackButton href={backHref} /> : null}
                    <ErrorSummary errors={errors} />
                    <CsrfForm
                        action="/api/csvZoneUpload"
                        method="post"
                        encType="multipart/form-data"
                        csrfToken={csrfToken}
                    >
                        <UserDataUploadComponent
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...uploadProps}
                            errors={errors}
                            detailBody={
                                <>
                                    <p>Some common issues with fare zone uploads include:</p>
                                    <ul className="govuk-list govuk-list--bullet">
                                        <li>Commas in fare zone names</li>
                                    </ul>
                                    <p>
                                        Use the help file document for a more detailed help on constructing a fare zone
                                        CSV in the required format or download the .csv template to create a new file.
                                    </p>
                                </>
                            }
                        />

                        <div>
                            <div className="govuk-warning-text">
                                <span className="govuk-warning-text__icon govuk-!-margin-top-1" aria-hidden="true">
                                    !
                                </span>
                                <strong className="govuk-warning-text__text">
                                    <span className="govuk-visually-hidden">Warning</span>
                                    If there are services exempt, you can omit them by selecting yes below and selecting
                                    the services you want to omit.
                                </strong>
                            </div>
                            <div className="govuk-form-group">
                                <fieldset className="govuk-fieldset">
                                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                        <h2 className="govuk-fieldset__heading">
                                            Are there services within this zone which are not included?
                                        </h2>
                                    </legend>
                                    <FormElementWrapper
                                        errorId="checkbox-0"
                                        errorClass="govuk-form-group--error"
                                        errors={errors}
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
                                                    defaultChecked={clickedYes}
                                                />
                                                <label className="govuk-label govuk-radios__label" htmlFor="yes">
                                                    Yes
                                                </label>
                                            </div>
                                            <div
                                                className="govuk-radios__conditional govuk-radios__conditional--hidden"
                                                id="conditional-yes"
                                            >
                                                <div className="govuk-form-group">
                                                    <input
                                                        type="button"
                                                        name="selectAll"
                                                        value={buttonText}
                                                        id="select-all-button"
                                                        className="govuk-button govuk-button--secondary"
                                                        onClick={toggleAllServices}
                                                    />
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
                                                                dataSourceAttribute &&
                                                                dataSourceAttribute.source === 'tnds'
                                                                    ? `${lineName} - ${description}`
                                                                    : `${lineName} ${origin || 'N/A'} - ${
                                                                          destination || 'N/A'
                                                                      }`;

                                                            const checkBoxValues = `${description}`;

                                                            return (
                                                                <div
                                                                    className="govuk-checkboxes__item"
                                                                    key={`checkbox-item-${lineName}`}
                                                                >
                                                                    <input
                                                                        className="govuk-checkboxes__input"
                                                                        id={`checkbox-${index}`}
                                                                        name={`${lineName}#${lineId}#${serviceCode}`}
                                                                        type="checkbox"
                                                                        value={checkBoxValues}
                                                                        checked={
                                                                            !!checkedServices.find(
                                                                                (service) => service.lineId === lineId,
                                                                            )
                                                                        }
                                                                        defaultChecked={checked}
                                                                        onChange={(e) =>
                                                                            updateCheckedServiceList(e, lineId)
                                                                        }
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
                                                </div>
                                            </div>
                                            <div className="govuk-radios__item">
                                                <input
                                                    className="govuk-radios__input"
                                                    id="no"
                                                    name="exempt"
                                                    type="radio"
                                                    value="no"
                                                    defaultChecked={!clickedYes}
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
                        <input type="submit" value="Upload and continue" id="submit-button" className="govuk-button" />
                    </CsrfForm>
                </div>

                <div className="govuk-grid-column-one-third">
                    <h2 className="govuk-heading-s">Help documents</h2>
                    <FileAttachment
                        displayName={guidanceDocDisplayName}
                        attachmentUrl={`${HowToUploadFareZone}`}
                        imageUrl={guidanceDocImage}
                        size={guidanceDocSize}
                    />
                    <AccessibilityDetails supportEmail={supportEmail} />
                    <FileAttachment
                        displayName={csvTemplateDisplayName}
                        attachmentUrl={`${FareZoneExampleCsv}`}
                        imageUrl={csvImage}
                        size={csvTemplateSize}
                    />
                </div>
            </div>
        </BaseLayout>
    );
};

export const isFareZoneAttributeWithErrors = (
    fareZoneAttribute: string | FareZoneWithErrors,
): fareZoneAttribute is FareZoneWithErrors => (fareZoneAttribute as FareZoneWithErrors).errors !== undefined;

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: CSVZoneUploadProps }> => {
    const fareZoneAttribute = getSessionAttribute(ctx.req, FARE_ZONE_ATTRIBUTE);
    const errors: ErrorInfo[] =
        fareZoneAttribute && isFareZoneAttributeWithErrors(fareZoneAttribute) ? fareZoneAttribute.errors : [];

    const ticket = getSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE);
    const matchingJsonMetaData = getSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE);
    const serviceListAttribute = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE);

    const backHref =
        ticket && matchingJsonMetaData ? `/products/productDetails?productId=${matchingJsonMetaData.productId}` : '';

    const nocCode = getAndValidateNoc(ctx);
    const exemptedServicesAttribute = getSessionAttribute(ctx.req, SERVICE_LIST_EXEMPTION_ATTRIBUTE);
    let dataSourceAttribute = getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE);

    const modesAttribute = getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE);

    if (!dataSourceAttribute) {
        const services = await getAllServicesByNocCode(nocCode);
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

    const selectedExemptedServices =
        exemptedServicesAttribute && !isServiceListAttributeWithErrors(exemptedServicesAttribute)
            ? exemptedServicesAttribute.selectedServices
            : [];
    let chosenDataSourceServices = await getServicesByNocCodeAndDataSource(nocCode, dataSourceAttribute.source);

    if (serviceListAttribute && !isServiceListAttributeWithErrors(serviceListAttribute)) {
        const { selectedServices } = serviceListAttribute;

        chosenDataSourceServices = chosenDataSourceServices.filter(
            (exemptService) => !selectedServices.find((service) => exemptService.lineId === service.lineId),
        );
    }

    const selectedLineIds = selectedExemptedServices.map((service) => service.lineId);
    const serviceList: ServicesInfo[] = chosenDataSourceServices.map((service) => {
        return {
            ...service,
            checked: selectedLineIds.includes(service.lineId),
        };
    });

    const commonProps = {
        csvUploadTitle: 'Upload fare zone',
        csvUploadHintText:
            'Upload a fare zone as a .csv or MS Excel file. A fare zone is made up of all the relevant NaPTAN or ATCO codes within a geographical area. Refer to the help documents section to download a help file or a template.',
        guidanceDocDisplayName: 'Download Help File - File Type PDF - File Size 826KB',
        guidanceDocAttachmentUrl: HowToUploadFareZone,
        guidanceDocSize: '967KB',
        csvTemplateDisplayName: 'Download fare zone CSV template - File Type CSV - File Size 673B',
        csvTemplateAttachmentUrl: FareZoneExampleCsv,
        csvTemplateSize: '673B',
        errors,
        detailSummary: "My fare zone won't upload",
        csrfToken: getCsrfToken(ctx),
        backHref,
        dataSourceAttribute,
        supportEmail: SUPPORT_EMAIL_ADDRESS,
    };

    const hasClickedYes = (serviceList: ServicesInfo[]) => {
        return serviceList.some((service) => service.checked);
    };

    if (ticket && matchingJsonMetaData) {
        let exemptedServices: SelectedService[] = [];
        let selectedServices: SelectedService[] = [];
        const isNonLeadOperatorEditing =
            'nocCode' in ticket && ticket.nocCode !== nocCode && ticket.type === 'multiOperatorExt';

        if (isNonLeadOperatorEditing) {
            try {
                const additionalNocMatchingJsonLink = getAdditionalNocMatchingJsonLink(
                    matchingJsonMetaData.matchingJsonLink,
                    nocCode,
                );
                const secondaryOperatorFareInfo = await getProductsSecondaryOperatorInfo(additionalNocMatchingJsonLink);

                if ('exemptedServices' in secondaryOperatorFareInfo && secondaryOperatorFareInfo.exemptedServices) {
                    exemptedServices = secondaryOperatorFareInfo.exemptedServices;
                }

                if ('selectedServices' in secondaryOperatorFareInfo) {
                    selectedServices = secondaryOperatorFareInfo.selectedServices;
                }
            } catch (error) {
                logger.warn(`Couldn't get additional operator info for noc: ${nocCode}`);
            }
        } else {
            if ('exemptedServices' in ticket && ticket.exemptedServices) {
                exemptedServices = ticket.exemptedServices;
            }

            if ('selectedServices' in ticket && ticket.selectedServices) {
                selectedServices = ticket.selectedServices;
            }
        }

        const services: string[] = exemptedServices.map((service) => service.lineId);

        const serviceListEdit: ServicesInfo[] = chosenDataSourceServices
            .map((service) => ({
                ...service,
                checked: services.includes(service.lineId),
            }))
            // ensuring that they cannot exempt a service which has already been selected for the ticket
            .filter((exemptService) => !selectedServices.find((service) => exemptService.lineId === service.lineId));

        return {
            props: {
                ...commonProps,
                serviceList: serviceListEdit,
                clickedYes: hasClickedYes(serviceListEdit),
            },
        };
    }
    return {
        props: {
            ...commonProps,
            serviceList,
            clickedYes: hasClickedYes(serviceList),
        },
    };
};

export default CsvZoneUpload;
