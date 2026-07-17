import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ManageTimeRestriction from '../../src/pages/manageTimeRestriction';
import { PremadeTimeRestriction } from '../../src/interfaces';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('manage time restriction', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <ManageTimeRestriction
                    csrfToken={''}
                    errors={[]}
                    inputs={undefined}
                    editMode={false}
                    fareDayEnd={'1234'}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly in edit mode', () => {
            const inputs: PremadeTimeRestriction = {
                id: 0,
                name: 'test',
                contents: [
                    { day: 'monday', timeBands: [{ startTime: '2200', endTime: '2300' }] },
                    { day: 'tuesday', timeBands: [{ startTime: '0100', endTime: '2400' }] },
                    { day: 'wednesday', timeBands: [{ startTime: '1200', endTime: '1200' }] },
                    { day: 'thursday', timeBands: [{ startTime: '-1', endTime: '' }] },
                ],
            };

            const tree = renderToFragment(
                <ManageTimeRestriction csrfToken={''} errors={[]} inputs={inputs} editMode fareDayEnd={'1234'} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on time restriction form group when no days are selected', () => {
            const errors = [{ id: 'time-restriction-days', errorMessage: 'You must select at least one day.' }];

            const inputs: PremadeTimeRestriction = {
                id: 0,
                name: 'test',
                contents: [],
            };

            const tree = renderToFragment(
                <ManageTimeRestriction csrfToken={''} errors={errors} inputs={inputs} editMode fareDayEnd={'1234'} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on day restrictions when invalid inputs are provided', () => {
            const errors = [
                {
                    errorMessage: 'Start time is required if end time is provided',
                    id: 'start-time-monday-0',
                    userInput: '',
                },
                { errorMessage: '2400 is not a valid input. Use 0000.', id: 'end-time-tuesday-0', userInput: '2400' },
                {
                    errorMessage: 'Start time and end time cannot be the same',
                    id: 'start-time-wednesday-0',
                    userInput: '1200',
                },
                {
                    errorMessage: 'Start time and end time cannot be the same',
                    id: 'end-time-wednesday-0',
                    userInput: '1200',
                },
                { errorMessage: 'Time must be in 24hr format', id: 'start-time-thursday-0', userInput: '-1' },
            ];

            const inputs: PremadeTimeRestriction = {
                id: 0,
                name: 'test',
                contents: [
                    { day: 'monday', timeBands: [{ startTime: '', endTime: '2300' }] },
                    { day: 'tuesday', timeBands: [{ startTime: '0100', endTime: '2400' }] },
                    { day: 'wednesday', timeBands: [{ startTime: '1200', endTime: '1200' }] },
                    { day: 'thursday', timeBands: [{ startTime: '-1', endTime: '' }] },
                ],
            };

            const tree = renderToFragment(
                <ManageTimeRestriction csrfToken={''} errors={errors} inputs={inputs} editMode fareDayEnd={'1234'} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render with fare day end selections', () => {
            const errors = [
                {
                    errorMessage: 'Start time is required if end time is provided',
                    id: 'start-time-monday-0',
                    userInput: '',
                },
                { errorMessage: '2400 is not a valid input. Use 0000.', id: 'end-time-tuesday-0', userInput: '2400' },
                {
                    errorMessage: 'Start time and end time cannot be the same',
                    id: 'start-time-wednesday-0',
                    userInput: '1200',
                },
                {
                    errorMessage: 'Start time and end time cannot be the same',
                    id: 'end-time-wednesday-0',
                    userInput: '1200',
                },
                { errorMessage: 'Time must be in 24hr format', id: 'start-time-thursday-0', userInput: '-1' },
            ];

            const inputs: PremadeTimeRestriction = {
                id: 0,
                name: 'test',
                contents: [
                    { day: 'monday', timeBands: [{ startTime: '1111', endTime: '2300' }] },
                    { day: 'tuesday', timeBands: [{ startTime: '0100', endTime: { fareDayEnd: true } }] },
                    {
                        day: 'wednesday',
                        timeBands: [
                            { startTime: '1200', endTime: '1300' },
                            { startTime: '1500', endTime: { fareDayEnd: true } },
                        ],
                    },
                ],
            };

            const tree = renderToFragment(
                <ManageTimeRestriction csrfToken={''} errors={errors} inputs={inputs} editMode fareDayEnd={'1234'} />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render error state on name form group when name input left blank', () => {
            const errors = [{ id: 'time-restriction-name', errorMessage: 'Time restriction name is required.' }];

            const inputs: PremadeTimeRestriction = {
                id: 0,
                name: '',
                contents: [
                    {
                        day: 'monday',
                        timeBands: [
                            {
                                startTime: '1200',
                                endTime: '2300',
                            },
                        ],
                    },
                ],
            };

            const tree = renderToFragment(
                <ManageTimeRestriction
                    csrfToken={''}
                    errors={errors}
                    inputs={inputs}
                    editMode={false}
                    fareDayEnd={'1234'}
                />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
