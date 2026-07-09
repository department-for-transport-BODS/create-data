import { ReactElement, useState, Fragment } from 'react';
import FormElementWrapper, { FormGroupWrapper } from './FormElementWrapper';
import { ErrorInfo, TimeInput } from '../interfaces';
import { sentenceCaseString } from '../utils';

interface TimeRestrictionsTableProps {
    chosenDays: string[];
    errors: ErrorInfo[];
    startTimeInputs: TimeInput[];
    endTimeInputs: TimeInput[];
    dayCounters: {
        day: string;
        counter: number;
    }[];
}

const findCorrectDefaultValue = (inputs: TimeInput[], chosenDay: string, inputIndex: number): string =>
    inputs.find((input, index) => input.day === chosenDay && input.timeInput && index === inputIndex)?.timeInput ?? '';

const TimeRestrictionsTable = ({
    chosenDays,
    errors,
    startTimeInputs,
    endTimeInputs,
    dayCounters = [],
}: TimeRestrictionsTableProps): ReactElement => {
    const defaultState: { [key: string]: number } = {};

    chosenDays.forEach((day) => {
        defaultState[day] = 1;
    });

    dayCounters.forEach((dayCounter) => {
        defaultState[dayCounter.day] = dayCounter.counter;
    });

    const [dayRowCount, updateDayRowCount] = useState(defaultState);

    const addTimeRestrictionRow = (day: string): void => {
        if (dayRowCount?.[day] < 5) {
            const dayRowCountToUpdate = { ...dayRowCount };
            dayRowCountToUpdate[day] += 1;
            updateDayRowCount(dayRowCountToUpdate);
        }
    };

    const getInputsForDay = (inputs: TimeInput[], day: string): TimeInput[] => {
        const inputsForDay: TimeInput[] = [];
        inputs.forEach((input) => {
            if (input.day === day) {
                inputsForDay.push(input);
            }
        });
        return inputsForDay;
    };

    const getTimeRestrictionRows = (chosenDay: string): ReactElement[] => {
        const rows: ReactElement[] = [];

        const startInputsForDay = getInputsForDay(startTimeInputs, chosenDay);
        const endInputsForDay = getInputsForDay(endTimeInputs, chosenDay);

        for (let i = 0; i < dayRowCount[chosenDay]; i += 1) {
            rows.push(
                <div className="time-restriction-row" key={i}>
                    <div>
                        <FormGroupWrapper errors={errors} errorIds={[`start-time-${chosenDay}-${i}`]}>
                            <>
                                <label className="govuk-label" htmlFor={`start-time-${chosenDay}-${i}`}>
                                    Start time <span className="govuk-visually-hidden">for {chosenDay}</span>
                                </label>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`start-time-${chosenDay}-${i}`}
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input govuk-input--width-5 govuk-!-margin-right-4"
                                        id={`start-time-${chosenDay}-${i}`}
                                        name={`startTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={findCorrectDefaultValue(startInputsForDay, chosenDay, i)}
                                    />
                                </FormElementWrapper>
                            </>
                        </FormGroupWrapper>
                    </div>
                    <div>
                        <FormGroupWrapper errors={errors} errorIds={[`end-time-${chosenDay}-${i}`]}>
                            <>
                                <label className="govuk-label" htmlFor={`end-time-${chosenDay}-${i}`}>
                                    End time <span className="govuk-visually-hidden">for {chosenDay}</span>
                                </label>
                                <FormElementWrapper
                                    errors={errors}
                                    errorId={`end-time-${chosenDay}-${i}`}
                                    errorClass="govuk-input--error"
                                >
                                    <input
                                        className="govuk-input govuk-input--width-5"
                                        id={`end-time-${chosenDay}-${i}`}
                                        name={`endTime${chosenDay}`}
                                        aria-describedby="time-restrictions-hint"
                                        type="text"
                                        defaultValue={findCorrectDefaultValue(endInputsForDay, chosenDay, i)}
                                    />
                                </FormElementWrapper>
                            </>
                        </FormGroupWrapper>
                    </div>
                </div>,
            );
        }

        return rows;
    };

    return (
        <>
            {chosenDays.map((chosenDay) => (
                <Fragment key={chosenDay}>
                    <fieldset className="govuk-fieldset flex-container time-restrictions-table">
                        <legend className="govuk-fieldset__legend govuk-fieldset__legend--m day-label">
                            {sentenceCaseString(chosenDay)}
                        </legend>
                        <div>{getTimeRestrictionRows(chosenDay)}</div>
                        {dayRowCount[chosenDay] < 5 && (
                            <button
                                id={`add-another-button-${chosenDay}`}
                                type="button"
                                className="govuk-button govuk-button--secondary govuk-!-margin-left-3 time-restrictions-button-placement"
                                onClick={(): void => addTimeRestrictionRow(chosenDay)}
                            >
                                Add another
                            </button>
                        )}
                    </fieldset>
                    <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
                </Fragment>
            ))}
        </>
    );
};

export default TimeRestrictionsTable;
