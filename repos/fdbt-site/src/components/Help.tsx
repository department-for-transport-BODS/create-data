import { ReactElement } from 'react';

const Help = (): ReactElement => {
    return (
        <div>
            <h2 className="govuk-heading-s">Help and Support</h2>
            <p className="govuk-body">
                If you are having problems, please contact the Create Fares Data Service via this link:{' '}
                <a href="/contact" className="govuk-link govuk-!-font-size-19">
                    Contact us
                </a>
            </p>
        </div>
    );
};

export default Help;
