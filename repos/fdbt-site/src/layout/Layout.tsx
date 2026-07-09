import Head from 'next/head';
import { PropsWithChildren, ReactElement, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Help from '../components/Help';
import { ErrorInfo } from '../interfaces';
import { buildTitle } from '../utils';
import CookieBanner from './CookieBanner';
import Footer from './Footer';
import { GlobalSettingReturnHeader } from './GlobalSettingReturnHeader';
import Navigation from './Navigation';
import PhaseBanner from './PhaseBanner';

interface LayoutProps {
    title: string;
    description: string;
    errors?: ErrorInfo[];
    hideCookieBanner?: boolean;
    showNavigation?: boolean;
    hideHelp?: boolean;
    referer?: string | null;
}

const favicon = '/images/favicon.ico';

export const BaseLayout = ({
    title,
    description,
    errors = [],
    children,
    hideCookieBanner,
    showNavigation,
    hideHelp,
    referer,
}: PropsWithChildren<LayoutProps>): ReactElement => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        setShowBanner(true);
    }, [setShowBanner]);

    let element = null;
    if (typeof document !== 'undefined') {
        element = document.getElementById('js-cookie-banner');
    }

    return (
        <>
            <Head>
                <link rel="shortcut icon" href={favicon} />
                <title>{buildTitle(errors, title || 'Create Fares Data')}</title>
                <meta name="description" content={description || 'Create Fares Data'} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta charSet="utf-8" />
            </Head>

            {!hideCookieBanner && showBanner && element && <div>{createPortal(<CookieBanner />, element)}</div>}
            <PhaseBanner />

            {showNavigation && <Navigation />}

            {referer && <GlobalSettingReturnHeader />}

            <div className="govuk-width-container">
                <main className="govuk-main-wrapper" id="main-content">
                    {children}
                </main>
                {!hideHelp && <Help />}
            </div>
            <Footer />
        </>
    );
};

export const FullColumnLayout = ({
    title,
    description,
    errors = [],
    children,
    hideCookieBanner = false,
    hideHelp = false,
}: PropsWithChildren<LayoutProps>): ReactElement => (
    <BaseLayout
        title={title}
        description={description}
        errors={errors}
        hideCookieBanner={hideCookieBanner}
        hideHelp={hideHelp}
    >
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">{children}</div>
        </div>
    </BaseLayout>
);

export const TwoThirdsLayout = ({
    title,
    description,
    errors = [],
    children,
    hideCookieBanner = false,
    hideHelp = false,
}: PropsWithChildren<LayoutProps>): ReactElement => (
    <BaseLayout
        title={title}
        description={description}
        errors={errors}
        hideCookieBanner={hideCookieBanner}
        hideHelp={hideHelp}
    >
        <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">{children}</div>
        </div>
    </BaseLayout>
);

export default TwoThirdsLayout;
