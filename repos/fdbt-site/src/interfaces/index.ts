import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextPageContext } from 'next';
import { DocumentContext } from 'next/document';
import { ReactElement } from 'react';
import { Session as ExpressSession } from 'express-session';
import { DbTimeRestriction, SinglePassengerType } from './dbTypes';
import {
    CarnetDetails,
    SelectedService,
    PeriodGeoZoneTicket,
    PeriodMultipleServicesTicket,
    FullTimeRestriction,
    SalesOfferPackage,
    BaseProduct,
    Product,
    CompanionInfo,
    TicketType,
    ExpiryUnit,
    AdditionalOperator,
    Stop,
    CapExpiryUnit,
} from './matchingJsonTypes';

// Session Attributes and Cookies

export interface Session {
    session: ExpressSession;
}

export type NextApiRequestWithSession = NextApiRequest & Session;

export type NextPageContextWithSession = NextPageContext & {
    req: Session;
};

export type DocumentContextWithSession = DocumentContext & {
    req: Session;
};

export type ProductStatus = 'active' | 'pending' | 'expired' | 'incomplete';

export type IncomingMessageWithSession = IncomingMessage & Session;

export interface CookiePolicy {
    essential: boolean;
    usage: boolean;
}

export interface ProductInfo {
    productName: string;
    productPrice: string;
    carnetDetails?: CarnetDetails;
}

export interface ProductInfoWithErrors extends ProductInfo {
    errors: ErrorInfo[];
}

export interface DurationValidInfo {
    amount: string;
    duration: string;
    errors: ErrorInfo[];
}

export interface InputMethodInfo {
    inputMethod: string;
}

export interface Direction {
    direction: string;
    inboundDirection?: string;
}

export interface EditFareStageMatchingWithErrors {
    warning: boolean;
    errors: ErrorInfo[];
    selectedFareStages: { [key: string]: string };
}

export interface Errors {
    errors?: ErrorInfo[];
}

export interface TicketRepresentationAttribute {
    name:
        | 'geoZone'
        | 'multipleServices'
        | 'hybrid'
        | 'pointToPointPeriod'
        | 'multipleServicesPricedByDistance'
        | 'multipleServicesFlatFareMultiOperator'
        | 'geoZoneFlatFareMultiOperator';
}

export interface TicketRepresentationAttributeWithErrors {
    errors: ErrorInfo[];
}

export interface Operator {
    name: string;
    nocCode: string;
}

export interface OperatorGroup {
    name: string;
    operators: Operator[];
    id: number;
}

export interface MultiOperatorInfo {
    nocCode: string;
    services: ServiceWithOriginAndDestination[];
    selectedServices: ServiceWithOriginAndDestination[];
    name: string;
    dataSource: 'bods' | 'tnds';
}

export interface ServiceWithOriginAndDestination extends SelectedService {
    origin: string;
    destination: string;
}

export interface TermTimeAttribute {
    termTime: boolean;
}

export type WithErrors<T> = {
    errors: ErrorInfo[];
} & T;

export interface UserDataUploadsProps {
    csvUploadHintText: string;
    csvUploadTitle: string;
    errors: ErrorInfo[];
    detailSummary?: string;
    detailBody?: ReactElement;
    showPriceOption?: boolean;
    poundsOrPence?: string | null;
}

export interface NumberOfStagesAttributeWithError {
    errors: ErrorInfo[];
}

export interface FareStagesAttribute {
    fareStages: string;
}

export interface FareStagesAttributeWithErrors {
    errors: ErrorInfo[];
}

export interface CsvUploadAttributeWithErrors {
    errors: ErrorInfo[];
    poundsOrPence?: string;
}

export interface GroupTicketAttribute {
    maxGroupSize: string;
}

export interface GroupTicketAttributeWithErrors extends GroupTicketAttribute {
    errors: ErrorInfo[];
}

export interface NumberOfProductsAttribute {
    numberOfProducts: number;
}

export interface NumberOfProductsAttributeWithErrors {
    errors: ErrorInfo[];
}

export interface MultipleProductAttribute {
    products: MultiProduct[];
}

export interface MultipleProductAttributeWithErrors extends MultipleProductAttribute {
    errors: ErrorInfo[];
}

