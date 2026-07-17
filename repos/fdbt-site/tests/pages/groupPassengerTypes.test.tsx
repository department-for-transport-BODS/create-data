import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import GroupPassengerTypes from '../../src/pages/groupPassengerTypes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('groupPassengerTypes', () => {
        it('should render correctly with no GroupPassengerTypes', () => {
            const tree = renderToFragment(
                <GroupPassengerTypes
                    groupPassengerInfo={{
                        passengerTypes: [],
                    }}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with GroupPassengerTypes and errors (GroupPassengerTypesWithErrors)', () => {
            const tree = renderToFragment(
                <GroupPassengerTypes
                    groupPassengerInfo={{
                        errors: [
                            {
                                errorMessage: 'Choose one or two passenger types - you cannot exceed this limit',
                                id: '',
                            },
                        ],
                    }}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with group info and no errors', () => {
            const tree = renderToFragment(
                <GroupPassengerTypes
                    groupPassengerInfo={{
                        passengerTypes: ['adult', 'child'],
                    }}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
