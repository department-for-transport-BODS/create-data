import isArray from 'lodash/isArray';
import upperFirst from 'lodash/upperFirst';
import { ReactElement } from 'react';
import logger from '../utils/logger';
import ConfirmationTable from '../components/ConfirmationTable';
import CsrfForm from '../components/CsrfForm';
import {
    FARE_TYPE_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    CARNET_PRODUCT_DETAILS_ATTRIBUTE,
    RETURN_VALIDITY_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
    POINT_TO_POINT_PRODUCT_ATTRIBUTE,
    CSV_ZONE_FILE_NAME,
    DIRECTION_ATTRIBUTE,
    PRICING_PER_DISTANCE_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
    STOPS_EXEMPTION_ATTRIBUTE,
} from '../constants/attributes';
import {
    ConfirmationElement,
    FareType,
    MultipleOperatorsAttribute,
    MultipleProductAttribute,
    MultiProduct,
    NextPageContextWithSession,
    Service,
    ServiceListAttribute,
    TicketRepresentationAttribute,
    TxcSourceAttribute,
} from '../interfaces';
import { InboundMatchingInfo, MatchingFareZones, MatchingInfo } from '../interfaces/matchingInterface';
import { isExemptStopsAttributeWithErrors, isFareType, isPeriodExpiry, isWithErrors } from '../interfaces/typeGuards';
import TwoThirdsLayout from '../layout/Layout';
import { getCsrfToken, sentenceCaseString, isSchemeOperator } from '../utils';
import { getSessionAttribute, updateSessionAttribute, getRequiredSessionAttribute } from '../utils/sessions';
import {
    CarnetDetails,
    CarnetExpiryUnit,
    ReturnPeriodValidity,
    PointToPointPeriodProduct,
    Product,
    AdditionalOperator,
} from '../interfaces/matchingJsonTypes';

const title = 'Ticket Confirmation - Create Fares Data Service';
const description = 'Ticket Confirmation page of the Create Fares Data Service';

export interface TicketConfirmationProps {
    confirmationElements: ConfirmationElement[];
    csrfToken: string;
}

export interface MatchedFareStages {
    fareStage: string;
    stops: string[];
}

export const buildMatchedFareStages = (matchingFareZones: MatchingFareZones): MatchedFareStages[] => {
    const matchedFareStages: MatchedFareStages[] = [];
    const entries = Object.entries(matchingFareZones);
    entries.forEach((entry) => {
        if (entry[0] !== 'undefined') {
            const stopList = entry[1].stops;
            const stops: string[] = stopList.map((stop) => stop.stopName);
            matchedFareStages.push({ fareStage: entry[1].name, stops });
        }
    });
    return matchedFareStages;
};

const getCarnetDetailsContent = (carnetDetails?: CarnetDetails): string[] => {
    if (!carnetDetails) {
        return [];
    }

    const carnetExpiry =
        carnetDetails.expiryUnit === CarnetExpiryUnit.NO_EXPIRY
            ? upperFirst(CarnetExpiryUnit.NO_EXPIRY)
            : `${carnetDetails.expiryTime} ${upperFirst(carnetDetails.expiryUnit)}s`;

    return [`Quantity in bundle - ${carnetDetails.quantity}`, `Bundle expiry - ${carnetExpiry}`];
};

export const buildSingleTicketConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [];
    const { service } = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE) as Service;
    const matchedFareStages: MatchedFareStages[] = buildMatchedFareStages(
        (getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE) as MatchingInfo).matchingFareZones,
    );
    const dataSource = (getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE) as TxcSourceAttribute).source;

    confirmationElements.push(
        {
            name: 'Service',
            content: `${service.split('#')[0]}`,
            href: 'service',
        },
        {
            name: 'TransXChange source',
            content: dataSource.toUpperCase(),
            href: 'service',
        },
        {
            name: 'Fare triangle',
            content: 'You submitted or created a fare triangle',
            href: 'inputMethod',
        },
    );
    matchedFareStages.forEach((fareStage) => {
        confirmationElements.push({
            name: `Fare stage - ${fareStage.fareStage}`,
            content: `Stops - ${fareStage.stops.map((stop) => upperFirst(stop)).join(', ')}`,
            href: 'matching',
        });
    });

    const carnetProductInfo = getSessionAttribute(ctx.req, CARNET_PRODUCT_DETAILS_ATTRIBUTE);

    if (carnetProductInfo) {
        confirmationElements.push({
            name: `${carnetProductInfo.productName}`,
            content: getCarnetDetailsContent(carnetProductInfo.carnetDetails),
            href: 'carnetProductDetails',
        });
    }

    return confirmationElements;
};