export type SchoolFareType = 'period' | '';
export interface SchoolFareTypeAttribute {
    schoolFareType: SchoolFareType;
}

export interface MultipleOperatorsAttribute {
    selectedOperators: Operator[];
    id?: number;
}

export interface MultipleOperatorsAttributeWithErrors extends MultipleOperatorsAttribute {
    errors: ErrorInfo[];
}

export interface ServiceListAttribute {
    selectedServices: SelectedService[];
}

export interface ExemptedStopsAttribute {
    exemptStops: Stop[];
}

export interface GlobalSettingsAttribute<T> {
    inputs: T;
    errors: ErrorInfo[];
}

// Miscellaneous

export interface SettingsOverview {
    href: string;
    name: string;
    description: string;
    count: number | boolean;
}

export interface GlobalSettingsCounts {
    capCount: number;
    passengerTypesCount: number;
    purchaseMethodsCount: number;
    timeRestrictionsCount: number;
    fareDayEndSet: boolean;
    operatorDetailsSet: boolean;
    operatorGroupsCount: number;
}

export interface PassengerAttributes {
    passengerTypeDisplay: string;
    passengerTypeValue: string;
}

export interface BaseReactElement {
    id: string;
    name: string;
    label: string;
    defaultValue?: string;
    defaultChecked?: boolean;
    options?: string[];
    disabled?: boolean;
}

export interface InputCheck {
    error: string;
    input: string;
    id: string;
}

export interface ErrorInfo {
    errorMessage: string;
    id: string;
    userInput?: string;
}

export interface Feedback {
    question: string;
    answer: string;
}

export interface PriceEntryError {
    input: string;
    locator: string;
}

export interface ResponseWithLocals extends ServerResponse {
    locals: {
        nonce: string;
        csrfToken: string;
    };
}

export interface PremadeTimeRestriction {
    id: number;
    name: string;
    contents: DbTimeRestriction[];
}

export interface PremadeCap {
    id: number;
    contents: Cap;
}

export interface DbTimeInput {
    timeInput: string | { fareDayEnd: boolean };
    day: string;
}

// AWS and Reference Data (e.g. NOC, TNDS, NaPTAN datasets)

export interface S3NetexFile {
    name: string;
    noc: string | undefined;
    reference: string;
    fareType: string;
    productNames?: string;
    passengerType: string;
    serviceNames?: string;
    lineName?: string;
    zoneName?: string;
    sopNames: string;
    date: string;
    signedUrl: string;
    fileSize: number;
    carnet: boolean;
}

/* eslint-disable camelcase */
export interface CognitoIdToken {
    sub: string;
    aud: string;
    email_verified: boolean;
    event_id: string;
    'custom:noc': string;
    token_use: string;
    auth_time: number;
    iss: string;
    'cognito:username': string;
    exp: number;
    iat: number;
    email: string;
    'custom:contactable': string;
    'custom:schemeOperator': string;
    'custom:schemeRegionCode': string;
    'custom:multiOpEmailEnabled': boolean;
}

export type PeriodTicket = PeriodGeoZoneTicket | PeriodMultipleServicesTicket;

export interface MultiOperatorMultipleServicesTicket extends PeriodMultipleServicesTicket {
    additionalOperators: {
        nocCode: string;
        selectedServices: SelectedService[];
    }[];
    operatorGroupId: number;
}

// Matching Data (created by the user on the site)

export interface PassengerDetails {
    passengerType: string;
    ageRangeMin?: string;
    ageRangeMax?: string;
    proofDocuments?: string[];
    email: string;
    uuid: string;
    timeRestriction: FullTimeRestriction[];
    ticketPeriod: TicketPeriodWithInput;
    proof?: string[];
}

export interface TimeRestriction {
    startTime?: string;
    endTime?: string;
    validDays: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | 'bankHoliday')[];
}

export interface ReturnPeriodValidityWithErrors {
    amount?: string;
    typeOfDuration?: string;
    errors: ErrorInfo[];
}

export interface FareZoneWithErrors {
    errors: ErrorInfo[];
}

export interface BasicService {
    lineName: string;
    lineId: string;
    nocCode: string;
    operatorShortName: string;
    serviceDescription: string;
}

export interface SalesOfferPackageInfo {
    purchaseLocations: string[];
    paymentMethods: string[];
    ticketFormats: string[];
    price?: string;
}

