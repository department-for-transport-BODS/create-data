import { ReactElement } from 'react';

const LoadingSpinner = (): ReactElement => (
    <div className="spinner-wrapper">
        <div className="spinner govuk-!-margin-bottom-4">
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
        </div>
        <span className="govuk-heading-s">Loading exports</span>
    </div>
);

export default LoadingSpinner;
