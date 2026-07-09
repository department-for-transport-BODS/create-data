import { ReactElement, useState, useRef } from 'react';
import CsrfForm from '../components/CsrfForm';
import ErrorSummary from '../components/ErrorSummary';
import FormElementWrapper from '../components/FormElementWrapper';
import { GS_TIME_RESTRICTION_ATTRIBUTE } from '../constants/attributes';
import { getTimeRestrictionByIdAndNoc, getFareDayEnd } from '../data/auroradb';
import { ErrorInfo, NextPageContextWithSession, PremadeTimeRestriction, TimeInput, DbTimeInput } from '../interfaces';
import TwoThirdsLayout from '../layout/Layout';
import { getGlobalSettingsManageProps, GlobalSettingsManageProps } from '../utils/globalSettings';
import { getSessionAttribute } from '../utils/sessions';
import { getAndValidateNoc } from '../utils';
import InformationSummary from '../components/InformationSummary';
import BackButton from '../components/BackButton';

const title = 'Manage Time Restrictions - Create Fares Data Service';
const description = 'Manage Time Restrictions page of the Create Fares Data Service';

const editingInformationText =
    'Editing and saving new changes will be applied to all fares using this time restriction.';

const days = [
    {
        id: 'monday',
        label: 'Monday',
    },
    {
        id: 'tuesday',
        label: 'Tuesday',
    },
    {
        id: 'wednesday',
        label: 'Wednesday',
    },
    {
        id: 'thursday',
        label: 'Thursday',
    },
    {
        id: 'friday',
        label: 'Friday',
    },
    {
        id: 'saturday',
        label: 'Saturday',
    },
    {
        id: 'sunday',
        label: 'Sunday',
    },
    {
        id: 'bankHoliday',
        label: 'Bank holiday',
    },
];

type ManageTimeRestrictionProps = GlobalSettingsManageProps<PremadeTimeRestriction> & {
    fareDayEnd: string | null;
};

const findCorrectTimeRestrictionDay = (day: string, inputs?: PremadeTimeRestriction) => {
    return inputs?.contents.find((timeRestrictionDay) => timeRestrictionDay.day === day);
};

const findCorrectDefaultValue = (
    inputs: DbTimeInput[],
    day: string,
    inputIndex: number,
    fareDayEnd?: string | null,
): string => {
    const value =
        inputs.find((input, index) => input.day === day && input.timeInput && index === inputIndex)?.timeInput ?? '';
    return (typeof value === 'object' ? fareDayEnd : value) ?? '';
};

const isFareDayEnd = (inputs: DbTimeInput[], day: string, inputIndex: number): boolean => {
    const value =
        inputs.find((input, index) => input.day === day && input.timeInput && index === inputIndex)?.timeInput ?? '';
    return typeof value === 'object';
};

const hasError = (errors: ErrorInfo[], name: string) => {
    if (errors.filter((e) => e.id === name).length > 0) {
        return ' govuk-form-group--error';
    }

    return '';
};