export const buildReturnTicketConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [];

    const { service } = getSessionAttribute(ctx.req, SERVICE_ATTRIBUTE) as Service;
    const validity = getSessionAttribute(ctx.req, RETURN_VALIDITY_ATTRIBUTE) as ReturnPeriodValidity;

    const dataSource = (getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE) as TxcSourceAttribute).source;

    confirmationElements.push(
        {
            name: 'Service',
            content: service.split('#')[0],
            href: 'service',
        },
        {
            name: 'TransXChange source',
            content: dataSource.toUpperCase(),
            href: 'service',
        },
    );

    const direction = getRequiredSessionAttribute(ctx.req, DIRECTION_ATTRIBUTE);
    if (!('direction' in direction)) {
        throw new Error(`direction attribute is incorrect ${direction}`);
    }

    if (direction.inboundDirection) {
        const outboundMatchingFareZones = (getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE) as MatchingInfo)
            .matchingFareZones;
        const { inboundMatchingFareZones } = getSessionAttribute(
            ctx.req,
            INBOUND_MATCHING_ATTRIBUTE,
        ) as InboundMatchingInfo;

        const outboundMatchedFareStages = buildMatchedFareStages(outboundMatchingFareZones);
        const inboundMatchedFareStages = buildMatchedFareStages(inboundMatchingFareZones);

        outboundMatchedFareStages.forEach((fareStage) => {
            confirmationElements.push({
                name: `Outbound fare stage - ${fareStage.fareStage}`,
                content: `Stops - ${fareStage.stops.map((stop) => upperFirst(stop)).join(', ')}`,
                href: 'outboundMatching',
            });
        });
        inboundMatchedFareStages.forEach((fareStage) => {
            confirmationElements.push({
                name: `Inbound fare stage - ${fareStage.fareStage}`,
                content: `Stops - ${fareStage.stops.map((stop) => upperFirst(stop)).join(', ')}`,
                href: 'inboundMatching',
            });
        });
    } else {
        const nonCircularMatchedFareStages = buildMatchedFareStages(
            (getSessionAttribute(ctx.req, MATCHING_ATTRIBUTE) as MatchingInfo).matchingFareZones,
        );

        nonCircularMatchedFareStages.forEach((fareStage) => {
            confirmationElements.push({
                name: `Fare stage - ${fareStage.fareStage}`,
                content: `Stops - ${fareStage.stops.map((stop) => upperFirst(stop)).join(', ')}`,
                href: 'matching',
            });
        });
    }

    const carnetProductInfo = getSessionAttribute(ctx.req, CARNET_PRODUCT_DETAILS_ATTRIBUTE);

    if (carnetProductInfo) {
        confirmationElements.push({
            name: `${carnetProductInfo.productName}`,
            href: 'carnetProductDetails',
            content: getCarnetDetailsContent(carnetProductInfo.carnetDetails),
        });
    }

    if (validity) {
        confirmationElements.push({
            name: 'Return validity',
            content: `${validity.amount} ${validity.typeOfDuration}`,
            href: 'returnValidity',
        });
    }

    return confirmationElements;
};

export const buildPointToPointPeriodConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const confirmationElements = buildReturnTicketConfirmationElements(ctx);
    const product = getSessionAttribute(ctx.req, POINT_TO_POINT_PRODUCT_ATTRIBUTE);
    if (!product || isWithErrors(product)) {
        throw new Error('Product is not present or contains errors');
    }

    const periodExpiryAttribute = getSessionAttribute(ctx.req, PERIOD_EXPIRY_ATTRIBUTE);
    if (!periodExpiryAttribute || !isPeriodExpiry(periodExpiryAttribute)) {
        throw new Error('Period expiry is not present or contains errors');
    }
    addProductDetails(product, confirmationElements, true);

    return confirmationElements;
};

