import { ReactElement } from 'react';
import { BaseLayout } from '../layout/Layout';

const title = 'Create Fares Data';
const description = 'Create Fares Data is a service that allows you to generate data in NeTEx format';

const Start = (): ReactElement => (
    <BaseLayout title={title} description={description}>
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
                <h1 className="govuk-heading-xl">Create fares data</h1>

                <p className="govuk-body">
                    This service is for creating or accessing NeTEx data for public transport services, excluding rail,
                    in England. The service can be used by:
                </p>

                <ul className="govuk-list govuk-list--bullet">
                    <li>Bus operators running commercial services in England</li>
                    <li>Local transport authorities acting on behalf of bus operators</li>
                    <li>Local transport authorities that operate their own services</li>
                </ul>

                <p className="govuk-body">Use this service to:</p>

                <ul className="govuk-list govuk-list--bullet">
                    <li>Generate fares data in NeTEx format for a new or existing service</li>
                    <li>Download your own fares data</li>
                </ul>
                <p className="govuk-body">
                    All service data is taken directly from the Traveline National Data Set and the NaPTAN database. To
                    avoid data discrepancies, ensure that all service data is correct within these datasets before using
                    the service.
                </p>

                <a
                    href="/home"
                    role="button"
                    draggable="false"
                    className="govuk-button govuk-button--start"
                    data-module="govuk-button"
                    id="start-now-button"
                >
                    Start now
                    <svg
                        className="govuk-button__start-icon"
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.5"
                        height="19"
                        viewBox="0 0 33 40"
                        role="presentation"
                        focusable="false"
                    >
                        <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
                    </svg>
                </a>
            </div>
            <div className="govuk-grid-column-one-thirds">
                <h2 className="govuk-heading-m">Public information</h2>
                <a className="govuk-link govuk-body" href="/changelog">
                    Service changelog
                </a>
            </div>
        </div>
    </BaseLayout>
);

export const getServerSideProps = (): { props: {} } => ({
    props: {},
});

export default Start;
