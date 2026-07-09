import { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';

interface WarningSummary {
    errors: ErrorInfo[];
    label: string;
}

const WarningSummary = ({ errors, label }: WarningSummary): null | ReactElement => {
    if (!errors || errors.length === 0) {
        return null;
    }

    return (
        <div
            className="govuk-error-summary"
            aria-labelledby="error-summary-title"
            role="alert"
            tabIndex={-1}
            data-module="govuk-error-summary"
        >
            <h2 className="govuk-error-summary__title" id="error-summary-title">
                {errors[0].errorMessage}
            </h2>
            <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                    <div className="govuk-checkboxes">
                        <div className="govuk-checkboxes__item">
                            <input
                                className="govuk-checkboxes__input"
                                id="bypass"
                                name="overrideWarning"
                                value="yes"
                                type="checkbox"
                            />
                            <label htmlFor="bypass" className="govuk-label govuk-checkboxes__label">
                                {label}
                            </label>
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    );
};

export default WarningSummary;
