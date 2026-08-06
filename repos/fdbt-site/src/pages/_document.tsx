import Document, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document';
import { ReactElement } from 'react';
import Header from '../layout/Header';
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE, ID_TOKEN_COOKIE } from '../constants';
import { DocumentContextWithSession, ResponseWithLocals } from '../interfaces';
import { getCsrfToken, checkIfMultipleOperators } from '../utils';
import { parseCookiesFromRequest } from '../utils/apiUtils';
import { CookieBannerMessage } from '../layout/CookieBanner';
import { getSessionAttribute } from '../utils/sessions';
import { OPERATOR_ATTRIBUTE } from '../constants/attributes';

interface DocumentProps extends DocumentInitialProps {
    nonce: string;
    isAuthed: boolean;
    csrfToken: string;
    url: string;
    showCookieBanner: boolean;
    allowTracking: boolean;
    noc: string | undefined;
    multiOperator: boolean;
}

class MyDocument extends Document<DocumentProps> {
    static async getInitialProps(ctx: DocumentContextWithSession): Promise<DocumentProps> {
        const initialProps = await Document.getInitialProps(ctx);
        const nonce = (ctx.res as ResponseWithLocals)?.locals?.nonce ?? null;
        const csrfToken = getCsrfToken(ctx);

        if (ctx.pathname !== '/') {
            ctx.res?.setHeader('X-Robots-Tag', 'none, noindex, nofollow, noimageindex, noarchive');
        }

        const url = ctx.req?.url ?? '';

        const cookies = parseCookiesFromRequest(ctx.req);
        const idTokenCookie = cookies[ID_TOKEN_COOKIE];

        const cookiePreferencesSet = cookies[COOKIE_PREFERENCES_COOKIE]
            ? JSON.parse(cookies[COOKIE_PREFERENCES_COOKIE])
            : false;
        const showCookieBanner = !cookiePreferencesSet && url !== '/cookies';
        const allowTracking = cookies[COOKIES_POLICY_COOKIE] ? JSON.parse(cookies[COOKIES_POLICY_COOKIE]).usage : false;
        const operatorAttribute = getSessionAttribute(ctx.req, OPERATOR_ATTRIBUTE);
        const nocCode = operatorAttribute?.nocCode;
        const noc = nocCode && !nocCode.includes('|') ? nocCode : undefined;
        const multiOperator = checkIfMultipleOperators(ctx);

        return {
            ...initialProps,
            nonce,
            isAuthed: !!idTokenCookie,
            csrfToken,
            url,
            showCookieBanner,
            allowTracking,
            noc,
            multiOperator,
        };
    }

    render(): ReactElement {
        return (
            <Html lang="en" className="govuk-template--rebranded app-html-class flexbox no-flexboxtweener">
                <Head nonce={this.props.nonce}>
                    {process.env.STAGE === 'prod' && (
                        <>
                            <script
                                async
                                src="https://www.googletagmanager.com/gtag/js?id=UA-173062045-1"
                                nonce={this.props.nonce}
                            />
                            <script
                                nonce={this.props.nonce}

                                dangerouslySetInnerHTML={{
                                    __html: `window['ga-disable-UA-173062045-1'] = ${!this.props.allowTracking};
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', 'UA-173062045-1', {'anonymize_ip': true});`,
                                }}
                            />
                        </>
                    )}
                </Head>
                <body className="govuk-template__body app-body-class">
                    <a href="#main-content" className="govuk-skip-link">
                        Skip to main content
                    </a>
                    <div id="js-cookie-banner" />

                    {this.props.showCookieBanner ? (
                        <div className="no-js-cookie-banner">
                            <CookieBannerMessage />
                        </div>
                    ) : null}

                    <Header
                        isAuthed={this.props.isAuthed}
                        csrfToken={this.props.csrfToken}
                        noc={this.props.noc}
                        multiOperator={this.props.multiOperator}
                    />
                    <Main />
                    <NextScript nonce={this.props.nonce} />
                    <script type="module" src="/scripts/all.bundle.js" nonce={this.props.nonce} />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
