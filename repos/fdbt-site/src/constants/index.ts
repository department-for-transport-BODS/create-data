import { PassengerAttributes } from '../interfaces/index';

// Cookies

export const ID_TOKEN_COOKIE = 'fdbt-id-token';

export const REFRESH_TOKEN_COOKIE = 'fdbt-refresh-token';

export const DISABLE_AUTH_COOKIE = 'fdbt-disable-auth';

export const COOKIES_POLICY_COOKIE = 'fdbt-cookies-policy';

export const COOKIE_PREFERENCES_COOKIE = 'fdbt-cookie-preferences-set';

export const CSRF_COOKIE = '_csrf';

export const EXPRESS_SESSION_COOKIE = 'connect.sid';

// Links

export const GOVUK_LINK = 'https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/';

export const FEEDBACK_LINK = '/feedback';

// Other

export const oneYearInSeconds = 31556952;

export const ALLOWED_XLSX_FILE_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

export const ALLOWED_CSV_FILE_TYPES = [
    'text/plain',
    'text/x-csv',
    'application/csv',
    'application/x-csv',
    'application/octet-stream',
    'text/csv',
    'text/comma-separated-values',
    'text/x-comma-separated-values',
    'text/tab-separated-values',
];

export const STAGE = process.env.STAGE || 'dev';

export const SERVICE_EMAIL_ADDRESS = process.env.SERVICE_EMAIL_ADDRESS;
export const SUPPORT_EMAIL_ADDRESS = process.env.SUPPORT_EMAIL_ADDRESS || 'support@example.com';
export const SUPPORT_PHONE_NUMBER = process.env.SUPPORT_PHONE_NUMBER;

export const RAW_USER_DATA_BUCKET_NAME = `fdbt-raw-user-data-${STAGE}`;
export const USER_DATA_BUCKET_NAME = `fdbt-user-data-${STAGE}`;
export const MATCHING_DATA_BUCKET_NAME = `fdbt-matching-data-${STAGE}`;
export const PRODUCTS_DATA_BUCKET_NAME = `fdbt-products-data-${STAGE}`;
export const NETEX_BUCKET_NAME = `fdbt-netex-data-${STAGE}`;
export const UNVALIDATED_NETEX_BUCKET_NAME = `fdbt-unvalidated-netex-data-${STAGE}`;
export const EXPORT_METADATA_BUCKET_NAME = `fdbt-export-metadata-${STAGE}`;

export const PASSENGER_TYPES_LIST: PassengerAttributes[] = [
    { passengerTypeDisplay: 'Adult', passengerTypeValue: 'adult' },
    { passengerTypeDisplay: 'Child', passengerTypeValue: 'child' },
    { passengerTypeDisplay: 'Infant', passengerTypeValue: 'infant' },
    { passengerTypeDisplay: 'Senior', passengerTypeValue: 'senior' },
    { passengerTypeDisplay: 'Student', passengerTypeValue: 'student' },
    { passengerTypeDisplay: 'Young Person', passengerTypeValue: 'youngPerson' },
    { passengerTypeDisplay: 'Anyone', passengerTypeValue: 'anyone' },
];

export const contactFeedbackQuestion = 'Did you contact us for assistance at any point?';
export const solveFeedbackQuestion = 'Did we solve your problem?';
export const hearAboutUsFeedbackQuestion = 'How did you hear about our service?';
export const generalFeedbackQuestion = 'Please let us know any feedback or suggestions for improvements you may have';

export const GROUP_PASSENGER_TYPE = 'group';
export const GROUP_REUSE_PASSENGER_TYPE = 'group-reuse';
export const PASSENGER_TYPES_WITH_GROUP: PassengerAttributes[] = [
    ...PASSENGER_TYPES_LIST,
    { passengerTypeDisplay: 'Group - define new group', passengerTypeValue: GROUP_PASSENGER_TYPE },
    { passengerTypeDisplay: 'Group - reuse saved group', passengerTypeValue: GROUP_REUSE_PASSENGER_TYPE },
];

export const INTERNAL_NOC = 'IWBusCo';

export const CREATED_FILES_NUM_PER_PAGE = 10;

export const fareTypes: Record<string, string> = {
    single: 'Single',
    period: 'Period',
    return: 'Return',
    flatFare: 'Flat fare',
    multiOperator: 'Multi-operator (internal)',
    multiOperatorExt: 'Multi-operator',
    schoolService: 'School service',
};

export const purchaseMethodsValuesMap: { [key: string]: string } = {
    agency: 'Travel Shop',
    contactlessTravelCard: 'Contactless SmartCard (e.g Oyster)',
};

export const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