export const buildFlatFarePriceByDistanceConfirmationElements = (
    ctx: NextPageContextWithSession,
): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [];
    const serviceInformation = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE) as ServiceListAttribute;
    const services = serviceInformation.selectedServices;
    const pricePerDistance = getSessionAttribute(ctx.req, PRICING_PER_DISTANCE_ATTRIBUTE);
    const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
    const opName = operatorAttribute?.name ? `${operatorAttribute.name} ` : '';
    const dataSource = (getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE) as TxcSourceAttribute).source;
    const exemptStopsAttribute = getSessionAttribute(ctx.req, STOPS_EXEMPTION_ATTRIBUTE);

    confirmationElements.push(
        {
            name: `${opName}${opName ? 's' : 'S'}ervices`,
            content: services.map((service) => service.lineName).join(', '),
            href: 'serviceList',
        },
        {
            name: 'TransXChange source',
            content: dataSource.toUpperCase(),
            href: 'serviceList',
        },
        {
            name: 'Exempt stops',
            content:
                exemptStopsAttribute && !isExemptStopsAttributeWithErrors(exemptStopsAttribute)
                    ? exemptStopsAttribute.exemptStops.map((stop) => `${stop.atcoCode} - ${stop.stopName}`).join(', ')
                    : 'N/A',
            href: 'serviceList',
        },
    );

    let distancePricingContents: string[] = [];

    const distanceBands: string[] = [];

    if (pricePerDistance && !isWithErrors(pricePerDistance)) {
        distancePricingContents = [
            `Min price - £${pricePerDistance.minimumPrice}`,
            `Max price - £${pricePerDistance.maximumPrice}`,
        ];

        pricePerDistance.distanceBands.forEach((capDistance, index) => {
            distanceBands.push(
                `${capDistance.distanceFrom} km  - ${
                    index === pricePerDistance.distanceBands.length - 1
                        ? 'End of journey'
                        : `${capDistance.distanceTo} km`
                }, Price - £${capDistance.pricePerKm} per km`,
            );
        });
    }

    if (distancePricingContents.length > 0) {
        confirmationElements.push({
            name: 'Prices',
            content: distancePricingContents,
            href: '/definePricingPerDistance',
        });
    }

    if (distanceBands.length > 0) {
        distanceBands.forEach((distanceBandContent, index) => {
            confirmationElements.push({
                name: `Distance band ${index + 1}`,
                content: distanceBandContent,
                href: '/definePricingPerDistance',
            });
        });
    }

    return confirmationElements;
};

export const addProductDetails = (
    product: Product | MultiProduct | PointToPointPeriodProduct,
    confirmationElements: ConfirmationElement[],
    isPointToPointProduct: boolean,
): void => {
    const content = [];
    if ('productPrice' in product) {
        content.push(`Price - £${product.productPrice}`);
    }

    if (product.productDuration) {
        const productDurationText = product.productDurationUnits
            ? `${product.productDuration} ${product.productDurationUnits}${product.productDuration === '1' ? '' : 's'}`
            : `${product.productDuration}`;
        content.push(`Duration - ${productDurationText}`);
    }

    if ('carnetDetails' in product) {
        content.push(...getCarnetDetailsContent(product.carnetDetails));
    }

    confirmationElements.push({
        name: `${product.productName}`,
        content,
        href: isPointToPointProduct ? 'pointToPointPeriodProduct' : 'multipleProducts',
    });
};

