import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { SinglePassengerType } from '../../src/interfaces/dbTypes';
import ViewPassengerTypes from '../../src/pages/viewPassengerTypes';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/viewPassengerTypes' }) }));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('view passenger types', () => {
        it('should render correctly when no individual or group passenger types', () => {
            const tree = renderToFragment(
                <ViewPassengerTypes
                    singlePassengerTypes={[]}
                    groupPassengerTypes={[]}
                    csrfToken={''}
                    referer={null}
                    viewPassengerTypeErrors={[]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when only individual passenger types', () => {
            const passengerType = {
                id: 1,
                name: 'Regular Child',
                passengerType: {
                    id: 1,
                    passengerType: 'child',
                    ageRangeMin: '5',
                    ageRangeMax: '16',
                    proofDocuments: ['studentCard'],
                },
            };

            const tree = renderToFragment(
                <ViewPassengerTypes
                    singlePassengerTypes={[passengerType]}
                    groupPassengerTypes={[]}
                    csrfToken={''}
                    referer={'hello'}
                    viewPassengerTypeErrors={[]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when only individual passenger types, and an error', () => {
            const passengerType = {
                id: 1,
                name: 'Regular Child',
                passengerType: {
                    id: 1,
                    passengerType: 'child',
                    ageRangeMin: '5',
                    ageRangeMax: '16',
                    proofDocuments: ['studentCard'],
                },
            };

            const tree = renderToFragment(
                <ViewPassengerTypes
                    singlePassengerTypes={[passengerType]}
                    groupPassengerTypes={[]}
                    csrfToken={''}
                    referer={'hello'}
                    viewPassengerTypeErrors={[
                        {
                            errorMessage: 'You cannot delete Regular Child because it is being used in 3 products.',
                            id: 'passenger-card-0',
                        },
                    ]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when only passenger type groups', () => {
            const adultCompanion = {
                id: 1,
                passengerType: 'adult',
                maxNumber: '2',
            };

            const childCompanion = {
                id: 2,
                passengerType: 'child',
                minNumber: '0',
                maxNumber: '1',
                ageRangeMin: '4',
                ageRangeMax: '16',
                proofDocuments: ['studentCard'],
            };

            const passengerTypeGroup = {
                groupPassengerType: {
                    name: 'family group',
                    maxGroupSize: '3',
                    companions: [adultCompanion, childCompanion],
                },
                name: 'family group',
                id: 0,
            };

            const tree = renderToFragment(
                <ViewPassengerTypes
                    singlePassengerTypes={[]}
                    groupPassengerTypes={[passengerTypeGroup]}
                    csrfToken={''}
                    referer={null}
                    viewPassengerTypeErrors={[]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when groups and individual passenger types', () => {
            const passengerTypes: SinglePassengerType[] = [
                {
                    id: 1,
                    name: 'Regular Child',
                    passengerType: {
                        id: 1,
                        passengerType: 'child',
                        ageRangeMin: '5',
                        ageRangeMax: '16',
                        proofDocuments: ['studentCard'],
                    },
                },
            ];

            const adultCompanion = {
                id: 1,
                passengerType: 'adult',
                maxNumber: '2',
            };

            const childCompanion = {
                id: 2,
                passengerType: 'child',
                maxNumber: '1',
                ageRangeMin: '4',
                ageRangeMax: '16',
                proofDocuments: ['studentCard'],
            };

            const passengerTypeGroups = [
                {
                    id: 3,
                    name: 'family group',
                    groupPassengerType: {
                        name: 'family group',
                        maxGroupSize: '3',
                        companions: [adultCompanion, childCompanion],
                    },
                },
            ];

            const tree = renderToFragment(
                <ViewPassengerTypes
                    singlePassengerTypes={passengerTypes}
                    groupPassengerTypes={passengerTypeGroups}
                    csrfToken={''}
                    referer={'hello'}
                    viewPassengerTypeErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
