import { ReactElement } from 'react';
import { FEEDBACK_LINK } from '../constants';

const PhaseBanner = (): ReactElement => (
    <div className="govuk-phase-banner app-phase-banner app-width-container">
        <p className="govuk-phase-banner__content">
            <strong className="govuk-tag govuk-phase-banner__content__tag">Beta</strong>
            <span className="govuk-phase-banner__text">
                This is a new service. Help us improve it and{' '}
                <a className="govuk-link" href={FEEDBACK_LINK} id="feedback-link">
                    give your feedback (opens in new tab)
                </a>
                .
            </span>
        </p>
    </div>
);

export default PhaseBanner;
