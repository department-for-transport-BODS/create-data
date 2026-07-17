import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import SelectPassengerType from '../../src/pages/selectPassengerType';
import { FullGroupPassengerType, SinglePassengerType } from '../../src/interfaces/dbTypes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    const savedGroups: FullGroupPassengerType[] = [
        {
            id: 1,
            name: 'family',
            groupPassengerType: {
                name: 'family',
                maxGroupSize: '3',
                companions: [
                    {
                        id: 1,
                        name: 'adult',
                        passengerType: 'adult',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '75',
                        proofDocuments: [],
                    },
                    {
                        id: 2,
                        name: 'kid',
                        passengerType: 'child',
                        minNumber: '1',
                        maxNumber: '2',
                        ageRangeMin: '5',
                        ageRangeMax: '17',
                        proofDocuments: [],
                    },
                ],
            },
        },
        {
            id: 4,
            name: 'couple',
            groupPassengerType: {
                name: 'couple',
                maxGroupSize: '2',
                companions: [
                    {
                        id: 1,
                        name: 'adult',
                        passengerType: 'adult',
                        minNumber: '2',
                        maxNumber: '2',
                        ageRangeMin: '18',
                        ageRangeMax: '75',
                        proofDocuments: [],
                    },
                ],
            },
        },
    ];
    const savedPassengerTypes: SinglePassengerType[] = [
        {
            id: 3,
            name: 'adult',
            passengerType: {
                id: 3,
                passengerType: 'adult',
                ageRangeMin: '18',
                ageRangeMax: '75',
                proofDocuments: [],
            },
        },
        {
            name: 'kid',
            id: 2,
            passengerType: {
                id: 2,
                passengerType: 'child',
                ageRangeMin: '5',
                ageRangeMax: '17',
                proofDocuments: [],
            },
        },
    ];

    describe('selectPassengerType', () => {
        it('should render correctly with saved groups and saved passenger types', () => {
            const tree = renderToFragment(
                <SelectPassengerType
                    errors={[]}
                    csrfToken="csrf"
                    savedGroups={savedGroups}
                    savedPassengerTypes={savedPassengerTypes}
                    selectedId={1}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with saved groups and saved passenger types and errors', () => {
            const tree = renderToFragment(
                <SelectPassengerType
                    errors={[{ errorMessage: 'Select a passenger type', id: 'individual-passengers' }]}
                    csrfToken="csrf"
                    savedGroups={savedGroups}
                    savedPassengerTypes={savedPassengerTypes}
                    selectedId={null}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with no saved groups and saved passenger types', () => {
            const tree = renderToFragment(
                <SelectPassengerType
                    errors={[]}
                    csrfToken="csrf"
                    savedGroups={[]}
                    savedPassengerTypes={savedPassengerTypes}
                    selectedId={null}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly with no saved groups and no saved passenger types', () => {
            const tree = renderToFragment(
                <SelectPassengerType
                    errors={[]}
                    csrfToken="csrf"
                    savedGroups={[]}
                    savedPassengerTypes={[]}
                    selectedId={null}
                    backHref=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