export interface SalesOfferPackageInfoWithErrors extends SalesOfferPackageInfo {
    errors: ErrorInfo[];
}

export interface SalesOfferPackageWithErrors extends SalesOfferPackage {
    errors: ErrorInfo[];
}

export interface TicketPeriod {
    startDate: string;
    endDate?: string;
}

export interface TicketPeriodWithInput extends TicketPeriod {
    dateInput: ProductDateInformation;
}

export interface ProductWithSalesOfferPackages extends BaseProduct {
    productName: string;
}

export interface ProductData {
    products: Product[];
}

export interface MultiOperatorInfoWithErrors {
    multiOperatorInfo: AdditionalOperator[];
    errors: ErrorInfo[];
}

export interface FullTimeRestrictionAttribute {
    fullTimeRestrictions: FullTimeRestriction[];
    errors: ErrorInfo[];
    id?: number;
}
export interface TimeInput {
    timeInput: string;
    day: string;
}

export interface FareStage {
    stageName: string;
    prices: {
        price: string;
        fareZones: string[];
    }[];
}

export interface UserFareStages {
    fareStages: FareStage[];
}

export interface UserFareZone {
    FareZoneName: string;
    NaptanCodes: string;
    AtcoCodes: string;
}

export interface DefinePassengerTypeWithErrors extends CompanionInfo {
    errors: ErrorInfo[];
}

export interface ManagePassengerTypeWithErrors {
    inputs: SinglePassengerType;
    errors: ErrorInfo[];
}

export interface ManageOperatorGroupWithErrors {
    inputs: OperatorGroup;
    errors: ErrorInfo[];
}

export interface ManageProductGroupWithErrors {
    inputs: GroupOfProducts;
    errors: ErrorInfo[];
}

export interface TimeRestrictionsDefinition extends TimeRestriction {
    timeRestrictionChoice?: string;
}

export interface TimeRestrictionsDefinitionWithErrors extends TimeRestrictionsDefinition {
    errors: ErrorInfo[];
}

export interface FareType {
    fareType: TicketType;
}

export interface FareTypeWithErrors {
    errors: ErrorInfo[];
}

export interface GroupPassengerTypesCollection {
    passengerTypes: string[];
}
export interface GroupPassengerTypesCollectionWithErrors {
    errors: ErrorInfo[];
}

export interface MultiProduct {
    productName: string;
    productNameId: string;
    productPrice: string;
    productPriceId: string;
    productDuration?: string;
    productDurationId?: string;
    productDurationUnits?: ExpiryUnit;
    productDurationUnitsId?: string;
    productValidity?: string;
    productValidityId?: string;
    productEndTime?: string;
    productEndTimeId?: string;
    carnetDetails?: CarnetDetails;
    productCarnetQuantityId?: string;
    productCarnetExpiryDurationId?: string;
    productCarnetExpiryUnitsId?: string;
}

export interface MultiProductWithErrors extends MultiProduct {
    productNameError?: string;
    productPriceError?: string;
    productDurationError?: string;
    productDurationUnitsError?: string;
    productCarnetQuantityError?: string;
    productCarnetExpiryDurationError?: string;
    productCarnetExpiryUnitsError?: string;
}

export interface PassengerTypeWithErrors {
    errors: ErrorInfo[];
}

export interface FaresInput {
    input: string;
    locator: string;
}

export interface FaresInformation {
    inputs: FaresInput[];
    errorInformation: PriceEntryError[];
}

export interface TicketPeriodWithErrors {
    errors: ErrorInfo[];
    dates: ProductDateInformation;
}

export interface ProductDateInformation {
    startDateDay: string;
    startDateMonth: string;
    startDateYear: string;
    endDateDay: string;
    endDateMonth: string;
    endDateYear: string;
}

export interface SelectSalesOfferPackageWithError {
    errors: ErrorInfo[];
    selected?: { [key: string]: SalesOfferPackage[] };
}

export interface Service {
    id: number;
    service: string;
}

export interface MyFaresService {
    id: string;
    lineId: string;
    origin: string;
    destination: string;
    lineName: string;
    startDate: string;
    endDate: string | undefined;
}

export interface MyFaresServiceWithProductCount extends MyFaresService {
    products: number;
    requiresAttention: boolean;
}

