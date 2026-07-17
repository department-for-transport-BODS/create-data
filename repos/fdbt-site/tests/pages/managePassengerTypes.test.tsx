import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ManagePassengerTypes from '../../src/pages/managePassengerTypes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('manage passenger types', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <ManagePassengerTypes editMode={false} csrfToken={''} errors={[]} inputs={undefined} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode', () => {
            const inputs = {
                id: 3,
                name: 'best adult',
                passengerType: {
                    id: 3,
                    passengerType: 'adult',
                },
            };

            const tree = renderToFragment(<ManagePassengerTypes editMode csrfToken={''} errors={[]} inputs={inputs} />);

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on passenger type form group when passenger type not selected', () => {
            const errors = [{ id: 'type', errorMessage: 'You must select a passenger type' }];

            const inputs = {
                name: 'Regular Adult',
                id: 0,
                passengerType: {
                    id: 0,
                    passengerType: 'Regular Adult',
                    ageRangeMin: '15',
                    ageRangeMax: '65',
                },
            };

            const tree = renderToFragment(
                <ManagePassengerTypes editMode={false} csrfToken={''} errors={errors} inputs={inputs} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on name form group when name input left blank', () => {
            const errors = [{ id: 'name', errorMessage: 'You must provide a name' }];

            const inputs = {
                name: '',
                id: 0,
                passengerType: {
                    id: 0,
                    passengerType: 'child',
                    ageRangeMin: '4',
                    ageRangeMax: '15',
                    proofDocuments: ['studentCard'],
                },
            };

            const tree = renderToFragment(
                <ManagePassengerTypes editMode={false} csrfToken={''} errors={errors} inputs={inputs} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render update passenger type button when in edit mode', () => {
            const inputs = {
                id: 1,
                name: 'Regular child',
                passengerType: {
                    id: 1,
                    passengerType: 'child',
                    ageRangeMin: '4',
                    ageRangeMax: '15',
                    proofDocuments: ['studentCard'],
                },
            };

            const tree = renderToFragment(
                <ManagePassengerTypes editMode={false} csrfToken={''} errors={[]} inputs={inputs} />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
