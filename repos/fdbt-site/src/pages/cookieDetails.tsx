import { ReactElement } from 'react';
import TwoThirdsLayout from '../layout/Layout';

const title = 'Cookie details - Create Fares Data Service';
const description = 'Cookie details page for the Create Fares Data Service';

const Contact = (): ReactElement => {
    return (
        <TwoThirdsLayout title={title} description={description}>
            <h1 className="govuk-heading-xl">Details about cookies on the Create Fares Data Service</h1>
            <p className="govuk-body">
                The Create Fares Data Service puts small files (known as ‘cookies’) onto your computer to collect
                information about how you browse the site. Find out more about the cookies we use, what they’re for and
                when they expire.
            </p>
            <h2 className="govuk-heading-m">Tracking</h2>
            <p className="govuk-body">
                We use Google Analytics software (Universal Analytics) to collect anonymised information about how you
                use the Create Fares Data Service. We do this to help make sure the site is meeting the needs of its
                users and to help us make improvements to the site and to government digital services.
            </p>
            <p className="govuk-body">We do not allow Google to use or share the data about how you use this site.</p>
            <ul className="govuk-list govuk-list--bullet govuk-body">
                <li>how you got to the site</li>
                <li>the pages you visit on GOV.UK and how long you spend on them</li>
                <li>what you click on while you’re visiting the site</li>
            </ul>
            <p className="govuk-body">Google Analytics sets the following cookies.</p>
            <table className="govuk-table cookie-detail-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">_ga</td>
                        <td className="govuk-table__cell">
                            These help us count how many people visit the Create Fares Data Service by tracking if
                            you’ve visited before
                        </td>
                        <td className="govuk-table__cell">2 years</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">_gid</td>
                        <td className="govuk-table__cell">
                            These help us count how many people visit the Create Fares Data Service by tracking if
                            you’ve visited before
                        </td>
                        <td className="govuk-table__cell">24 hours</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">_gat</td>
                        <td className="govuk-table__cell">
                            Used to manage the rate at which page view requests are made
                        </td>
                        <td className="govuk-table__cell">1 minute</td>
                    </tr>
                </tbody>
            </table>
            <h2 className="govuk-heading-m">Strictly necessary cookies</h2>
            <h3 className="govuk-heading-s">Progress through the tool</h3>
            <p className="govuk-body">
                When you use the Create Fares Data Service we will set the following cookies as you progress through the
                forms.
            </p>
            <table className="govuk-table cookie-detail-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-operator</td>
                        <td className="govuk-table__cell">Stores the logged in operator name and NOC</td>
                        <td className="govuk-table__cell">When you close your browser or sign out</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-user</td>
                        <td className="govuk-table__cell">Set to store validation information for user</td>
                        <td className="govuk-table__cell">When you close your browser</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-reset-password</td>
                        <td className="govuk-table__cell">
                            Set to store validation information when resetting password
                        </td>
                        <td className="govuk-table__cell">When you close your browser</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">_csrf</td>
                        <td className="govuk-table__cell">Used to secure form submissions</td>
                        <td className="govuk-table__cell">When you close your browser</td>
                    </tr>
                </tbody>
            </table>
            <h3 className="govuk-heading-s">Remembering who you are</h3>
            <p className="govuk-body">
                When you have logged into the service we use cookies to keep track of who you are until you log out or
                the session ends automatically.
            </p>
            <table className="govuk-table cookie-detail-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-id-token</td>
                        <td className="govuk-table__cell">Stores information about your session</td>
                        <td className="govuk-table__cell">When you close your browser or sign out</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-refresh-token</td>
                        <td className="govuk-table__cell">Allows your session to be extended while using the tool</td>
                        <td className="govuk-table__cell">When you close your browser or sign out</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">connect.sid</td>
                        <td className="govuk-table__cell">Stores a session ID</td>
                        <td className="govuk-table__cell">When you close your browser</td>
                    </tr>
                </tbody>
            </table>
            <h3 className="govuk-heading-s">Cookies message</h3>
            <p className="govuk-body">
                You may see a banner when you visit GOV.UK inviting you to accept cookies or review your settings. We’ll
                set cookies so that your computer knows you’ve seen it and not to show it again, and also to store your
                settings.
            </p>
            <table className="govuk-table cookie-detail-table">
                <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">
                            Name
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Purpose
                        </th>
                        <th scope="col" className="govuk-table__header">
                            Expires
                        </th>
                    </tr>
                </thead>
                <tbody className="govuk-table__body">
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-cookies-policy</td>
                        <td className="govuk-table__cell">Saves your cookie consent settings</td>
                        <td className="govuk-table__cell">1 year</td>
                    </tr>
                    <tr className="govuk-table__row">
                        <td className="govuk-table__cell">fdbt-cookie-preferences-set</td>
                        <td className="govuk-table__cell">
                            Lets us know that you’ve saved your cookie consent settings
                        </td>
                        <td className="govuk-table__cell">1 year</td>
                    </tr>
                </tbody>
            </table>
            <h2 className="govuk-heading-m">Change your settings</h2>
            <p className="govuk-body">
                You can{' '}
                <a className="govuk-link" href="/cookies">
                    change which cookies you’re happy for us to use
                </a>
                .
            </p>
        </TwoThirdsLayout>
    );
};

export const getServerSideProps = (): object => {
    return { props: {} };
};

export default Contact;
