import { ReactElement } from 'react';
import { COOKIES_POLICY_COOKIE } from '../constants';
import { getCsrfToken } from '../utils';
import { parseCookiesFromRequest } from '../utils/apiUtils';
import CsrfForm from '../components/CsrfForm';
import { NextPageContextWithSession } from '../interfaces';
import { TwoThirdsLayout } from '../layout/Layout';

const title = 'Cookies - Create Fares Data Service';
const description = 'Cookies Preferences page of the Create Fares Data Service';

export interface CookiePreferencesProps {
    settingsSaved: boolean;
    trackingDefaultValue: 'on' | 'off';
    csrfToken: string;
}

const Cookies = ({ settingsSaved, trackingDefaultValue, csrfToken }: CookiePreferencesProps): ReactElement => (
    <TwoThirdsLayout title={title} description={description} hideCookieBanner>
        {settingsSaved ? (
            <div className="information_box__success">
                <h2 className="govuk-heading-m">Your cookie settings were saved</h2>
                <p className="govuk-body">Return to this page at any point to change your cookie settings.</p>
                <p className="govuk-body">
                    <a href="/home">Click here to return to the homepage.</a>
                </p>
            </div>
        ) : null}
        <div className="govuk-!-margin-bottom-8">
            <h1 className="govuk-heading-l">Cookies on the Create Fares Data Service</h1>
        </div>
        <p className="govuk-body">
            Cookies are files saved on your phone, tablet or computer when you visit a website.
        </p>
        <p className="govuk-body">
            We use cookies to store information about how you use the Create Fares Data website, such as the pages you
            visit.
        </p>
        <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Cookie Settings</h2>
        <div className="cookie-settings__form-wrapper">
            <p className="govuk-body">
                We use 2 types of cookie. You can choose which cookies you&apos;re happy for us to use.
            </p>
            <CsrfForm action="/api/cookies" method="post" csrfToken={csrfToken}>
                <>
                    <div className="govuk-form-group">
                        <fieldset className="govuk-fieldset" aria-describedby="analytics-cookies-hint">
                            <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                                <h2 className="govuk-fieldset__heading">Cookies that measure website use</h2>
                            </legend>
                            <div id="analytics-cookies-hint" className="govuk-hint govuk-!-margin-bottom-3">
                                <p className="govuk-body govuk-hint">
                                    We use Google Analytics to measure how you use the website so we can improve it
                                    based on user needs. We do not allow Google to use or share the data about how you
                                    use this site.
                                </p>
                                <p className="govuk-body govuk-hint">
                                    Google Analytics sets cookies that store anonymised information about:
                                </p>
                                <ul className="govuk-list govuk-list--bullet govuk-hint">
                                    <li>how you got to the site</li>
                                    <li>
                                        the pages you visit on the Create Fares Data Service, and how long you spend on
                                        each page
                                    </li>
                                    <li>what you click on while you&apos;re visiting the site</li>
                                </ul>
                            </div>
                            <div className="govuk-radios">
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        type="radio"
                                        id="accept-analytics-cookies"
                                        name="tracking"
                                        value="on"
                                        defaultChecked={trackingDefaultValue === 'on'}
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="accept-analytics-cookies"
                                    >
                                        Use cookies that measure my website use
                                    </label>
                                </div>
                                <div className="govuk-radios__item">
                                    <input
                                        className="govuk-radios__input"
                                        type="radio"
                                        id="decline-analytics-cookies"
                                        name="tracking"
                                        value="off"
                                        defaultChecked={trackingDefaultValue === 'off'}
                                    />
                                    <label
                                        className="govuk-label govuk-radios__label"
                                        htmlFor="decline-analytics-cookies"
                                    >
                                        Do not use cookies that measure my website use
                                    </label>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div>
                        <h2 className="govuk-heading-m">Strictly necessary cookies</h2>
                        <p className="govuk-body">These essential cookies are used to remember your progress.</p>
                        <p className="govuk-body">They always need to be on.</p>
                        <p className="govuk-link govuk-!-font-size-19">
                            <a className="govuk-link govuk-!-font-size-19" href="/cookieDetails">
                                Find out more about our usage of cookies in our cookie policy
                            </a>
                        </p>
                    </div>
                    <input
                        type="submit"
                        value="Save Changes"
                        id="save-cookie-preferences-button"
                        className="govuk-button"
                    />
                </>
            </CsrfForm>
        </div>
    </TwoThirdsLayout>
);

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: CookiePreferencesProps } => {
    const csrfToken = getCsrfToken(ctx);
    const cookies = parseCookiesFromRequest(ctx.req);

    const settingsSaved = (ctx.query?.settingsSaved ?? 'false') === 'true';

    const tracking = cookies[COOKIES_POLICY_COOKIE] ? JSON.parse(cookies[COOKIES_POLICY_COOKIE]).usage : false;

    const trackingDefaultValue = tracking ? 'on' : 'off';

    return { props: { settingsSaved, trackingDefaultValue, csrfToken } };
};

export default Cookies;
