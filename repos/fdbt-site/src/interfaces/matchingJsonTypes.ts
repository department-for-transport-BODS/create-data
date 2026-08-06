import { CapSelection, DistancePricingData } from './index';

export interface PointToPointCarnetProductDetails extends BaseProduct {
    productName: string;
    carnetDetails: CarnetDetails;
}

export type FlatFareGeoZoneTicket = Omit<PeriodGeoZoneTicket, 'products' | 'type'> & {
    type: 'flatFare';
    products: FlatFareProduct[];
    exemptedServices?: SelectedService[];
    caps?: CapSelection[];
};

export interface PeriodGeoZoneTicket extends BasePeriodTicket {
    zoneName: string;
    stops: Stop[];
    exemptedServices?: SelectedService[];
}

export interface BasePeriodTicket extends BaseTicket<'period' | 'multiOperator' | 'multiOperatorExt'> {
    operatorName: string;
    products: ProductDetails[];
    fareDayEnd?: string;
}

export interface SelectedService {
    lineName: string;
    lineId: string;
    serviceCode: string;
    startDate: string;
    serviceDescription: string;
}

export type AdditionalService = Omit<SelectedService, 'serviceCode' | 'startDate'> & {
    serviceId: number;
};

export interface PeriodMultipleServicesTicket extends BasePeriodTicket {
    selectedServices: SelectedService[];
    termTime: boolean;
    exemptStops?: Stop[];
}

export interface FlatFareProduct extends BaseProduct {
    productName: string;
    productPrice: string;
    carnetDetails?: CarnetDetails;
}

export interface PriceByDistanceProduct extends BaseProduct {
    productName: string;
    pricingByDistance: DistancePricingData;
}

export interface FlatFareMultipleServices extends BaseTicket<'flatFare'> {
    products: (PriceByDistanceProduct | FlatFareProduct)[];
    termTime: boolean;
    selectedServices: SelectedService[];
    operatorName: string;
    caps?: CapSelection[];
    exemptStops?: Stop[];
    return?: boolean;
}

export type FlatFareTicket = FlatFareGeoZoneTicket | FlatFareMultipleServices;

export interface SalesOfferPackage {
    id: number;
    name: string;
    description?: string;
    purchaseLocations: string[];
    paymentMethods: string[];
    ticketFormats: string[];
    price?: string;
    isCapped: boolean;
}

export type DayOfTheWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type CapStart = 'rollingDays' | 'fixedWeekdays';

export interface CapStartInfo {
    type: CapStart;
    startDay?: DayOfTheWeek;
}

export type FromDb<T> = T & { id: number };

export type TicketType =
    'flatFare' | 'period' | 'multiOperator' | 'multiOperatorExt' | 'schoolService' | 'single' | 'return';

export type Ticket =
    | PointToPointTicket
    | GeoZoneTicket
    | PeriodMultipleServicesTicket
    | FlatFareTicket
    | SchemeOperatorGeoZoneTicket
    | SchemeOperatorFlatFareTicket
    | SchemeOperatorMultiServiceTicket
    | MultiOperatorGeoZoneTicket
    | PointToPointPeriodTicket
    | PeriodHybridTicket;

export type TicketWithIds =
    | WithIds<SingleTicket>
    | WithIds<ReturnTicket>
    | WithIds<GeoZoneTicket>
    | WithIds<PeriodMultipleServicesTicket>
    | WithIds<FlatFareTicket>
    | WithIds<SchemeOperatorGeoZoneTicket>
    | WithIds<SchemeOperatorFlatFareTicket>
    | WithIds<SchemeOperatorMultiServiceTicket>
    | WithIds<MultiOperatorMultipleServicesTicket>
    | WithIds<MultiOperatorGeoZoneTicket>
    | WithIds<PointToPointPeriodTicket>
    | WithIds<PeriodHybridTicket>;

export type GeoZoneTicket = PeriodGeoZoneTicket | MultiOperatorGeoZoneTicket;

export interface PeriodHybridTicket extends PeriodGeoZoneTicket, PeriodMultipleServicesTicket {}

export interface SchemeOperatorGeoZoneTicket extends BaseSchemeOperatorTicket {
    zoneName: string;
    stops: Stop[];
    products: ProductDetails[];
    additionalNocs: string[];
}

export interface AdditionalOperator {
    nocCode: string;
    selectedServices: SelectedService[];
}

export interface SecondaryOperatorServices {
    selectedServices: SelectedService[];
    exemptStops?: Stop[];
}

export interface SecondaryOperatorFareZone {
    zoneName: string;
    stops: Stop[];
    exemptedServices?: SelectedService[];
}

export type SecondaryOperatorFareInfo = SecondaryOperatorServices | SecondaryOperatorFareZone;

export interface SchemeOperatorFlatFareTicket extends BaseSchemeOperatorTicket {
    type: 'flatFare';
    products: FlatFareProduct[];
    additionalOperators: AdditionalOperator[];
}

export interface SchemeOperatorMultiServiceTicket extends BaseSchemeOperatorTicket {
    type: 'period';
    products: ProductDetails[];
    additionalOperators: AdditionalOperator[];
}

export interface MultiOperatorGeoZoneTicket extends PeriodGeoZoneTicket {
    additionalNocs: string[];
    operatorGroupId: number;
}

export interface MultiOperatorMultipleServicesTicket extends PeriodMultipleServicesTicket {
    additionalOperators: AdditionalOperator[];
    operatorGroupId: number;
}

