import * as attributes from '../constants/attributes';
import {
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    POINT_TO_POINT_PRODUCT_ATTRIBUTE,
    CARNET_FARE_TYPE_ATTRIBUTE,
    CSV_UPLOAD_ATTRIBUTE,
    DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE,
    DURATION_VALID_ATTRIBUTE,
    FARE_STAGES_ATTRIBUTE,
    FARE_TYPE_ATTRIBUTE,
    FARE_ZONE_ATTRIBUTE,
    FORGOT_PASSWORD_ATTRIBUTE,
    FULL_TIME_RESTRICTIONS_ATTRIBUTE,
    GROUP_PASSENGER_INFO_ATTRIBUTE,
    GROUP_PASSENGER_TYPES_ATTRIBUTE,
    GROUP_SIZE_ATTRIBUTE,
    INBOUND_MATCHING_ATTRIBUTE,
    INPUT_METHOD_ATTRIBUTE,
    MATCHING_ATTRIBUTE,
    MULTI_OP_TXC_SOURCE_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE,
    MULTIPLE_PRODUCT_ATTRIBUTE,
    NUMBER_OF_PRODUCTS_ATTRIBUTE,
    NUMBER_OF_STAGES_ATTRIBUTE,
    OPERATOR_ATTRIBUTE,
    PASSENGER_TYPE_ATTRIBUTE,
    PERIOD_EXPIRY_ATTRIBUTE,
    PRICE_ENTRY_ATTRIBUTE,
    PRODUCT_DATE_ATTRIBUTE,
    CARNET_PRODUCT_DETAILS_ATTRIBUTE,
    RETURN_VALIDITY_ATTRIBUTE,
    REUSE_OPERATOR_GROUP_ATTRIBUTE,
    SALES_OFFER_PACKAGES_ATTRIBUTE,
    SAVE_OPERATOR_GROUP_ATTRIBUTE,
    SAVED_PASSENGER_GROUPS_ATTRIBUTE,
    SCHOOL_FARE_TYPE_ATTRIBUTE,
    SERVICE_ATTRIBUTE,
    RETURN_SERVICE_ATTRIBUTE,
    SERVICE_LIST_ATTRIBUTE,
    SOP_ATTRIBUTE,
    SOP_INFO_ATTRIBUTE,
    STAGE_NAMES_ATTRIBUTE,
    TERM_TIME_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
    TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE,
    TXC_SOURCE_ATTRIBUTE,
    USER_ATTRIBUTE,
    GS_PASSENGER_GROUP_ATTRIBUTE,
    GS_TIME_RESTRICTION_ATTRIBUTE,
    GS_REFERER,
    GS_PURCHASE_METHOD_ATTRIBUTE,
    GS_OPERATOR_DETAILS_ATTRIBUTE,
    VIEW_PASSENGER_TYPE_ERRORS,
    VIEW_PURCHASE_METHOD_ERRORS,
    MANAGE_OPERATOR_GROUP_ERRORS_ATTRIBUTE,
    VIEW_TIME_RESTRICTION_ERRORS,
    VIEW_OPERATOR_GROUP_ERRORS,
    CAPPED_PRODUCT_GROUP_ID_ATTRIBUTE,
    UNASSIGNED_STOPS_ATTRIBUTE,
    GS_FARE_DAY_END_ATTRIBUTE,
    UNASSIGNED_INBOUND_STOPS_ATTRIBUTE,
    CSV_ZONE_FILE_NAME,
    DIRECTION_ATTRIBUTE,
    EDIT_PERIOD_DURATION_ERROR,
    MANAGE_PRODUCT_GROUP_ERRORS_ATTRIBUTE,
    VIEW_PRODUCT_GROUP_ERRORS,
    EDIT_CARNET_PROPERTIES_ERROR,
    CAP_START_ATTRIBUTE,
    PRICING_PER_DISTANCE_ATTRIBUTE,
    MULTI_TAPS_PRICING_ATTRIBUTE,
    ADDITIONAL_PRICING_ATTRIBUTE,
    EDIT_FARE_STAGE_MATCHING_ATTRIBUTE,
    MULTI_MODAL_ATTRIBUTE,
    SERVICE_LIST_EXEMPTION_ATTRIBUTE,
    CREATE_CAPS_ATTRIBUTE,
    CAPS_DEFINITION_ATTRIBUTE,
    STOPS_EXEMPTION_ATTRIBUTE,
    VIEW_CAP_ERRORS,
    FLAT_FARE_RETURN_ATTRIBUTE,
    MISSING_STOPS_ATTRIBUTE,
    ACCOUNT_PAGE_ERROR,
} from '../constants/attributes';
import {
    CsvUploadAttributeWithErrors,
    DefinePassengerTypeWithErrors,
    DurationValidInfo,
    ErrorInfo,
    FaresInformation,
    FareStagesAttribute,
    FareStagesAttributeWithErrors,
    FareType,
    FareTypeWithErrors,
    FareZoneWithErrors,
    ForgotPasswordAttribute,
    FullTimeRestrictionAttribute,
    GroupPassengerTypesCollection,
    GroupPassengerTypesCollectionWithErrors,
    GroupTicketAttribute,
    GroupTicketAttributeWithErrors,
    IncomingMessageWithSession,
    InputCheck,
    InputMethodInfo,
    MultiOperatorInfoWithErrors,
    MultipleOperatorsAttribute,
    MultipleOperatorsAttributeWithErrors,
    MultipleProductAttribute,
    MultipleProductAttributeWithErrors,
    NumberOfStagesAttributeWithError,
    OperatorAttribute,
    PassengerTypeWithErrors,
    ProductWithSalesOfferPackages,
    ReturnPeriodValidityWithErrors,
    SalesOfferPackageInfo,
    SalesOfferPackageInfoWithErrors,
    SalesOfferPackageWithErrors,
    SchoolFareTypeAttribute,
    SelectSalesOfferPackageWithError,
    Service,
    ServiceListAttribute,
    ServiceWithErrors,
    TermTimeAttribute,
    TicketPeriodWithErrors,
    TicketPeriodWithInput,
    TicketRepresentationAttribute,
    TicketRepresentationAttributeWithErrors,
    TimeRestriction,
    TimeRestrictionsDefinitionWithErrors,
    TxcSourceAttribute,
    UserAttribute,
    WithErrors,
    ManagePassengerTypeWithErrors,
    GlobalSettingsAttribute,
    PremadeTimeRestriction,
    Direction,
    Errors,
    BasicService,
    ManageOperatorGroupWithErrors,
    ManageProductGroupWithErrors,
    DistancePricingData,
    MultiTapPricing,
    AdditionalPricing,
    EditFareStageMatchingWithErrors,
    CapSelection,
    ExemptedStopsAttribute,
    Cap,
    ServiceWithWarnings,
} from '../interfaces';
import { InboundMatchingInfo, MatchingInfo, MatchingWithErrors } from '../interfaces/matchingInterface';
import {
    TicketWithIds,
    MatchingJsonMetaData,
    FromDb,
    OperatorDetails,
    UnassignedStop,
    CarnetProductInfo,
    CompanionInfo,
    PeriodExpiry,
    PointToPointPeriodProduct,
    ReturnPeriodValidity,
    SalesOfferPackage,
    AdditionalOperator,
    CapStartInfo,
} from '../interfaces/matchingJsonTypes';
import { PassengerType, GroupPassengerType, GroupPassengerTypeDb } from '../interfaces/dbTypes';

