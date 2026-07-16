import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const convertDateToUnixTime = (date: string, format = 'D/M/YYYY'): number => dayjs(date, format).valueOf();

export const convertUtcDateToUnixTime = (date: string, format = 'D/M/YYYY'): number =>
    dayjs.utc(date, format).valueOf();

export default dayjs;
