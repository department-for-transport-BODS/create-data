import { FunctionComponent } from 'react';

export const GlobalSettingReturnHeader: FunctionComponent = () => (
    <div className="govuk-warning-text govuk-width-container govuk-!-margin-bottom-0">
        <div
            className="govuk-notification-banner govuk-grid-row govuk-!-margin-top-5 govuk-!-margin-bottom-0"
            role="region"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
        >
            <div className="govuk-notification-banner__header" />
            <div className="govuk-notification-banner__content global-settings-return-banner">
                <p className="govuk-heading-s govuk-!-margin-0" id="govuk-notification-banner-title">
                    Once you&apos;ve made your changes you can return to your fare creation.
                </p>
                <a href={`/globalSettingsRedirect`} className="govuk-button govuk-button--secondary">
                    Back
                </a>
            </div>
        </div>
    </div>
);
