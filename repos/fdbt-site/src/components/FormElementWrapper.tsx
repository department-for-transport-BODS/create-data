import React, { ReactElement } from 'react';
import { ErrorInfo } from '../interfaces';

interface FormElementWrapperProps {
    errors: ErrorInfo[];
    errorId: string;
    errorClass: string;
    children: ReactElement<ErrorDecoratableProps>;
    addFormGroupError?: boolean;
    hideText?: boolean;
}

interface FormGroupWrapperProps {
    errors: ErrorInfo[];
    errorIds: string[];
    children: ReactElement;
    hideErrorBar?: boolean;
}

interface FormErrorBlockProps {
    errors: ErrorInfo[];
    errorIds: string[];
}

interface ErrorDecoratableProps {
    className?: string;
    'aria-describedby'?: string;
}

const addErrorClasses = (
    child: ReactElement<ErrorDecoratableProps>,
    errorClass: string,
    errorId: string,
): ReactElement<ErrorDecoratableProps> =>
    React.cloneElement(child, {
        className: child.props.className ? `${child.props.className} ${errorClass}` : errorClass,
        'aria-describedby': `${errorId}-error`,
    });

export const FormErrorBlock = ({ errors, errorIds }: FormErrorBlockProps): ReactElement => (
    <div>
        {errors
            .filter((error) => errorIds.includes(error.id))
            .map((error) => (
                <span className="govuk-error-message" key={error.errorMessage}>
                    <span className="govuk-visually-hidden">Error: </span>
                    {error.errorMessage}
                </span>
            ))}
    </div>
);

export const FormGroupWrapper = ({
    errors,
    errorIds,
    children,
    hideErrorBar = false,
}: FormGroupWrapperProps): ReactElement => {
    const errorForElement = errors.find((err) => errorIds.includes(err.id));

    return (
        <div className={`govuk-form-group ${errorForElement && !hideErrorBar ? 'govuk-form-group--error' : ''}`}>
            {children}
        </div>
    );
};

const FormElementWrapper = ({
    errors,
    errorId,
    errorClass,
    children,
    addFormGroupError,
    hideText,
}: FormElementWrapperProps): ReactElement => {
    const errorForElement = errors.find((err) => err.id === errorId);

    return (
        <div className={addFormGroupError && errorForElement ? 'govuk-form-group--error' : ''}>
            {errorForElement && !hideText && (
                <span id={`${errorId}-error`} className="govuk-error-message">
                    <span className="govuk-visually-hidden">Error: </span>
                    {errorForElement.errorMessage}
                </span>
            )}

            {errorForElement ? addErrorClasses(children, errorClass, errorId) : children}
        </div>
    );
};

export default FormElementWrapper;
