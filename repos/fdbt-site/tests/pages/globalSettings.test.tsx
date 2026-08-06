import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import GlobalSettings from '../../src/pages/globalSettings';
import { GlobalSettingsCounts } from '../../src/interfaces';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/globalSettings' }),
}));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('globalSettings', () => {
        it('should render correctly', () => {
            const globalSettingsCounts: GlobalSettingsCounts = {
                capCount: 0,
                passengerTypesCount: 0,
                timeRestrictionsCount: 3,
                purchaseMethodsCount: 7,
                fareDayEndSet: true,
                operatorDetailsSet: true,
                operatorGroupsCount: 2,
            };
            const tree = renderToFragment(
                <GlobalSettings globalSettingsCounts={globalSettingsCounts} referer="hello" />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
