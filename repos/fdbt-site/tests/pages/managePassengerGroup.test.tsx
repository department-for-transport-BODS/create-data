import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ManagePassengerGroup from '../../src/pages/managePassengerGroup';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('managePassengerGroup', () => {
        it('should render correctly on first opening of page', () => {
            const tree = renderToFragment(
                <ManagePassengerGroup
                    csrfToken={''}
                    errors={[]}
                    editMode={false}
                    passengers={[
                        {
                            id: 1,
                            name: 'Normal Adult',
                            passengerType: {
                                id: 1,
                                passengerType: 'adult',
                                proofDocuments: [],
                                ageRangeMin: '18',
                                ageRangeMax: '75',
                            },
                        },
                        {
                            id: 2,
                            name: 'Normal child',
                            passengerType: {
                                id: 2,
                                passengerType: 'child',
                                proofDocuments: [],
                                ageRangeMin: '5',
                                ageRangeMax: '13',
                            },
                        },
                    ]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly after errors are made and page rerenders', () => {
            const tree = renderToFragment(
                <ManagePassengerGroup
                    csrfToken={''}
                    errors={[
                        {
                            errorMessage: 'Minimum amount cannot be greater than 4',
                            id: 'minimum-passengers-Regular Senior',
                            userInput: '5',
                        },
                        {
                            errorMessage: 'Maximum amount is required',
                            id: 'minimum-passengers-Regular Senior',
                        },
                        {
                            errorMessage: 'Enter a group name of up to 50 characters',
                            id: 'passenger-group-name',
                            userInput: '',
                        },
                    ]}
                    editMode={false}
                    inputs={{
                        id: 0,
                        name: '',
                        groupPassengerType: {
                            name: 'group',
                            maxGroupSize: '4',
                            companions: [],
                        },
                    }}
                    passengers={[
                        {
                            id: 1,
                            name: 'Regular Senior',
                            passengerType: {
                                id: 1,
                                passengerType: 'senior',
                                ageRangeMin: '',
                                ageRangeMax: '',
                                proofDocuments: [],
                            },
                        },
                        {
                            id: 2,
                            name: 'Regular infant',
                            passengerType: {
                                id: 2,
                                passengerType: 'infant',
                                ageRangeMin: '1',
                                ageRangeMax: '3',
                                proofDocuments: [],
                            },
                        },
                    ]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode', () => {
            const tree = renderToFragment(
                <ManagePassengerGroup
                    csrfToken={''}
                    errors={[]}
                    editMode
                    inputs={{
                        id: 5,
                        name: 'the best group',
                        groupPassengerType: {
                            name: 'the best group',
                            maxGroupSize: '4',
                            companions: [
                                {
                                    id: 3,
                                    maxNumber: '2',
                                    name: 'passenger 1',
                                },
                                {
                                    id: 4,
                                    maxNumber: '1',
                                    name: 'passenger 2',
                                },
                            ],
                        },
                    }}
                    passengers={[
                        {
                            id: 1,
                            name: 'Regular Senior',
                            passengerType: {
                                id: 1,
                                passengerType: 'senior',
                                ageRangeMin: '',
                                ageRangeMax: '',
                                proofDocuments: [],
                            },
                        },
                        {
                            id: 2,
                            name: 'Regular infant',
                            passengerType: {
                                id: 2,
                                passengerType: 'infant',
                                ageRangeMin: '1',
                                ageRangeMax: '3',
                                proofDocuments: [],
                            },
                        },
                    ]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode with errors', () => {
            const tree = renderToFragment(
                <ManagePassengerGroup
                    csrfToken={''}
                    errors={[
                        {
                            errorMessage: 'Minimum amount cannot be greater than 4',
                            id: 'minimum-passengers-Regular Senior',
                            userInput: '5',
                        },
                        {
                            errorMessage: 'Maximum amount is required',
                            id: 'minimum-passengers-Regular Senior',
                        },
                        {
                            errorMessage: 'Enter a group name of up to 50 characters',
                            id: 'passenger-group-name',
                            userInput: '',
                        },
                    ]}
                    editMode
                    inputs={{
                        id: 5,
                        name: 'the best group',
                        groupPassengerType: {
                            name: 'the best group',
                            maxGroupSize: '4',
                            companions: [
                                {
                                    id: 3,
                                    maxNumber: '2',
                                    name: 'passenger 1',
                                },
                                {
                                    id: 4,
                                    maxNumber: '1',
                                    name: 'passenger 2',
                                },
                            ],
                        },
                    }}
                    passengers={[
                        {
                            id: 1,
                            name: 'Regular Senior',
                            passengerType: {
                                id: 1,
                                passengerType: 'senior',
                                ageRangeMin: '',
                                ageRangeMax: '',
                                proofDocuments: [],
                            },
                        },
                        {
                            id: 2,
                            name: 'Regular infant',
                            passengerType: {
                                id: 2,
                                passengerType: 'infant',
                                ageRangeMin: '1',
                                ageRangeMax: '3',
                                proofDocuments: [],
                            },
                        },
                    ]}
                />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
