import { getMockContext } from '../testData/mockData';
import MyDocument from '../../src/pages/_document';
import { COOKIES_POLICY_COOKIE, COOKIE_PREFERENCES_COOKIE } from '../../src/constants';
import { OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { DocumentContextWithSession } from '../../src/interfaces';

jest.mock('next/document', () => ({
    __esModule: true,
    default: class Document {
        static getInitialProps() {
            return Promise.resolve({ html: '', head: [], styles: [] });
        }
    },
}));

describe('_document', () => {
    describe('getInitialProps', () => {
        const getInitialProps = (ctx: ReturnType<typeof getMockContext>) =>
            MyDocument.getInitialProps(ctx as unknown as DocumentContextWithSession);

        it('marks the user as authed when an ID token cookie is present', async () => {
            const props = await getInitialProps(getMockContext({ isLoggedin: true }));
            expect(props.isAuthed).toBe(true);
        });

        it('marks the user as not authed when there is no ID token cookie', async () => {
            const props = await getInitialProps(getMockContext({ isLoggedin: false }));
            expect(props.isAuthed).toBe(false);
        });

        it('shows the cookie banner when no cookie preferences have been set', async () => {
            const props = await getInitialProps(getMockContext());
            expect(props.showCookieBanner).toBe(true);
        });

        it('hides the cookie banner when the cookie preferences cookie is set', async () => {
            const props = await getInitialProps(
                getMockContext({ requestHeaders: { cookie: `${COOKIE_PREFERENCES_COOKIE}=true` } }),
            );
            expect(props.showCookieBanner).toBe(false);
        });

        it('reads allowTracking from the usage flag of the cookies policy', async () => {
            const props = await getInitialProps(
                getMockContext({
                    requestHeaders: {
                        cookie: `${COOKIES_POLICY_COOKIE}=${encodeURIComponent(
                            JSON.stringify({ essential: true, usage: true }),
                        )}`,
                    },
                }),
            );
            expect(props.allowTracking).toBe(true);
        });

        it('returns the noc when it does not contain a pipe', async () => {
            const props = await getInitialProps(
                getMockContext({ session: { [OPERATOR_ATTRIBUTE]: { name: 'test', nocCode: 'TEST' } } }),
            );
            expect(props.noc).toBe('TEST');
        });

        it('returns undefined for the noc when it contains a pipe (multiple nocs)', async () => {
            const props = await getInitialProps(
                getMockContext({ session: { [OPERATOR_ATTRIBUTE]: { name: 'test', nocCode: 'TEST|OTHER' } } }),
            );
            expect(props.noc).toBeUndefined();
        });

        it('sets a noindex X-Robots-Tag header for non-root pages', async () => {
            const ctx = getMockContext();
            await getInitialProps(ctx);
            expect(ctx.res?.getHeader('X-Robots-Tag')).toBe('none, noindex, nofollow, noimageindex, noarchive');
        });
    });
});
