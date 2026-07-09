import startCase from 'lodash/startCase';
import { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';
import FormElementWrapper from './FormElementWrapper';

interface DateSelectorProps {
    inputs?: {
        dayInput: string;
        monthInput: string;
        yearInput: string;
    };
    errors?: ErrorInfo[];
    startOrEnd: 'start' | 'end';
}

const DateSelector = ({ inputs, startOrEnd, errors = [] }: DateSelectorProps): ReactElement => (
    <div className={startOrEnd === 'end' ? 'govuk-!-padding-top-4' : ''}>
        <h1 className="govuk-heading-m">{startCase(startOrEnd)} date</h1>

        <FormElementWrapper errors={errors} errorId={`${startOrEnd}-day-input`} errorClass="govuk-date-input--error">
            <div className="govuk-date-input" id={`${startOrEnd}-date`}>
                <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-day-input`}>
                            Day
                        </label>
                        <input
                            className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                            id={`${startOrEnd}-day-input`}
                            name={`${startOrEnd}DateDay`}
                            type="text"
                            defaultValue={inputs?.dayInput}
                        />
                    </div>
                </div>

                <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-month-input`}>
                            Month
                        </label>
                        <input
                            className={`govuk-input govuk-date-input__input govuk-input--width-2 ${
                                errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                            id={`${startOrEnd}-month-input`}
                            name={`${startOrEnd}DateMonth`}
                            type="text"
                            defaultValue={inputs?.monthInput}
                        />
                    </div>
                </div>
                <div className="govuk-date-input__item">
                    <div className="govuk-form-group">
                        <label className="govuk-label govuk-date-input__label" htmlFor={`${startOrEnd}-year-input`}>
                            Year
                        </label>
                        <input
                            className={`govuk-input govuk-date-input__input govuk-input--width-4 ${
                                errors.length > 0 ? 'govuk-input--error' : ''
                            } `}
                            id={`${startOrEnd}-year-input`}
                            name={`${startOrEnd}DateYear`}
                            type="text"
                            defaultValue={inputs?.yearInput}
                        />
                    </div>
                </div>
            </div>
        </FormElementWrapper>
    </div>
);

export default DateSelector;