export const buildPeriodOrMultiOpTicketConfirmationElements = (
    ctx: NextPageContextWithSession,
): ConfirmationElement[] => {
    const confirmationElements: ConfirmationElement[] = [];

    const ticketRepresentation = (
        getSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE) as TicketRepresentationAttribute
    ).name;
    const serviceInformation = getSessionAttribute(ctx.req, SERVICE_LIST_ATTRIBUTE) as ServiceListAttribute;
    const multiOpAttribute = getSessionAttribute(ctx.req, MULTIPLE_OPERATOR_ATTRIBUTE) as MultipleOperatorsAttribute;
    const { fareType } = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE) as FareType;
    const multiOpServices = getSessionAttribute(ctx.req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE) as AdditionalOperator[];
    const fileName = getSessionAttribute(ctx.req, CSV_ZONE_FILE_NAME);
    const exemptedServiceAttribute = getSessionAttribute(
        ctx.req,
        SERVICE_LIST_EXEMPTION_ATTRIBUTE,
    ) as ServiceListAttribute;
    const services = serviceInformation ? serviceInformation.selectedServices : [];
    const zone = ticketRepresentation === 'geoZone' || ticketRepresentation === 'geoZoneFlatFareMultiOperator';
    const hybrid = ticketRepresentation === 'hybrid';
    const pointToPointPeriod = ticketRepresentation === 'pointToPointPeriod';

    if (zone || hybrid) {
        confirmationElements.push(
            {
                name: 'Zone',
                content: `You uploaded a fare zone CSV file${!!fileName ? ` named: ${fileName}` : '.'}`,
                href: 'csvZoneUpload',
            },
            {
                name: `Exempt services`,
                content:
                    exemptedServiceAttribute && exemptedServiceAttribute.selectedServices.length > 0
                        ? `${exemptedServiceAttribute.selectedServices.map((service) => service.lineName).join(', ')}`
                        : 'N/A',
                href: 'csvZoneUpload',
            },
        );
    }

    if (!pointToPointPeriod && (!zone || hybrid) && !isSchemeOperator(ctx)) {
        const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
        const opName = operatorAttribute?.name ? `${operatorAttribute.name} ` : '';
        const dataSource = (getSessionAttribute(ctx.req, TXC_SOURCE_ATTRIBUTE) as TxcSourceAttribute).source;
        const exemptStopsAttribute = getSessionAttribute(ctx.req, STOPS_EXEMPTION_ATTRIBUTE);

        confirmationElements.push(
            {
                name: `${opName}${opName ? 's' : 'S'}ervices`,
                content: `${services.map((service) => service.lineName).join(', ')}`,
                href: 'serviceList',
            },
            {
                name: 'TransXChange source',
                content: dataSource.toUpperCase(),
                href: 'serviceList',
            },
            {
                name: 'Exempt stops',
                content:
                    exemptStopsAttribute && !isExemptStopsAttributeWithErrors(exemptStopsAttribute)
                        ? exemptStopsAttribute.exemptStops
                              .map((stop) => `${stop.atcoCode} - ${stop.stopName}`)
                              .join(', ')
                        : 'N/A',
                href: 'serviceList',
            },
        );
    }

    if (multiOpAttribute && fareType === 'multiOperator') {
        const additionalOperators = multiOpAttribute.selectedOperators;
        confirmationElements.push({
            name: 'Additional operators',
            content: `${additionalOperators.map((operator) => operator.name).join(', ')}`,
            href: 'searchOperators',
        });

        if (!zone && multiOpServices) {
            multiOpServices.forEach((serviceInfo) => {
                confirmationElements.push({
                    name: `${
                        additionalOperators.find((operator) => operator.nocCode === serviceInfo.nocCode)?.name
                    } services`,
                    content: `${serviceInfo.selectedServices.map((service) => service.lineName).join(', ')}`,
                    href: 'searchOperators',
                });
            });
        }
    }

    const periodExpiryAttribute = getSessionAttribute(ctx.req, PERIOD_EXPIRY_ATTRIBUTE);

    if (!pointToPointPeriod) {
        const { products } = getSessionAttribute(ctx.req, MULTIPLE_PRODUCT_ATTRIBUTE) as MultipleProductAttribute;
        if (!products || isWithErrors(products)) {
            throw new Error('Multiple produect arrribute contains errors');
        }
        if (isArray(products)) {
            products.forEach((product) => {
                addProductDetails(product, confirmationElements, false);
            });
        } else if (!isArray(products)) {
            addProductDetails(products, confirmationElements, false);
        }
    } else {
        const product = getSessionAttribute(ctx.req, POINT_TO_POINT_PRODUCT_ATTRIBUTE);
        if (!product || isWithErrors(product)) {
            throw new Error('Product information for P2P period product could not be found.');
        }
        addProductDetails(product, confirmationElements, true);
    }

    if (periodExpiryAttribute && 'productValidity' in periodExpiryAttribute) {
        confirmationElements.push({
            name: `Ticket day end`,
            content: `${sentenceCaseString(periodExpiryAttribute.productValidity)}${
                periodExpiryAttribute.productEndTime ? ` - ${periodExpiryAttribute.productEndTime}` : ''
            }`,
            href: 'selectPeriodValidity',
        });
    }

    return confirmationElements;
};

