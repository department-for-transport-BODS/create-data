import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { mockDataOperatorGroup } from '../testData/mockData';
import ReuseOperatorGroup from '../../src/pages/reuseOperatorGroup';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('reuseOperatorGroup', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <ReuseOperatorGroup errors={[]} csrfToken="" operatorGroups={[]} backHref="" />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render coorectly when one operator group is specified', () => {
            const tree = renderToFragment(
                <ReuseOperatorGroup errors={[]} csrfToken="" operatorGroups={[mockDataOperatorGroup]} backHref="" />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render errors when user does not select a radio button', () => {
            const tree = renderToFragment(
                <ReuseOperatorGroup
                    errors={[
                        {
                            errorMessage: 'Choose an operator group from the options below',
                            id: 'operatorGroup-0',
                        },
                    ]}
                    csrfToken=""
                    operatorGroups={[mockDataOperatorGroup]}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
