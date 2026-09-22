import { AdminUser } from '../data/cognito';

export const STATUS_MAP: { [key: string]: string } = {
    CONFIRMED: 'Registered',
    FORCE_CHANGE_PASSWORD: 'Awaiting Registration',
};

export const getUserStatusLabel = (status: string | undefined): string => STATUS_MAP[status ?? ''] ?? 'Unknown';

export const isAwaitingRegistration = (status: string | undefined): boolean => status === 'FORCE_CHANGE_PASSWORD';

// NOCs are stored in cognito pipe-separated, but edited by admins as a comma-separated list
export const cognitoFormatNocs = (nocs: string): string =>
    nocs
        .split(',')
        .map((noc) => noc.trim())
        .filter((noc) => noc)
        .join('|');

export const humanFormatNocs = (nocs: string): string =>
    nocs
        .split('|')
        .map((noc) => noc.trim())
        .filter((noc) => noc)
        .join(', ');

export const sortAdminUsersByEmail = (users: AdminUser[]): AdminUser[] =>
    [...users].sort((a, b) => (a.email || 'z').localeCompare(b.email || 'z'));

const TEST_NOC = 'IWBusCo';

export const isTestUser = (user: AdminUser): boolean => user.nocs.split('|').includes(TEST_NOC);
