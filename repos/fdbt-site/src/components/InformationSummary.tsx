import { ReactElement } from 'react';

interface InformationSummaryProps {
    informationText: string;
    informationLinkText?: string;
    informationLinkHref?: string;
}

const InformationSummary = ({
    informationText,
    informationLinkText,
    informationLinkHref,
}: InformationSummaryProps): ReactElement => {
    return (
        <div
            className="govuk-notification-banner"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div className="govuk-notification-banner__header">
                <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                    Important
                </h2>
            </div>
            <div className="govuk-notification-banner__content">
                <p className="govuk-notification-banner__heading">{informationText}</p>
                {informationLinkText && informationLinkHref && (
                    <a className="govuk-link" href={informationLinkHref}>
                        {informationLinkText}
                    </a>
                )}
            </div>
        </div>
    );
};

export default InformationSummary;
