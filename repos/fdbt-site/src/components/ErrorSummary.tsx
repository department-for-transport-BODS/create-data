import { ReactElement, PropsWithChildren } from 'react';
import { ErrorInfo } from '../interfaces';

interface ErrorSummary {
    errors: ErrorInfo[];
}

const ErrorSummary = ({ errors, children }: PropsWithChildren<ErrorSummary>): null | ReactElement => {
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
                There is a problem
            </h2>
            <div className="govuk-error-summary__body">
                <ul className="govuk-list govuk-error-summary__list">
                    {errors.map((error) => (
                        <li key={error.id}>
                            <a href={`#${error.id}`}>{error.errorMessage}</a>
                        </li>
                    ))}
                </ul>
            </div>
            {children}
        </div>
    );
};

export default ErrorSummary;
