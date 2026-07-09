import * as React from 'react';
import { shallow } from 'enzyme';
import AccountDetails, { getServerSideProps } from '../../src/pages/account';
import { getMockContext } from '../testData/mockData';
import * as cognito from '../../src/data/cognito';

jest.mock('../../src/data/cognito');

describe('pages', () => {
    describe('account', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <AccountDetails
                    emailAddress="joseppo.bloggo@somefakebuscompany.com"
                    nocCode="FaBusCo|foo|bar"
                    csrfToken="token"
                    multiOperatorEmailPreference={false}
                    errors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with errors', () => {
            const tree = shallow(
                <AccountDetails
                    emailAddress="joseppo.bloggo@somefakebuscompany.com"
                    nocCode="FaBusCo|foo|bar"
                    csrfToken="token"
                    multiOperatorEmailPreference={false}
                    errors={[
                        {
                            id: 'radio-multi-op-email-pref',
                            errorMessage: 'There was a problem updating email preference',
                        },
                    ]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        const getUserAttributeSpy = jest.spyOn(cognito, 'getUserAttribute');

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('throws an error if there is no ID_TOKEN cookie', async () => {
            const ctx = getMockContext({ isLoggedin: false });

            await expect(getServerSideProps(ctx)).rejects.toThrow(
                'Necessary attributes not found to show account details',
            );
            expect(getUserAttributeSpy).not.toHaveBeenCalled();
        });

        it('throws an error when the user email address or noc code is missing from the ID_TOKEN cookie', async () => {
            const ctx = getMockContext({
                cookies: {
                    idToken:
                        'eyJhbGciOiJIUzI1NiJ9.eyJjdXN0b206bm9jIjoiVEVTVCJ9.Hgdqdw7HX8cNT9NG7jcPP7ihZWHT1TYgPJyQNpKS8YQ',
                },
            });

            await expect(getServerSideProps(ctx)).rejects.toThrow(
                'Could not extract the user email address and/or noc code from their ID token',
            );
            expect(getUserAttributeSpy).not.toHaveBeenCalled();
        });

        it('returns email preference from cognito if env is not local', async () => {
            getUserAttributeSpy.mockResolvedValueOnce(Promise.resolve('true'));
            const ctx = getMockContext({ requestHeaders: { host: 'www.test.com' } });

            await expect(getServerSideProps(ctx)).resolves.toEqual({
                props: {
                    csrfToken: '',
                    emailAddress: 'test@example.com',
                    errors: [],
                    multiOperatorEmailPreference: true,
                    nocCode: 'TEST',
                },
            });
            expect(getUserAttributeSpy).toHaveBeenCalledWith('test@example.com', 'custom:multiOpEmailEnabled');
        });

        it('returns email preference as false if attribute does not exist', async () => {
            getUserAttributeSpy.mockResolvedValueOnce(Promise.resolve(null));
            const ctx = getMockContext({ requestHeaders: { host: 'www.test.com' } });

            await expect(getServerSideProps(ctx)).resolves.toEqual({
                props: {
                    csrfToken: '',
                    emailAddress: 'test@example.com',
                    errors: [],
                    multiOperatorEmailPreference: false,
                    nocCode: 'TEST',
                },
            });
            expect(getUserAttributeSpy).toHaveBeenCalledWith('test@example.com', 'custom:multiOpEmailEnabled');
        });
    });
});