export interface SessionAttributeTypes {
    [STAGE_NAMES_ATTRIBUTE]: string[] | InputCheck[];
    [DURATION_VALID_ATTRIBUTE]: DurationValidInfo;
    [INPUT_METHOD_ATTRIBUTE]: InputMethodInfo | ErrorInfo;
    [SOP_ATTRIBUTE]: SalesOfferPackageWithErrors;
    [SOP_INFO_ATTRIBUTE]: SalesOfferPackageInfo | SalesOfferPackageInfoWithErrors;
    [MATCHING_ATTRIBUTE]: MatchingWithErrors | MatchingInfo;
    [EDIT_FARE_STAGE_MATCHING_ATTRIBUTE]: EditFareStageMatchingWithErrors;
    [INBOUND_MATCHING_ATTRIBUTE]: MatchingWithErrors | InboundMatchingInfo;
    [PERIOD_EXPIRY_ATTRIBUTE]: PeriodExpiry | ErrorInfo[];
    [CARNET_PRODUCT_DETAILS_ATTRIBUTE]: CarnetProductInfo | WithErrors<CarnetProductInfo>;
    [PRICE_ENTRY_ATTRIBUTE]: FaresInformation;
    [SALES_OFFER_PACKAGES_ATTRIBUTE]:
        SelectSalesOfferPackageWithError | SalesOfferPackage[] | ProductWithSalesOfferPackages[] | undefined;
    [GROUP_SIZE_ATTRIBUTE]: GroupTicketAttribute | GroupTicketAttributeWithErrors;
    [GROUP_PASSENGER_TYPES_ATTRIBUTE]: GroupPassengerTypesCollection | GroupPassengerTypesCollectionWithErrors;
    [GROUP_PASSENGER_INFO_ATTRIBUTE]: CompanionInfo[];
    [TIME_RESTRICTIONS_DEFINITION_ATTRIBUTE]: TimeRestriction | TimeRestrictionsDefinitionWithErrors;
    [FARE_ZONE_ATTRIBUTE]: string | FareZoneWithErrors;
    [CSV_UPLOAD_ATTRIBUTE]: CsvUploadAttributeWithErrors;
    [SERVICE_LIST_ATTRIBUTE]: ServiceListAttribute | { errors: ErrorInfo[] };
    [NUMBER_OF_STAGES_ATTRIBUTE]: NumberOfStagesAttributeWithError;
    [MULTIPLE_PRODUCT_ATTRIBUTE]: MultipleProductAttribute | MultipleProductAttributeWithErrors;
    [NUMBER_OF_PRODUCTS_ATTRIBUTE]: number;
    [FARE_TYPE_ATTRIBUTE]: FareType | FareTypeWithErrors;
    [MATCHING_JSON_ATTRIBUTE]: TicketWithIds;
    [MATCHING_JSON_META_DATA_ATTRIBUTE]: MatchingJsonMetaData;
    [PASSENGER_TYPE_ATTRIBUTE]: PassengerType | PassengerTypeWithErrors;
    [DEFINE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: PassengerType | DefinePassengerTypeWithErrors;
    [MANAGE_PASSENGER_TYPE_ERRORS_ATTRIBUTE]: ManagePassengerTypeWithErrors;
    [MANAGE_OPERATOR_GROUP_ERRORS_ATTRIBUTE]: ManageOperatorGroupWithErrors;
    [MANAGE_PRODUCT_GROUP_ERRORS_ATTRIBUTE]: ManageProductGroupWithErrors;
    [SERVICE_ATTRIBUTE]: Service | ServiceWithErrors | ServiceWithWarnings;
    [RETURN_SERVICE_ATTRIBUTE]: BasicService | WithErrors<BasicService>;
    [DIRECTION_ATTRIBUTE]: Direction | Errors;
    [TICKET_REPRESENTATION_ATTRIBUTE]: TicketRepresentationAttribute | TicketRepresentationAttributeWithErrors;
    [FARE_STAGES_ATTRIBUTE]: FareStagesAttribute | FareStagesAttributeWithErrors;
    [RETURN_VALIDITY_ATTRIBUTE]: ReturnPeriodValidity | ReturnPeriodValidityWithErrors;
    [PRODUCT_DATE_ATTRIBUTE]: TicketPeriodWithInput | TicketPeriodWithErrors;
    [MULTIPLE_OPERATOR_ATTRIBUTE]: MultipleOperatorsAttribute | MultipleOperatorsAttributeWithErrors;
    [MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE]: AdditionalOperator[] | MultiOperatorInfoWithErrors;
    [FULL_TIME_RESTRICTIONS_ATTRIBUTE]: FullTimeRestrictionAttribute;
    [TERM_TIME_ATTRIBUTE]: TermTimeAttribute | WithErrors<TermTimeAttribute>;
    [SCHOOL_FARE_TYPE_ATTRIBUTE]: SchoolFareTypeAttribute | WithErrors<SchoolFareTypeAttribute>;
    [FORGOT_PASSWORD_ATTRIBUTE]: ForgotPasswordAttribute | WithErrors<ForgotPasswordAttribute>;
    [USER_ATTRIBUTE]: UserAttribute | WithErrors<UserAttribute>;
    [OPERATOR_ATTRIBUTE]: OperatorAttribute | WithErrors<OperatorAttribute>;
    [TXC_SOURCE_ATTRIBUTE]: TxcSourceAttribute;
    [MULTI_OP_TXC_SOURCE_ATTRIBUTE]: TxcSourceAttribute;
    [REUSE_OPERATOR_GROUP_ATTRIBUTE]: { operatorGroupId: number } | { errors: ErrorInfo[] };
    [SAVE_OPERATOR_GROUP_ATTRIBUTE]: ErrorInfo[];
    [CARNET_FARE_TYPE_ATTRIBUTE]: boolean;
    [SAVED_PASSENGER_GROUPS_ATTRIBUTE]: GroupPassengerType[];
    [POINT_TO_POINT_PRODUCT_ATTRIBUTE]: PointToPointPeriodProduct | WithErrors<PointToPointPeriodProduct>;
    [GS_PASSENGER_GROUP_ATTRIBUTE]: GlobalSettingsAttribute<GroupPassengerTypeDb>;
    [GS_TIME_RESTRICTION_ATTRIBUTE]: GlobalSettingsAttribute<PremadeTimeRestriction>;
    [GS_PURCHASE_METHOD_ATTRIBUTE]: GlobalSettingsAttribute<FromDb<SalesOfferPackage>>;
    [GS_FARE_DAY_END_ATTRIBUTE]: { errors: ErrorInfo[]; input: string } | { saved: boolean };
    [GS_OPERATOR_DETAILS_ATTRIBUTE]: { errors: ErrorInfo[]; input: OperatorDetails } | { saved: boolean };
    [UNASSIGNED_STOPS_ATTRIBUTE]: UnassignedStop[];
    [UNASSIGNED_INBOUND_STOPS_ATTRIBUTE]: UnassignedStop[];
    [GS_REFERER]: string;
    [CSV_ZONE_FILE_NAME]: string;
    [VIEW_PASSENGER_TYPE_ERRORS]: ErrorInfo[];
    [VIEW_PURCHASE_METHOD_ERRORS]: ErrorInfo[];
    [VIEW_TIME_RESTRICTION_ERRORS]: ErrorInfo[];
    [VIEW_OPERATOR_GROUP_ERRORS]: ErrorInfo[];
    [VIEW_PRODUCT_GROUP_ERRORS]: ErrorInfo[];
    [VIEW_CAP_ERRORS]: ErrorInfo[];
    [CAPPED_PRODUCT_GROUP_ID_ATTRIBUTE]: string | ErrorInfo;
    [CREATE_CAPS_ATTRIBUTE]: Cap | WithErrors<Cap>;
    [EDIT_PERIOD_DURATION_ERROR]: ErrorInfo[];
    [EDIT_CARNET_PROPERTIES_ERROR]: ErrorInfo[];
    [CAP_START_ATTRIBUTE]: CapStartInfo | ErrorInfo[];
    [PRICING_PER_DISTANCE_ATTRIBUTE]: DistancePricingData | WithErrors<DistancePricingData>;
    [MULTI_TAPS_PRICING_ATTRIBUTE]: MultiTapPricing | WithErrors<MultiTapPricing>;
    [ADDITIONAL_PRICING_ATTRIBUTE]:
        AdditionalPricing | { clickedYes: boolean; additionalPricingStructures: WithErrors<AdditionalPricing> };
    [MULTI_MODAL_ATTRIBUTE]: { modes: string[] };
    [CAPS_DEFINITION_ATTRIBUTE]: CapSelection[] | { errors: ErrorInfo[] };
    [SERVICE_LIST_EXEMPTION_ATTRIBUTE]: ServiceListAttribute | { errors: ErrorInfo[] };
    [STOPS_EXEMPTION_ATTRIBUTE]: ExemptedStopsAttribute | { errors: ErrorInfo[] };
    [FLAT_FARE_RETURN_ATTRIBUTE]: boolean;
    [MISSING_STOPS_ATTRIBUTE]: string[];
    [ACCOUNT_PAGE_ERROR]: ErrorInfo[];
}

export type SessionAttribute<T extends string> = T extends keyof SessionAttributeTypes
    ? SessionAttributeTypes[T]
    : string;

export const getRequiredSessionAttribute = <T extends keyof SessionAttributeTypes>(
    req: IncomingMessageWithSession,
    attributeName: T,
): SessionAttributeTypes[T] => {
    const attribute = getSessionAttribute(req, attributeName);

    if (!attribute) {
        throw new Error(`Attribute was not found ${attributeName}`);
    }

    return attribute;
};

export const getSessionAttribute = <T extends keyof SessionAttributeTypes>(
    req: IncomingMessageWithSession,
    attributeName: T,
): SessionAttributeTypes[T] | undefined =>
    (req?.session as unknown as Record<string, unknown>)?.[attributeName] as SessionAttributeTypes[T];

export const updateSessionAttribute = <T extends string>(
    req: IncomingMessageWithSession,
    attributeName: T,
    attributeValue: SessionAttribute<T> | undefined,
): void => {
    (req.session as unknown as Record<string, unknown>)[attributeName] = attributeValue;
};

export const regenerateSession = (req: IncomingMessageWithSession): void => {
    const attributesList = Object.values(attributes) as string[];
    const excludeAttributeList = [OPERATOR_ATTRIBUTE, MULTI_MODAL_ATTRIBUTE];
    Object.keys(req.session).forEach((attribute) => {
        if (attributesList.includes(attribute) && !excludeAttributeList.includes(attribute)) {
            updateSessionAttribute(req, attribute, undefined);
        }
    });
};

export const destroySession = (req: IncomingMessageWithSession): void => {
    req.session.destroy((err: Error) => {
        if (err) {
            throw new Error('Could not destroy session');
        }
    });
};
