import { ReactElement } from 'react';

interface ContactProps {
    supportEmail: string;
}

const AccessibilityDetails = ({ supportEmail }: ContactProps): ReactElement => (
    <details className="govuk-details margin-top">
        <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">Request an accessible format.</span>
        </summary>
        <div className="govuk-details__text">
            If you use assistive technology (such as a screen reader) and need a version of this document in a more
            accessible format, please email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. Please tell us what
            format you need. It will help us if you say what assistive technology you use.
        </div>
    </details>
);

export default AccessibilityDetails;
