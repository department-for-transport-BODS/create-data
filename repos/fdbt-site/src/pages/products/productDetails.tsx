import { ReactElement, useState } from 'react';
import {
    convertDateFormat,
    fareTypeIsAllowedToAddACap,
    getAdditionalNocMatchingJsonLink,
    getAndValidateNoc,
    getCsrfToken,
    isReturnTicket,
    sentenceCaseString,
} from '../../utils';
import {
    getServiceByNocAndId,
    getPassengerTypeNameByIdAndNoc,
    getProductById,
    getProductByIdAndAdditionalNoc,
    getSalesOfferPackageByIdAndNoc,
    getTimeRestrictionByIdAndNoc,
    getServiceDirectionDescriptionsByNocAndServiceIdAndDataSource,
    getServiceByIdAndDataSource,
    getCapByNocAndId,
    getCaps,
    MultipleResultsError,
} from '../../data/auroradb';
import { ProductDetailsElement, NextPageContextWithSession, ProductDateInformation, Cap } from '../../interfaces';
import TwoThirdsLayout from '../../layout/Layout';
import { getProductStatusTag } from './services';
import { getProductsSecondaryOperatorInfo, getProductsMatchingJson } from '../../data/s3';
import BackButton from '../../components/BackButton';
import InformationSummary from '../../components/InformationSummary';
import { getSessionAttribute, updateSessionAttribute } from '../../utils/sessions';
import {
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
} from '../../../src/constants/attributes';
import ProductNamePopup from '../../components/ProductNamePopup';
import GenerateReturnPopup from '../../components/GenerateReturnPopup';
import { Stop, TicketWithIds } from '../../interfaces/matchingJsonTypes';
import { isGeoZoneTicket } from '../../../src/interfaces/typeGuards';
import { fareTypes, STAGE } from '../../constants';
import { MyFaresProduct } from '../../interfaces/dbTypes';
import logger from '../../utils/logger';

const title = 'Product Details - Create Fares Data Service';
const description = 'Product Details page of the Create Fares Data Service';

interface ProductDetailsProps {
    backHref: string;
    productName: string;
    endDate?: string;
    startDate: string;
    productDetailsElements: ProductDetailsElement[];
    requiresAttention: boolean;
    productId: string;
    serviceId?: string;
    lineId?: string;
    copiedProduct: boolean;
    passengerTypeId: number;
    isSingle: boolean;
    cannotGenerateReturn: boolean;
    csrfToken: string;
    fareTriangleModified?: string;
    isOwnProduct: boolean;
    incomplete: boolean;
}

const createGenerateReturnUrl = (
    lineId: string,
    passengerTypeId: string,
    serviceId: string,
    productId: string,
    csrfToken: string,
) =>
    `/api/generateReturn?lineId=${lineId}&passengerTypeId=${passengerTypeId}&serviceId=${serviceId}&productId=${productId}&_csrf=${csrfToken}`;

