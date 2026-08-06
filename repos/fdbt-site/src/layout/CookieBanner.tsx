import Cookies from 'js-cookie';
import React, { ReactElement, useEffect, useState } from 'react';
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, oneYearInSeconds } from '../constants';

interface CookieBannerMessageProps {
    handleClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const CookieBannerMessage = ({ handleClick }: CookieBannerMessageProps): ReactElement => (
    <div id="global-cookie-message" className="govuk-cookie-banner" role="region" aria-label="cookie banner">
        <div className="govuk-width-container">
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-cookie-banner__content">
                        <h2 className="govuk-heading-m">Tell us whether you accept cookies</h2>
                        <p className="govuk-body">
                            We use&nbsp;
                            <a className="govuk-link" href="/cookieDetails">
                                cookies to collect information
                            </a>
                            &nbsp; about how you use the Create Fares Data Service. We use this information to make the
                            website work as well as possible and to improve the service.
                        </p>
                    </div>
                    <div className="govuk-button-group">
                        {handleClick && (
                            <div>
                                <button
                                    className="govuk-button "
                                    id="accept-all-button"
                                    data-module="govuk-button"
                                    type="button"
                                    onClick={handleClick}
                                >
                                    Accept All
                                </button>
                            </div>
                        )}

                        <div>
                            <a id="set-cookie-preferences-link" className="govuk-button " role="button" href="/cookies">
                                Set cookie preferences
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const CookieBanner = (): ReactElement | null => {
    const [cookiesAccepted, setCookiesAccepted] = useState(false);
    const [hideBanner, setHideBanner] = useState(true);

    useEffect(() => {
        const cookiePreferences = Cookies.get(COOKIE_PREFERENCES_COOKIE);

        if (!cookiePreferences || cookiePreferences === 'false') {
            setHideBanner(false);
        }
    });

    const handleAcceptAllClick = (): void => {
        const cookieOptions: Cookies.CookieAttributes = {
            expires: oneYearInSeconds / 86400,
            sameSite: 'strict',
            secure: process.env.NODE_ENV !== 'development',
            path: '/',
        };

        Cookies.set(COOKIE_PREFERENCES_COOKIE, 'true', cookieOptions);
        Cookies.set(COOKIES_POLICY_COOKIE, JSON.stringify({ essential: true, usage: true }), cookieOptions);

        setCookiesAccepted(true);
    };

    const handleHideClick = (): void => {
        setHideBanner(true);
    };

    if (hideBanner) {
        return null;
    }

    if (cookiesAccepted) {
        return (
            <div id="cookies-accepted-message" className="govuk-cookie-banner" role="region" aria-label="cookie banner">
                <div className="govuk-cookie-banner__message govuk-width-container">
                    <div className="govuk-grid-row">
                        <div className="govuk-grid-column-two-thirds">
                            <div className="govuk-cookie-banner__content">
                                <p className="govuk-body">
                                    You’ve accepted all cookies. You can{' '}
                                    <a className="govuk-link" href="/cookies">
                                        change your cookie settings
                                    </a>{' '}
                                    at any time.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="govuk-button-group">
                        <button className="govuk-button" type="button" onClick={handleHideClick}>
                            Hide
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <CookieBannerMessage handleClick={handleAcceptAllClick} />;
};

export default CookieBanner;