export interface MyFaresPointToPointProduct {
    id: number;
    productDescription: string;
    validity: string;
    startDate: string;
    endDate?: string;
    requiresAttention: boolean;
}

export interface MyFaresOtherFaresProduct {
    id: number;
    productDescription: string;
    type: string;
    duration: string;
    passengerType: string;
    startDate: string;
    endDate?: string;
}

export interface ServiceWithErrors {
    errors: ErrorInfo[];
}

export interface ServiceWithWarnings {
    warnings: ErrorInfo[];
}

export interface ServiceType {
    id?: number;
    lineName: string;
    lineId: string;
    startDate: string;
    description: string;
    origin?: string;
    destination?: string;
    serviceCode: string;
    dataSource?: string;
    mode?: string;
    endDate: string | null;
}

export interface ServiceCount {
    serviceCount: number;
}

export interface ServicesInfo extends ServiceType {
    checked?: boolean;
}

export interface ServiceDB {
    serviceDescription: string;
    operatorShortName: string;
    journeyPatterns: JourneyPattern[];
    lineId: string;
    lineName: string;
    startDate: string;
}

export interface JourneyPattern {
    startPoint: {
        Id: string;
        Display: string;
    };

    endPoint: {
        Id: string;
        Display: string;
    };

    stopList: string[];
}

// Components

export interface ConfirmationElement {
    name: string;
    content: string | string[];
    href: string;
}

export interface ProductDetailsElement {
    name: string;
    content: string[];
    editLink?: string;
    generateLink?: string;
    id: string;
    editLabel?: string;
}

export interface RadioOption {
    value: string;
    label: string;
    hint: string;
}
export interface RadioButtonsProps {
    options: RadioOption[];
    inputName: string;
}

export interface RadioWithoutConditionals extends BaseReactElement {
    value: string;
    radioButtonHint?: {
        id: string;
        content: string;
    };
}

export interface RadioWithConditionalInputs extends RadioWithoutConditionals {
    disableAutoSelect?: boolean;
    dataAriaControls: string;
    inputHint: {
        id: string;
        content: string;
        hidden?: boolean;
    };
    inputType: 'text' | 'checkbox' | 'date' | 'textWithUnits' | 'dropdown';
    inputs: BaseReactElement[] | PremadeTimeRestriction[];
    inputErrors: ErrorInfo[];
    selectIdentifier?: string;
}

export type RadioButton = RadioWithoutConditionals | RadioWithConditionalInputs;

export interface RadioConditionalInputFieldset {
    heading: {
        id: string;
        content: string;
        hidden?: boolean;
    };
    radios: RadioButton[];
    radioError: ErrorInfo[];
}

export interface UserAttribute {
    redirectFrom?: string;
}

export interface OperatorAttribute {
    name?: string;
    region?: string;
    nocCode?: string;
    uuid?: string;
    email?: string;
}

export interface ForgotPasswordAttribute {
    email: string;
}

export interface TxcSourceAttribute {
    source: 'tnds' | 'bods';
    hasTnds: boolean;
    hasBods: boolean;
}

export interface ProductToDisplay {
    id: number;
    productName: string;
    startDate: string;
    endDate?: string;
    fareType: TicketType;
    schoolTicket: boolean;
    serviceLineId: string | null;
    direction: string | null;
}

export interface ServiceToDisplay {
    lineId: string;
    origin: string;
    destination: string;
    lineName: string;
}

export interface Cap {
    id?: number;
    capDetails: CapDetails;
}

export interface CapSelection {
    id: number;
}
export interface GroupOfProducts {
    id: number;
    productIds: string[];
    name: string;
}

export interface CapDetails {
    name: string;
    price: string;
    durationAmount: string;
    durationUnits: CapExpiryUnit;
}

export interface DistanceBand {
    distanceFrom: string;
    distanceTo: string;
    pricePerKm: string;
}

export interface DistancePricingData {
    productName: string;
    maximumPrice: string;
    minimumPrice: string;
    distanceBands: DistanceBand[];
}

export interface MultiTap {
    [tapNumber: string]: string;
}

export interface MultiTapPricing {
    tapDetails: MultiTap;
}

export interface AdditionalPricing {
    pricingStructureStart: string;
    structureDiscount: string;
}