export interface BaseTicket<T extends TicketType = TicketType> {
    nocCode: string;
    type: T;
    passengerType: string;
    ageRange?: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proof?: string;
    proofDocuments?: string[];
    email: string;
    uuid: string;
    timeRestriction: FullTimeRestriction[];
    ticketPeriod: TicketPeriod;
    groupDefinition?: GroupDefinition;
    carnet?: boolean;
}

export type WithIds<T extends { products: BaseProduct[] }> = WithBaseIds<
    Omit<T, 'products'> & {
        products: (Omit<T['products'][0], 'salesOfferPackages'> & {
            salesOfferPackages: { id: number; price: string | undefined }[];
        })[];
    }
>;

export type WithBaseIds<T> = Omit<
    T,
    | 'passengerType'
    | 'ageRange'
    | 'ageRangeMin'
    | 'ageRangeMax'
    | 'proof'
    | 'proofDocuments'
    | 'timeRestriction'
    | 'fareDayEnd'
> & { passengerType: { id: number }; timeRestriction?: { id: number } };

export interface GroupDefinition {
    maxPeople: string;
    companions: CompanionInfo[];
}

export interface CompanionInfo {
    id: number;
    name?: string;
    passengerType: string;
    minNumber?: string;
    maxNumber: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proofDocuments?: string[];
}

export interface DbTimeBand {
    startTime: string;
    endTime: string | { fareDayEnd: boolean };
}

export interface UnassignedStop {
    atcoCode: string;
}

export interface UnassignedStops {
    singleUnassignedStops?: UnassignedStop[];
    outboundUnassignedStops?: UnassignedStop[];
    inboundUnassignedStops?: UnassignedStop[];
}

export interface BaseSchemeOperatorTicket extends Omit<BaseTicket, 'nocCode'> {
    schemeOperatorName: string;
    schemeOperatorRegionCode: string;
}

export type SchemeOperatorTicket =
    SchemeOperatorMultiServiceTicket | SchemeOperatorGeoZoneTicket | SchemeOperatorFlatFareTicket;

export interface BasePointToPointTicket extends BaseTicket {
    operatorName: string;
    lineName: string;
    lineId: string;
    serviceDescription: string;
    products: (BaseProduct | PointToPointCarnetProductDetails)[];
    unassignedStops: UnassignedStops;
    caps?: CapSelection[];
}

export type PointToPointTicket = SingleTicket | ReturnTicket;

export interface SingleTicket extends BasePointToPointTicket {
    type: 'single';
    fareZones: FareZone[];
    termTime: boolean;
    journeyDirection: string;
}

export interface MatchingJsonMetaData {
    productId: string;
    serviceId?: string;
    matchingJsonLink: string;
}

export interface ReturnTicket extends BasePointToPointTicket {
    type: 'return';
    inboundFareZones: FareZone[];
    outboundFareZones: FareZone[];
    returnPeriodValidity?: ReturnPeriodValidity;
    additionalServices?: AdditionalService[];
}

export interface Product {
    productName: string;
    productPrice?: string;
    productDuration?: string;
    productValidity?: string;
    productDurationUnits?: string;
    productEndTime?: string;
    carnetDetails?: CarnetDetails;
    pricingByDistance?: DistancePricingData;
}

export interface FlatFareByDistanceProduct {
    pricingByDistance: DistancePricingData;
}

export interface ProductDetails extends BaseProduct {
    productName: string;
    productPrice: string;
    productDuration: string;
    productValidity: string;
    carnetDetails?: CarnetDetails;
}

export interface PointToPointPeriodTicket extends Omit<ReturnTicket, 'products' | 'type'> {
    type: 'period';
    products: (PointToPointPeriodProduct & Product & BaseProduct)[];
    termTime: boolean;
}

export type TimeRestrictionDay =
    'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'bankHoliday';

export interface FullTimeRestriction {
    day: TimeRestrictionDay;
    timeBands: TimeBand[];
}

export interface TicketPeriod {
    startDate: string;
    endDate?: string;
}

export interface BaseProduct {
    salesOfferPackages: SalesOfferPackage[];
}

export interface CarnetProductInfo {
    productName: string;
    carnetDetails: CarnetDetails;
}

export interface PointToPointPeriodProduct {
    productName: string;
    productDuration: string;
    productDurationUnits: ExpiryUnit;
}

export interface PeriodExpiry {
    productValidity: string;
    productEndTime?: string;
}

export interface FareZone {
    name: string;
    stops: Stop[];
    prices: FareZonePrices[];
}

export interface FareZonePrices {
    price: string;
    fareZones: string[];
}

export interface CarnetDetails {
    quantity: string;
    expiryTime: string;
    expiryUnit: CarnetExpiryUnit;
}

export interface TimeBand {
    startTime: string;
    endTime: string;
}

export interface ReturnPeriodValidity {
    amount: string;
    typeOfDuration: string;
}

export enum CarnetExpiryUnit {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
    NO_EXPIRY = 'no expiry',
}

export enum ExpiryUnit {
    HOUR = 'hour',
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    YEAR = 'year',
    TERM = 'term',
}

export enum CapExpiryUnit {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
    TERM = 'term',
}

export type ProductValidity = 'endOfCalendarDay' | 'fareDayEnd';

export interface Stop {
    stopName: string;
    naptanCode: string;
    atcoCode: string;
    localityCode: string;
    localityName: string;
    parentLocalityName: string;
    qualifierName?: string;
    indicator?: string;
    street?: string;
}

export interface OperatorDetails {
    operatorName: string;
    contactNumber: string;
    email: string;
    url: string;
    street: string;
    town: string;
    county: string;
    postcode: string;
}