export const buildFlatFareTicketConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const ticketRepresentationAttribute = getSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE);
    if (!ticketRepresentationAttribute) {
        // the default for flat fare is multiple services
        updateSessionAttribute(ctx.req, TICKET_REPRESENTATION_ATTRIBUTE, { name: 'multipleServices' });
    }

    return buildPeriodOrFlatFareConfirmationElements(ctx);
};

export const buildSchoolTicketConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const schoolFareTypeAttribute = getSessionAttribute(ctx.req, SCHOOL_FARE_TYPE_ATTRIBUTE);

    if (schoolFareTypeAttribute && schoolFareTypeAttribute.schoolFareType === 'period') {
        return buildPeriodOrFlatFareConfirmationElements(ctx);
    } else {
        throw new Error('Could not extract schoolFareType from the schoolFareTypeAttribute.');
    }
};

export const buildPeriodOrFlatFareConfirmationElements = (ctx: NextPageContextWithSession): ConfirmationElement[] => {
    const ticketRepresentationAttribute = getSessionAttribute(
        ctx.req,
        TICKET_REPRESENTATION_ATTRIBUTE,
    ) as TicketRepresentationAttribute;

    if (!ticketRepresentationAttribute || isWithErrors(ticketRepresentationAttribute)) {
        throw new Error('Could not find ticket representation for period ticket');
    }

    if (ticketRepresentationAttribute.name === 'pointToPointPeriod') {
        return buildPointToPointPeriodConfirmationElements(ctx);
    }

    if (ticketRepresentationAttribute.name === 'multipleServicesPricedByDistance') {
        return buildFlatFarePriceByDistanceConfirmationElements(ctx);
    }
    return buildPeriodOrMultiOpTicketConfirmationElements(ctx);
};

export const buildTicketConfirmationElements = (
    fareType: string,
    ctx: NextPageContextWithSession,
): ConfirmationElement[] => {
    let confirmationElements: ConfirmationElement[];
    switch (fareType) {
        case 'single':
            confirmationElements = buildSingleTicketConfirmationElements(ctx);
            break;
        case 'return':
            confirmationElements = buildReturnTicketConfirmationElements(ctx);
            break;
        case 'flatFare':
            confirmationElements = buildFlatFareTicketConfirmationElements(ctx);
            break;
        case 'multiOperator':
            confirmationElements = buildPeriodOrMultiOpTicketConfirmationElements(ctx);
            break;
        case 'multiOperatorExt':
            confirmationElements = buildPeriodOrMultiOpTicketConfirmationElements(ctx);
            break;
        case 'schoolService':
            confirmationElements = buildSchoolTicketConfirmationElements(ctx);
            break;
        case 'period':
            confirmationElements = buildPeriodOrFlatFareConfirmationElements(ctx);
            break;

        default:
            throw new Error('Did not receive an expected fareType.');
    }
    return confirmationElements;
};
const TicketConfirmation = ({ csrfToken, confirmationElements }: TicketConfirmationProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} errors={[]}>
        <CsrfForm action="/api/ticketConfirmation" method="post" csrfToken={csrfToken}>
            <>
                <h1 className="govuk-heading-l">Check your answers before sending your sales information</h1>
                <ConfirmationTable header="Sales Information" confirmationElements={confirmationElements} />
                <input type="submit" value="Continue" id="continue-button" className="govuk-button" />
            </>
        </CsrfForm>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: TicketConfirmationProps } => {
    const csrfToken = getCsrfToken(ctx);
    const fareTypeInfo = getSessionAttribute(ctx.req, FARE_TYPE_ATTRIBUTE);

    if (!isFareType(fareTypeInfo)) {
        logger.error('Did not receive an expected fareType.', { fareTypeInfo });
        throw new Error('Did not receive an expected fareType.');
    }

    return {
        props: {
            confirmationElements: buildTicketConfirmationElements(fareTypeInfo.fareType, ctx),
            csrfToken,
        },
    };
};

export default TicketConfirmation;
