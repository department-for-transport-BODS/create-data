import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { OperatorGroup } from '../../src/interfaces';
import ViewOperatorGroups from '../../src/pages/viewOperatorGroups';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/viewOperatorGroups' }) }));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('view operator groups', () => {
        it('should render correctly when no operator groups', () => {
            const tree = renderToFragment(
                <ViewOperatorGroups operatorGroups={[]} csrfToken={''} referer={null} viewOperatorGroupErrors={[]} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly on operator group', () => {
            const operatorGroup: OperatorGroup = {
                id: 1,
                name: 'first operator group',
                operators: [
                    {
                        name: 'First operator',
                        nocCode: 'FOP',
                    },
                ],
            };

            const tree = renderToFragment(
                <ViewOperatorGroups
                    operatorGroups={[operatorGroup]}
                    csrfToken={''}
                    referer={'hello'}
                    viewOperatorGroupErrors={[]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
