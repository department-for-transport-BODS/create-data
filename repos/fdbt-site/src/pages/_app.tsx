import '../design/main.scss';
import { AppProps } from 'next/app';
import { ReactElement, useEffect, useRef } from 'react';

declare global {
    interface Window {
        GOVUKFrontend: {
            initAll: () => void;
        };
    }
}

const MyApp = ({ Component, pageProps }: AppProps): ReactElement => {
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;

            const bodyElement = document.getElementsByTagName('body')[0];
            bodyElement.classList.add('js-enabled');

            if ('noModule' in HTMLScriptElement.prototype) {
                bodyElement.classList.add('govuk-frontend-supported');
            }

            if (typeof window !== 'undefined' && window.GOVUKFrontend) {
                window.GOVUKFrontend.initAll();
            }
        }
    }, []);

    return <Component {...pageProps} />;
};

export default MyApp;