const ManageTimeRestriction = ({
    csrfToken,
    errors = [],
    inputs,
    editMode,
    fareDayEnd,
}: ManageTimeRestrictionProps): ReactElement => {
    const defaultState: { [key: string]: number } = {};

    days.forEach((day) => {
        defaultState[day.id] = 1;
    });

    const [dayRowCount, updateDayRowCount] = useState(defaultState);

    const addTimeRestrictionRow = (day: string): void => {
        const dayRowCountToUpdate = { ...dayRowCount };
        dayRowCountToUpdate[day] += 1;
        updateDayRowCount(dayRowCountToUpdate);
    };

    const deleteTimeRestrictionRow = (day: string): void => {
        if (dayRowCount?.[day] > 1) {
            const dayRowCountToUpdate = { ...dayRowCount };
            dayRowCountToUpdate[day] -= 1;
            updateDayRowCount(dayRowCountToUpdate);
        }
    };

    const getTimeRestrictionRows = (
        day: string,
        inputs?: PremadeTimeRestriction,
    ): [ReactElement[], (val: boolean) => void] => {
        const rows = [];
        const startTimeInputs: TimeInput[] = [];
        const endTimeInputs: DbTimeInput[] = [];
        const dayCounters: {
            day: string;
            counter: number;
        }[] = [];

        const matchedInputTimeRestriction = inputs?.contents.find(
            (fullTimeRestriction) => fullTimeRestriction.day === day,
        );

        if (matchedInputTimeRestriction) {
            matchedInputTimeRestriction.timeBands.forEach((timeBand) => {
                startTimeInputs.push({ timeInput: timeBand.startTime, day });
                endTimeInputs.push({ timeInput: timeBand.endTime, day });
            });

            dayCounters.push({
                day,
                counter:
                    matchedInputTimeRestriction.timeBands.length > 0 ? matchedInputTimeRestriction.timeBands.length : 1,
            });
        }

        dayCounters.forEach((dayCounter) => {
            defaultState[dayCounter.day] = dayCounter.counter;
        });

        const [useFareDayEnd, setUseFareDayEnd] = useState(isFareDayEnd(endTimeInputs, day, endTimeInputs.length - 1));
        const endTimeRef = useRef<HTMLInputElement>(null);

        const length = dayRowCount[day];
        for (let i = 0; i < length; i += 1) {
            const matchedError = errors.find((error) => error.id.includes(`-time-${day}-${i}`));

            const lastRow = i === length - 1;
            rows.push(
                <div className="global-settings-time-restriction-row" key={i}>
                    {matchedError ? <p className="govuk-error-message">{matchedError.errorMessage}</p> : null}
                    <div className="govuk-form-group">
                        <div>
                            <>
                                <label className="govuk-label" htmlFor={`start-time-${day}-${i}`}>
                                    Start time <span className="govuk-visually-hidden">for {day}</span>
                                </label>
                                <input
                                    className={`govuk-input govuk-input--width-5 govuk-!-margin-right-4 ${
                                        matchedError?.id === `start-time-${day}-${i}` && `govuk-input--error`
                                    }`}
                                    id={`start-time-${day}-${i}`}
                                    name={`startTime${day}`}
                                    type="text"
                                    defaultValue={findCorrectDefaultValue(startTimeInputs, day, i)}
                                />
                            </>
                        </div>
                        <div>
                            <>
                                <label className="govuk-label" htmlFor={`end-time-${day}-${i}`}>
                                    End time <span className="govuk-visually-hidden">for {day}</span>
                                </label>
                                <input
                                    className={`govuk-input govuk-input--width-5 ${
                                        matchedError?.id === `end-time-${day}-${i}` && `govuk-input--error`
                                    }`}
                                    disabled={lastRow && useFareDayEnd}
                                    id={`end-time-${day}-${i}`}
                                    name={`endTime${day}`}
                                    type="text"
                                    ref={lastRow ? endTimeRef : undefined}
                                    defaultValue={findCorrectDefaultValue(endTimeInputs, day, i, fareDayEnd)}
                                />
                            </>
                        </div>
                        {lastRow ? (
                            <>
                                <span className="govuk-label item">OR </span>

                                <div className="govuk-checkboxes__item item">
                                    <input
                                        className="govuk-checkboxes__input"
                                        name={`fareDayEnd${day}`}
                                        type="checkbox"
                                        id={`use-fare-day-end-${day}-${i}`}
                                        onChange={(e) => {
                                            setUseFareDayEnd(e.currentTarget.checked);
                                            if (endTimeRef.current) {
                                                endTimeRef.current.value =
                                                    (e.currentTarget.checked && fareDayEnd) || '';
                                            }
                                        }}
                                        checked={useFareDayEnd}
                                    />
                                    <label
                                        className="govuk-label govuk-checkboxes__label"
                                        htmlFor={`use-fare-day-end-${day}-${i}`}
                                    >
                                        Use fare day end
                                    </label>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>,
            );
        }

        return [rows, setUseFareDayEnd];
    };

    return (
        <TwoThirdsLayout title={title} description={description} errors={errors}>
            <CsrfForm action="/api/manageTimeRestriction" method="post" csrfToken={csrfToken}>
                <>
                    {editMode && errors.length === 0 ? (
                        <>
                            <BackButton href="viewTimeRestrictions"></BackButton>
                            <InformationSummary informationText={editingInformationText} />
                        </>
                    ) : null}
                    <ErrorSummary errors={errors} />

                    <h1 className="govuk-heading-l" id="manage-time-restriction-page-heading">
                        Provide time restriction details
                    </h1>
                    <span className="govuk-hint" id="manage-time-restriction-hint">
                        Select the days of the week that the tickets are valid for. If applicable, enter the times at
                        which your tickets start and end. If they are valid at all times, select the day and leave the
                        time blank. You cannot enter an end time without a start time.
                    </span>
                    <div className="govuk-inset-text" id="manage-time-restriction-inset-hint">
                        Enter times in 24hr format. For example 0900 is 9am, 1730 is 5:30pm.
                    </div>

                    <div className={`govuk-form-group${hasError(errors, 'time-restriction-days')}`}>
                        <fieldset className="govuk-fieldset" aria-describedby="time-restriction-heading">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                <h1 className="govuk-fieldset__heading" id="time-restriction-heading">
                                    Select the days of the week that are applicable
                                </h1>
                            </legend>
                            <input type="hidden" name="id" value={inputs?.id} />
                            <FormElementWrapper
                                errors={errors}
                                errorId="time-restriction-days"
                                errorClass="govuk-checkboxes--error"
                            >
                                <div className="govuk-checkboxes" data-module="govuk-checkboxes">
                                    {days.map((day, index): ReactElement => {
                                        const [timeRestrictionRows, setUseFareDayEnd] = getTimeRestrictionRows(
                                            day.id,
                                            inputs,
                                        );
                                        return (
                                            <div key={day.id}>
                                                <div className="govuk-checkboxes__item" key={day.id}>
                                                    <input
                                                        className="govuk-checkboxes__input"
                                                        id={`time-restriction-day-${index}`}
                                                        name="timeRestrictionDays"
                                                        type="checkbox"
                                                        value={day.id}
                                                        data-aria-controls={`conditional-input-${index}`}
                                                        defaultChecked={!!findCorrectTimeRestrictionDay(day.id, inputs)}
                                                    />
                                                    <label
                                                        className="govuk-label govuk-checkboxes__label"
                                                        htmlFor={`time-restriction-day-${index}`}
                                                    >
                                                        {day.label}
                                                    </label>
                                                </div>
                                                <div
                                                    className="govuk-checkboxes__conditional govuk-checkboxes__conditional--hidden"
                                                    id={`conditional-input-${index}`}
                                                >
                                                    <div className="flex-container time-restrictions-table">
                                                        <div
                                                            className={`govuk-form-group ${
                                                                errors.some((error) =>
                                                                    error.id.includes(`-time-${day.id}-`),
                                                                ) && `govuk-form-group--error`
                                                            }`}
                                                        >
                                                            {timeRestrictionRows}
                                                        </div>
                                                    </div>
                                                    <div className="flex-container govuk-!-margin-bottom-4">
                                                        <button
                                                            id={`add-another-button-${day.id}`}
                                                            type="button"
                                                            className="govuk-button govuk-button--secondary time-restrictions-button-placement"
                                                            onClick={(): void => {
                                                                addTimeRestrictionRow(day.id);
                                                                setUseFareDayEnd(false);
                                                            }}
                                                        >
                                                            Add another
                                                        </button>
                                                        {dayRowCount[day.id] > 1 && (
                                                            <button
                                                                id={`add-another-button-${day.id}`}
                                                                type="button"
                                                                className="govuk-button govuk-button--warning govuk-!-margin-left-3 time-restrictions-button-placement"
                                                                onClick={(): void => {
                                                                    deleteTimeRestrictionRow(day.id);
                                                                    setUseFareDayEnd(false);
                                                                }}
                                                            >
                                                                Delete last row
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormElementWrapper>
                        </fieldset>
                    </div>

                    <div
                        className={`govuk-form-group${hasError(errors, 'time-restriction-name')}`}
                        id="time-restriction-name"
                    >
                        <label htmlFor="time-restriction-name">
                            <h1 className="govuk-heading-m" id="time-restriction-name-heading">
                                Provide a name for your time restriction
                            </h1>
                        </label>

                        <p className="govuk-hint" id="group-name-hint">
                            50 characters maximum
                        </p>
                        <FormElementWrapper
                            errors={errors}
                            errorId="time-restriction-name"
                            errorClass="govuk-input--error"
                        >
                            <input
                                className="govuk-input govuk-input--width-30 govuk-product-name-input__inner__input"
                                id="time-restriction-name"
                                name="timeRestrictionName"
                                type="text"
                                maxLength={50}
                                defaultValue={inputs?.name || ''}
                            />
                        </FormElementWrapper>
                    </div>

                    <input
                        type="submit"
                        value={`${editMode ? 'Update' : 'Add'} time restriction`}
                        id="continue-button"
                        className="govuk-button"
                    />
                </>
            </CsrfForm>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = async (
    ctx: NextPageContextWithSession,
): Promise<{ props: ManageTimeRestrictionProps }> => {
    const gsProps = await getGlobalSettingsManageProps(
        ctx,
        getTimeRestrictionByIdAndNoc,
        getSessionAttribute(ctx.req, GS_TIME_RESTRICTION_ATTRIBUTE),
    );

    return {
        props: { ...gsProps.props, fareDayEnd: (await getFareDayEnd(getAndValidateNoc(ctx))) || null },
    };
};

export default ManageTimeRestriction;