const ProductDetails = ({
    backHref,
    productName,
    startDate,
    endDate,
    productDetailsElements,
    requiresAttention,
    productId,
    serviceId,
    copiedProduct,
    lineId,
    passengerTypeId,
    isSingle,
    cannotGenerateReturn,
    csrfToken,
    isOwnProduct,
    incomplete,
}: ProductDetailsProps): ReactElement => {
    const [editNamePopupOpen, setEditNamePopupOpen] = useState(false);
    const [generateReturnPopupOpen, setGenerateReturnPopupOpen] = useState(cannotGenerateReturn);

    const editNameCancelActionHandler = (): void => {
        setEditNamePopupOpen(false);
    };

    const generateReturnCancelActionHandler = (): void => {
        setGenerateReturnPopupOpen(false);
    };

    return (
        <TwoThirdsLayout title={title} description={description} errors={[]}>
            <BackButton href={backHref} />
            {copiedProduct && (
                <InformationSummary informationText="This is a copy of the product you selected. Edit one or more of the fields as required." />
            )}
            <div className="dft-flex">
                <h1 className="govuk-heading-l" id="product-name-header">
                    {productName}
                </h1>
                {isOwnProduct && (
                    <button
                        id="edit-product-name"
                        className="govuk-link govuk-body align-top button-link govuk-!-margin-left-2"
                        onClick={() => setEditNamePopupOpen(true)}
                    >
                        Edit
                    </button>
                )}
            </div>

            <div id="product-status" className="govuk-hint">
                Product status: {getProductStatusTag(incomplete, startDate, endDate, false)}
                {requiresAttention && (
                    <strong className="govuk-tag govuk-tag--yellow govuk-!-margin-left-2">Needs attention</strong>
                )}
            </div>

            {productDetailsElements.map((element) => {
                if (element.name === 'Fare type' && lineId) {
                    return (
                        <dl className="govuk-summary-list" key={element.name}>
                            <div className="govuk-summary-list__row" key={element.name}>
                                <dt className="govuk-summary-list__key">{element.name}</dt>
                                <dd className="govuk-summary-list__value">
                                    <div className="dft-flex dft-flex-justify-space-between">
                                        {element.content.map((item) => {
                                            return (
                                                <span key={item} id={element.id || undefined}>
                                                    {item}
                                                </span>
                                            );
                                        })}
                                        {serviceId && isSingle && (
                                            <form>
                                                {generateReturnPopupOpen && lineId && (
                                                    <GenerateReturnPopup
                                                        cancelActionHandler={generateReturnCancelActionHandler}
                                                        isOpen={generateReturnPopupOpen && !!lineId}
                                                    />
                                                )}
                                                <button
                                                    className="govuk-link govuk-body align-top button-link govuk-!-margin-left-2 govuk-!-margin-bottom-0"
                                                    formAction={createGenerateReturnUrl(
                                                        lineId,
                                                        passengerTypeId.toString(),
                                                        serviceId,
                                                        productId,
                                                        csrfToken,
                                                    )}
                                                    formMethod="post"
                                                    type="submit"
                                                    id="generate-return-button"
                                                >
                                                    Generate return from singles
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    );
                } else {
                    return (
                        <dl className="govuk-summary-list" key={element.name}>
                            <div className="govuk-summary-list__row" key={element.name}>
                                <dt className="govuk-summary-list__key">{element.name}</dt>

                                <dd className="govuk-summary-list__value">
                                    {element.editLink ? getEditableValue(element) : getReadValue(element)}
                                </dd>
                            </div>
                        </dl>
                    );
                }
            })}

            {editNamePopupOpen && (
                <ProductNamePopup
                    cancelActionHandler={editNameCancelActionHandler}
                    defaultValue={productName}
                    productId={productId}
                    serviceId={serviceId}
                    csrfToken={csrfToken}
                    isOpen={editNamePopupOpen}
                />
            )}
        </TwoThirdsLayout>
    );
};

const getReadValue = (element: ProductDetailsElement) => {
    return element.content.map((item) => (
        <span key={item} id={element.id || undefined}>
            {item}
        </span>
    ));
};

const getEditableValue = (element: ProductDetailsElement) => {
    return (
        <div className="dft-flex dft-flex-justify-space-between">
            {element.content.map((item) => {
                return (
                    <span key={item} id={element.id || undefined}>
                        {item}
                    </span>
                );
            })}

            <a id={`${element.id}-link`} href={element.editLink}>
                {element.editLabel ? element.editLabel : 'Edit'}
            </a>
        </div>
    );
};

const createProductDetails = async (
    ticket: TicketWithIds,
    yourNoc: string,
    productNoc: string,
    servicesRequiringAttention: string[] | undefined,
    serviceId: string | string[] | undefined,
    ctx: NextPageContextWithSession,
    fareTriangleModified: string | undefined,
    dataSource: string,
    stage: string,
    isOwnProduct: boolean,
    matchingJsonLink: string,
): Promise<{
    productDetailsElements: ProductDetailsElement[];
    productName: string;
    startDate: string;
    endDate: string | undefined;
    requiresAttention: boolean;
}> => {
    const productDetailsElements: ProductDetailsElement[] = [];
    const isMultiOperatorExt = ticket.type === 'multiOperatorExt';

    productDetailsElements.push({
        name: 'Fare type',
        id: 'fare-type',
        content: [
            `${fareTypes[ticket.type]}${ticket.carnet ? ' (carnet)' : ''}${
                'termTime' in ticket && !!ticket.termTime ? ' (academic)' : ''
            }${'return' in ticket ? ' return' : ''}`,
        ],
    });

    if ('selectedServices' in ticket) {
        productDetailsElements.push(
            {
                id: 'selected-services',
                name:
                    'additionalNocs' in ticket || 'additionalOperators' in ticket
                        ? `${productNoc} services`
                        : 'Services',
                content: [ticket.selectedServices.map((service) => service.lineName).join(', ')],
                editLink: isOwnProduct ? '/serviceList' : '',
            },
            {
                id: 'exempt-stops',
                name: `${productNoc} exempt stops`,
                content: [
                    'exemptStops' in ticket
                        ? (ticket.exemptStops as Stop[]).map((stop) => `${stop.atcoCode} - ${stop.stopName}`).join(', ')
                        : 'None',
                ],
                editLink: isOwnProduct ? '/serviceList' : '',
            },
        );

        if ('return' in ticket) {
            productDetailsElements.push({
                id: 'flat-fare-return',
                name: 'Return ticket',
                content: ['Yes'],
                editLink: '',
            });
        }
    }

    let requiresAttention = false;

    if (serviceId) {
        if (typeof serviceId !== 'string') {
            throw new Error(`Expected string type for serviceId, received: ${serviceId}`);
        }

        const pointToPointService = await getServiceByNocAndId(productNoc, serviceId, dataSource);

        const additionalService =
            isReturnTicket(ticket) && ticket.additionalServices && ticket.additionalServices.length > 0
                ? await getServiceByNocAndId(productNoc, ticket.additionalServices[0].serviceId.toString(), dataSource)
                : undefined;

        productDetailsElements.push({
            id: 'services',
            name: 'Service',
            content: [
                `${pointToPointService.lineName} - ${pointToPointService.origin} to ${pointToPointService.destination}`,
            ],
            editLink:
                isOwnProduct && isReturnTicket(ticket) && !additionalService
                    ? `/returnService?selectedServiceId=${serviceId}`
                    : '',
            editLabel: isReturnTicket(ticket) && !additionalService ? 'Add service' : '',
        });

        if (additionalService) {
            productDetailsElements.push({
                id: 'additional-services',
                name: 'Additional Service(s)',
                content: [
                    additionalService
                        ? `${additionalService.lineName} - ${additionalService.origin} to ${additionalService.destination}`
                        : '',
                ],
            });
        }

        requiresAttention = servicesRequiringAttention?.includes(serviceId) ?? false;

        if ('journeyDirection' in ticket && ticket.journeyDirection) {
            const { inboundDirectionDescription, outboundDirectionDescription } =
                await getServiceDirectionDescriptionsByNocAndServiceIdAndDataSource(productNoc, serviceId, dataSource);

            productDetailsElements.push({
                id: 'journey-direction',
                name: 'Journey direction',
                content: [
                    `${sentenceCaseString(ticket.journeyDirection)} - ${
                        ticket.journeyDirection === 'inbound' || ticket.journeyDirection === 'clockwise'
                            ? inboundDirectionDescription
                            : outboundDirectionDescription
                    }`,
                ],
            });
        }
    }

    if (isGeoZoneTicket(ticket)) {
        productDetailsElements.push({
            id: 'zone',
            name: 'Zone',
            content: [ticket.zoneName],
            editLink: isOwnProduct ? '/csvZoneUpload' : '',
        });
        productDetailsElements.push({
            id: 'stops',
            name: isMultiOperatorExt ? `${productNoc} number of stops` : 'Number of stops',
            content: [ticket.stops.length.toString()],
            editLink: isOwnProduct ? '/csvZoneUpload' : '',
        });
        productDetailsElements.push({
            id: 'exempted-services',
            name: isMultiOperatorExt ? `${productNoc} exempt services` : 'Exempt services',
            content:
                ticket.exemptedServices && ticket.exemptedServices.length > 0
                    ? [ticket.exemptedServices.map((service) => service.lineName).join(', ')]
                    : ['None'],
            editLink: isOwnProduct ? '/csvZoneUpload' : '',
        });
    }

    const passengerTypeName = await getPassengerTypeNameByIdAndNoc(ticket.passengerType.id, productNoc);

    productDetailsElements.push({
        id: 'passenger-type',
        name: 'Passenger type',
        content: [passengerTypeName],
        editLink: isOwnProduct ? '/selectPassengerType' : '',
    });

    const isSchoolTicket = 'termTime' in ticket && ticket.termTime;

    if (!isSchoolTicket) {
        const timeRestriction = ticket.timeRestriction
            ? (await getTimeRestrictionByIdAndNoc(ticket.timeRestriction.id, productNoc)).name
            : 'N/A';

        productDetailsElements.push({
            id: 'time-restriction',
            name: 'Time restriction',
            content: [timeRestriction],
            editLink: isOwnProduct ? '/selectTimeRestrictions' : '',
        });
    } else {
        productDetailsElements.push({ id: 'time-restriction', name: 'Only valid during term time', content: ['Yes'] });
    }

    const hasCaps = (await getCaps(productNoc)).length > 0;

    if (fareTypeIsAllowedToAddACap(ticket.type) && hasCaps && !ticket.carnet) {
        let capContent = 'N/A';
        if ('caps' in ticket && ticket.caps) {
            const caps = await Promise.all(
                (ticket.caps as (Cap & { id: number })[]).map(async (c) => await getCapByNocAndId(productNoc, c.id)),
            );

            capContent =
                caps && caps.length > 0
                    ? caps
                          .map((cap) => `${sentenceCaseString(cap?.capDetails.name || '')} - £${cap?.capDetails.price}`)
                          .join(', ')
                    : 'N/A';
        }

        productDetailsElements.push({
            id: 'caps',
            name: 'Caps',
            content: [capContent],
            editLink: isOwnProduct ? '/selectCaps' : '',
        });
    }

    // check to see if we have a point to point product
    if ('lineId' in ticket) {
        productDetailsElements.push({
            id: 'fare-triangle',
            name: 'Fare triangle',
            content: [
                fareTriangleModified
                    ? `Updated: ${convertDateFormat(fareTriangleModified)}`
                    : 'You created a fare triangle',
            ],
            editLink: isOwnProduct ? '/csvUpload' : '',
        });

        if (isReturnTicket(ticket)) {
            let outboundStopCounter = 0;

            ticket.outboundFareZones.forEach((stage) => {
                outboundStopCounter = outboundStopCounter + stage.stops.length;
            });

            productDetailsElements.push({
                id: 'outbound-fare-stage-matching',
                name: 'Outbound fare stages and stops',
                content: [`${outboundStopCounter} bus stops across ${ticket.outboundFareZones.length} fare stages`],
                editLink: isOwnProduct ? '/editFareStageMatching' : '',
            });

            let inboundStopCounter = 0;

            ticket.inboundFareZones.forEach((stage) => {
                inboundStopCounter = inboundStopCounter + stage.stops.length;
            });

            productDetailsElements.push({
                id: 'inbound-fare-stage-matching',
                name: 'Inbound fare stages and stops',
                content: [`${inboundStopCounter} bus stops across ${ticket.inboundFareZones.length} fare stages`],
                editLink: isOwnProduct ? '/editFareStageMatching' : '',
            });
        } else if (ticket.type === 'single') {
            let stopCounter = 0;

            ticket.fareZones.forEach((stage) => {
                stopCounter = stopCounter + stage.stops.length;
            });

            productDetailsElements.push({
                id: 'fare-stage-matching',
                name: 'Fare stages and stops',
                content: [`${stopCounter} bus stops across ${ticket.fareZones.length} fare stages`],
                editLink: isOwnProduct ? '/editFareStageMatching' : '',
            });
        }
    }

    if ('additionalNocs' in ticket) {
        if (isMultiOperatorExt) {
            for await (const additionalNoc of ticket.additionalNocs) {
                let stopsCount = 0;
                let exemptedServices: string[] = [];

                const additionalNocMatchingJsonLink = getAdditionalNocMatchingJsonLink(matchingJsonLink, additionalNoc);

                try {
                    const secondaryOperatorFareInfo =
                        await getProductsSecondaryOperatorInfo(additionalNocMatchingJsonLink);

                    if ('stops' in secondaryOperatorFareInfo) {
                        stopsCount = secondaryOperatorFareInfo.stops.length;
                    }

                    if ('exemptedServices' in secondaryOperatorFareInfo && secondaryOperatorFareInfo.exemptedServices) {
                        exemptedServices = secondaryOperatorFareInfo.exemptedServices.map(({ lineName }) => lineName);
                    }
                } catch (error) {
                    logger.warn(`Couldn't get additional operator info for noc: ${additionalNoc}`);
                }

                productDetailsElements.push({
                    id: 'stops',
                    name: `${additionalNoc} number of stops`,
                    content: [stopsCount.toString()],
                    editLink: additionalNoc === yourNoc ? '/csvZoneUpload' : '',
                });
                productDetailsElements.push({
                    id: 'exempted-services',
                    name: `${additionalNoc} exempt services`,
                    content: [exemptedServices.length > 0 ? exemptedServices.join(', ') : 'None'],
                    editLink: additionalNoc === yourNoc ? '/csvZoneUpload' : '',
                });
            }
        } else {
            productDetailsElements.push({
                id: 'multi-operator-group',
                name: `Multi Operator Group`,
                content: [ticket.additionalNocs.join(', ')],
                editLink: !('schemeOperatorName' in ticket) && isOwnProduct ? '/reuseOperatorGroup' : '',
            });
        }
    }

    if ('additionalOperators' in ticket) {
        for await (const additionalOperator of ticket.additionalOperators) {
            if (isMultiOperatorExt) {
                let selectedServices: string[] = [];
                let exemptStops: string[] = [];

                const additionalNocMatchingJsonLink = getAdditionalNocMatchingJsonLink(
                    matchingJsonLink,
                    additionalOperator.nocCode,
                );

                try {
                    const secondaryOperatorFareInfo =
                        await getProductsSecondaryOperatorInfo(additionalNocMatchingJsonLink);

                    if ('selectedServices' in secondaryOperatorFareInfo) {
                        selectedServices = secondaryOperatorFareInfo.selectedServices.map(({ lineName }) => lineName);
                    }

                    if ('exemptStops' in secondaryOperatorFareInfo && secondaryOperatorFareInfo.exemptStops) {
                        exemptStops = secondaryOperatorFareInfo.exemptStops.map(
                            (stop) => `${stop.atcoCode} - ${stop.stopName}`,
                        );
                    }
                } catch (error) {
                    logger.warn(`Couldn't get additional operator info for noc: ${additionalOperator.nocCode}`);
                }

                productDetailsElements.push({
                    id: 'additional-operators-services',
                    name: `${additionalOperator.nocCode} services`,
                    content: [selectedServices.length > 0 ? selectedServices.join(', ') : 'None'],
                    editLink:
                        additionalOperator.nocCode === yourNoc
                            ? '/serviceList'
                            : isOwnProduct
                              ? `/serviceList?editAdditionalOperator=${additionalOperator.nocCode}`
                              : '',
                });
                productDetailsElements.push({
                    id: 'exempt-stops',
                    name: `${additionalOperator.nocCode} exempt stops`,
                    content: [exemptStops.length > 0 ? exemptStops.join(', ') : 'None'],
                    editLink:
                        additionalOperator.nocCode === yourNoc
                            ? '/serviceList'
                            : isOwnProduct
                              ? `/serviceList?editAdditionalOperator=${additionalOperator.nocCode}`
                              : '',
                });
            } else {
                productDetailsElements.push({
                    id: 'additional-operators-services',
                    name: `${additionalOperator.nocCode} services`,
                    content: [additionalOperator.selectedServices.map(({ lineName }) => lineName).join(', ')],
                    editLink: '/multiOperatorServiceList',
                });
            }
        }
    }

    const product = ticket.products[0];

    if ('carnetDetails' in product && product.carnetDetails) {
        productDetailsElements.push({
            id: 'quantity-in-bundle',
            name: 'Quantity in bundle',
            content: [product.carnetDetails.quantity],
            editLink: isOwnProduct ? '/editCarnetProperties' : '',
        });

        productDetailsElements.push({
            id: 'carnet-expiry',
            name: 'Carnet expiry',
            content: [
                product.carnetDetails.expiryUnit === 'no expiry'
                    ? 'No expiry'
                    : `${product.carnetDetails.expiryTime} ${product.carnetDetails.expiryUnit}(s)`,
            ],
            editLink: isOwnProduct ? '/editCarnetProperties' : '',
        });
    }

    if (ticket.type === 'return') {
        const content =
            'returnPeriodValidity' in ticket && ticket.returnPeriodValidity
                ? `${ticket.returnPeriodValidity.amount} ${ticket.returnPeriodValidity.typeOfDuration}(s)`
                : 'N/A';

        productDetailsElements.push({
            id: 'return-ticket-validity',
            name: 'Return ticket validity',
            content: [content],
            editLink: isOwnProduct ? '/returnValidity' : '',
        });
    }

    if ('productDuration' in product) {
        productDetailsElements.push({
            id: 'period-duration',
            name: 'Period duration',
            content: [product.productDuration],
            editLink: isOwnProduct ? '/editPeriodDuration' : '',
        });
    }

    if ('productValidity' in product && product.productValidity) {
        productDetailsElements.push({
            id: 'product-expiry',
            name: 'Product expiry',
            content: [sentenceCaseString(product.productValidity)],
            editLink: isOwnProduct ? '/selectPeriodValidity' : '',
        });
    }

    if ('pricingByDistance' in product && product.pricingByDistance && stage === 'dev') {
        const { pricingByDistance } = product;

        productDetailsElements.push({
            id: 'pricing-by-distance-price',
            name: 'Prices',
            content: [
                `Min price - £${pricingByDistance.minimumPrice}`,
                `Max price - £${pricingByDistance.maximumPrice}`,
            ],
            editLink: isOwnProduct ? '/definePricingPerDistance' : '',
        });

        pricingByDistance.distanceBands.forEach((capDistance, index) => {
            productDetailsElements.push({
                name: `Distance band ${index + 1}`,
                content: [
                    `${capDistance.distanceFrom} km  - ${
                        index === pricingByDistance.distanceBands.length - 1
                            ? 'End of journey'
                            : `${capDistance.distanceTo} km`
                    }, Price - £${capDistance.pricePerKm} per km`,
                ],
                editLink: isOwnProduct ? '/definePricingPerDistance' : '',
                id: `pricing-by-distance-band-${index}`,
            });
        });
    }

    productDetailsElements.push({
        id: 'purchase-methods',
        name: 'Purchase methods',
        content: await Promise.all(
            product.salesOfferPackages.map(async (sop) => {
                const fullSop = await getSalesOfferPackageByIdAndNoc(sop.id, productNoc);

                let content = fullSop.name;

                if (sop.price) {
                    content = `${fullSop.name} - £${sop.price}`;
                }

                return content;
            }),
        ),
        editLink: isOwnProduct ? '/selectPurchaseMethods' : '',
    });

    const startDate = convertDateFormat(ticket.ticketPeriod.startDate);

    const endDate = ticket.ticketPeriod.endDate ? convertDateFormat(ticket.ticketPeriod.endDate) : undefined;
    const startDateParts = startDate.split('/');
    const endDateParts = endDate ? endDate.split('/') : [];
    const dates: ProductDateInformation = {
        startDateDay: startDateParts[0],
        startDateMonth: startDateParts[1],
        startDateYear: startDateParts[2],
        ...(endDateParts.length > 0
            ? {
                  endDateDay: endDateParts[0],
                  endDateMonth: endDateParts[1],
                  endDateYear: endDateParts[2],
              }
            : {
                  endDateDay: '',
                  endDateMonth: '',
                  endDateYear: '',
              }),
    };
    updateSessionAttribute(ctx.req, PRODUCT_DATE_ATTRIBUTE, { dates, errors: [] });

    productDetailsElements.push({
        id: 'start-date',
        name: 'Start date',
        content: [startDate],
        editLink: isOwnProduct ? '/productDateInformation' : '',
    });

    productDetailsElements.push({
        id: 'end-date',
        name: 'End date',
        content: [endDate ?? '-'],
        editLink: isOwnProduct ? '/productDateInformation' : '',
    });

    const productName =
        'productName' in product
            ? product.productName
            : isSchoolTicket
              ? `${passengerTypeName} - ${fareTypes[ticket.type]} (school)`
              : `${passengerTypeName} - ${fareTypes[ticket.type]}`;

    return {
        productDetailsElements,
        productName,
        startDate,
        endDate,
        requiresAttention,
    };
};

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: ProductDetailsProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const yourNoc = getAndValidateNoc(ctx);

    const serviceId = ctx.query?.serviceId;
    const productId = ctx.query?.productId;
    const copiedProduct = ctx.query?.copied === 'true';
    const cannotGenerateReturn = ctx.query?.generateReturn === 'false';
    if (typeof productId !== 'string') {
        throw new Error(`Expected string type for productID, received: ${productId}`);
    }

    let product: MyFaresProduct;

    try {
        product = await getProductById(yourNoc, productId);
    } catch (error) {
        if (error instanceof MultipleResultsError) {
            product = await getProductByIdAndAdditionalNoc(yourNoc, productId);
        } else {
            throw error;
        }
    }

    const { nocCode: noc, matchingJsonLink, servicesRequiringAttention, fareTriangleModified } = product;

    const isOwnProduct = noc === yourNoc;

    const ticket = await getProductsMatchingJson(matchingJsonLink);

    // store the ticket in the session so that it can be retrieved
    // on the edit pages.
    updateSessionAttribute(ctx.req, MATCHING_JSON_ATTRIBUTE, ticket);

    updateSessionAttribute(ctx.req, MATCHING_JSON_META_DATA_ATTRIBUTE, {
        productId,
        ...(typeof serviceId === 'string' && { serviceId }),
        matchingJsonLink,
    });

    const dataSource = !!getSessionAttribute(ctx.req, MULTI_MODAL_ATTRIBUTE) ? 'tnds' : 'bods';

    const productDetails = await createProductDetails(
        ticket,
        yourNoc,
        noc,
        servicesRequiringAttention,
        serviceId,
        ctx,
        fareTriangleModified,
        dataSource,
        STAGE,
        isOwnProduct,
        matchingJsonLink,
    );

    const backHref = serviceId
        ? `/products/pointToPointProducts?serviceId=${serviceId}`
        : ticket.type === 'multiOperator'
          ? '/products/multiOperatorProducts'
          : ticket.type === 'multiOperatorExt'
            ? '/products/multiOperatorProductsExternal'
            : '/products/otherProducts';

    const lineId =
        typeof serviceId === 'string'
            ? (await getServiceByIdAndDataSource(noc, Number(serviceId), dataSource)).lineId
            : '';

    return {
        props: {
            backHref,
            productName: productDetails.productName,
            startDate: productDetails.startDate,
            ...(productDetails.endDate && { endDate: productDetails.endDate }),
            productDetailsElements: productDetails.productDetailsElements,
            requiresAttention: productDetails.requiresAttention,
            productId,
            serviceId: typeof serviceId === 'string' ? serviceId : '',
            lineId,
            copiedProduct,
            passengerTypeId: ticket.passengerType.id,
            isSingle: ticket.type === 'single',
            cannotGenerateReturn,
            csrfToken,
            fareTriangleModified,
            isOwnProduct,
            incomplete: product.incomplete,
        },
    };
};

export default ProductDetails;
