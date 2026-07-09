import { FunctionComponent, ReactElement } from 'react';
import { GlobalSettingsViewPage } from '../components/GlobalSettingsViewPage';
import { getTimeRestrictionByNocCode } from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession, PremadeTimeRestriction } from '../interfaces';
import { getAndValidateNoc, getCsrfToken } from '../utils';
import { extractGlobalSettingsReferer } from '../utils/globalSettings';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { VIEW_TIME_RESTRICTION_ERRORS } from '../constants/attributes';
import { DbTimeBand } from '../interfaces/matchingJsonTypes';

const title = 'Time restrictions';
const description = 'Define certain days and time periods that your tickets can be used within.';

const dayMappings = {
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun',
    bankHoliday: 'BH',
};

interface TimeRestrictionProps {
    csrfToken: string;
    timeRestrictions: PremadeTimeRestriction[];
    referer: string | null;
    viewTimeRestrictionErrors: ErrorInfo[];
}

const formatTime = (time: string | object): string =>
    typeof time === 'object' ? 'Fare day end' : time ? `${time.substring(0, 2)}:${time.substring(2, 4)}` : '';

const formatTimeBand = (timeBand: DbTimeBand): string =>
    `${formatTime(timeBand.startTime)}–${formatTime(timeBand.endTime)}`;

const formatTimeBands = (timeBands: DbTimeBand[]): string =>
    timeBands.length > 0 ? timeBands.map((timeBand) => formatTimeBand(timeBand)).join(', ') : 'Valid all day';

const formatDayRestriction = (timeRestriction: PremadeTimeRestriction, day: string): ReactElement => {
    const matchedDayRestriction = timeRestriction.contents.find((dayRestriction) => dayRestriction.day === day);
    return matchedDayRestriction ? (
        <span className="day-restriction">{formatTimeBands(matchedDayRestriction.timeBands)}</span>
    ) : (
        <span className="day-restriction not-valid">Not valid</span>
    );
};

const ViewTimeRestrictions = ({
    timeRestrictions,
    referer,
    csrfToken,
    viewTimeRestrictionErrors,
}: TimeRestrictionProps): ReactElement => {
    return (
        <GlobalSettingsViewPage
            entities={timeRestrictions}
            entityDescription="time restriction"
            referer={referer}
            csrfToken={csrfToken}
            title={title}
            description={description}
            CardBody={TimeRestrictionCardBody}
            errors={viewTimeRestrictionErrors}
        />
    );
};

export const TimeRestrictionCardBody: FunctionComponent<{ entity: PremadeTimeRestriction }> = ({
    entity,
}: {
    entity: PremadeTimeRestriction;
}) => (
    <>
        <h4 className="time-restriction-title govuk-heading-m govuk-!-padding-bottom-4">{entity.name}</h4>

        <ul className="day-restrictions-list">
            {Object.entries(dayMappings).map((dayMapping) => {
                return (
                    <li
                        key={dayMapping[0]}
                        className="govuk-body-s govuk-!-margin-bottom-2"
                        data-test-id="day-restriction"
                    >
                        <span className="day govuk-!-font-weight-bold">{dayMapping[1]}</span>{' '}
                        {formatDayRestriction(entity, dayMapping[0])}
                    </li>
                );
            })}
        </ul>
    </>
);

export const getServerSideProps = async (ctx: NextPageContextWithSession): Promise<{ props: TimeRestrictionProps }> => {
    const csrfToken = getCsrfToken(ctx);
    const nationalOperatorCode = getAndValidateNoc(ctx);
    const timeRestrictions = await getTimeRestrictionByNocCode(nationalOperatorCode);
    const viewTimeRestriction = getSessionAttribute(ctx.req, VIEW_TIME_RESTRICTION_ERRORS);

    updateSessionAttribute(ctx.req, VIEW_TIME_RESTRICTION_ERRORS, undefined);

    return {
        props: {
            timeRestrictions,
            referer: extractGlobalSettingsReferer(ctx),
            csrfToken,
            viewTimeRestrictionErrors: viewTimeRestriction || [],
        },
    };
};

export default ViewTimeRestrictions;
