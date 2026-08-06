import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Cookies, { CookiePreferencesProps, getServerSideProps } from '../../src/pages/cookies';
import { getMockContext } from '../testData/mockData';
import { CookiePolicy } from '../../src/interfaces';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('cookies', () => {
        it("should render correctly with the tracking cookie selection radio defaulted to 'off'", () => {
            const { container, asFragment } = render(
                <Cookies settingsSaved={false} trackingDefaultValue="off" csrfToken="" />,
            );
            expect(asFragment()).toMatchSnapshot();
            expect((container.querySelector('#accept-analytics-cookies') as HTMLInputElement).defaultChecked).toEqual(
                false,
            );
            expect((container.querySelector('#decline-analytics-cookies') as HTMLInputElement).defaultChecked).toEqual(
                true,
            );
        });

        it('should display a confirmation box when the user saves their preferences', () => {
            const tree = renderToFragment(<Cookies settingsSaved trackingDefaultValue="off" csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it("should set the tracking cookie selection radio to 'on' when the user has just saved this as their preference", () => {
            const { container, asFragment } = render(<Cookies settingsSaved trackingDefaultValue="on" csrfToken="" />);
            expect(asFragment()).toMatchSnapshot();
            expect((container.querySelector('#accept-analytics-cookies') as HTMLInputElement).defaultChecked).toEqual(
                true,
            );
            expect((container.querySelector('#decline-analytics-cookies') as HTMLInputElement).defaultChecked).toEqual(
                false,
            );
        });
    });

    describe('getServerSideProps', () => {
        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should return default props when a user first visits the page', () => {
            const ctx = getMockContext();
            const defaultProps: { props: CookiePreferencesProps } = {
                props: {
                    settingsSaved: false,
                    trackingDefaultValue: 'off',
                    csrfToken: '',
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(defaultProps);
        });

        it('should return the expected props when a user saves their preferences to allow tracking', () => {
            const mockCookiePolicy: CookiePolicy = { essential: true, usage: true };
            const ctx = getMockContext({
                cookies: { cookieSettingsSaved: 'true', cookiePolicy: mockCookiePolicy },
                query: { settingsSaved: 'true' },
            });
            const expectedProps: { props: CookiePreferencesProps } = {
                props: {
                    settingsSaved: true,
                    trackingDefaultValue: 'on',
                    csrfToken: '',
                },
            };
            const props = getServerSideProps(ctx);
            expect(props).toEqual(expectedProps);
        });
    });
});
