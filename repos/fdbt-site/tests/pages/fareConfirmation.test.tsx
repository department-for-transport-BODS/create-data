import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import FareConfirmation, { buildFareConfirmationElements } from '../../src/pages/fareConfirmation';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('fareConfirmation', () => {
        it('should render correctly for non school single tickets', () => {
            const tree = renderToFragment(
                <FareConfirmation
                    fareType="single"
                    carnet={false}
                    passengerTypeName="blobs"
                    passengerType={{
                        id: 2,
                        passengerType: 'adult',
                        ageRange: 'yes',
                        ageRangeMin: '18',
                        ageRangeMax: '100',
                        proof: 'yes',
                        proofDocuments: ['membership card'],
                    }}
                    groupPassengerInfo={[]}
                    schoolFareType=""
                    termTime=""
                    fullTimeRestrictions={[
                        {
                            day: 'thursday',
                            timeBands: [{ startTime: '0900', endTime: '1600' }],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'bankHoliday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for a carnet ticket', () => {
            const tree = renderToFragment(
                <FareConfirmation
                    fareType="single"
                    carnet
                    passengerTypeName="blobs"
                    passengerType={{
                        id: 2,
                        passengerType: 'adult',
                        ageRange: 'yes',
                        ageRangeMin: '18',
                        ageRangeMax: '100',
                        proof: 'yes',
                        proofDocuments: ['membership card'],
                    }}
                    groupPassengerInfo={[]}
                    schoolFareType=""
                    termTime=""
                    fullTimeRestrictions={[
                        {
                            day: 'thursday',
                            timeBands: [{ startTime: '0900', endTime: '1600' }],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'bankHoliday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for a ticket with a premade time restriction', () => {
            const tree = renderToFragment(
                <FareConfirmation
                    fareType="single"
                    carnet={false}
                    passengerTypeName="blobs"
                    passengerType={{
                        id: 2,
                        passengerType: 'adult',
                        ageRange: 'yes',
                        ageRangeMin: '18',
                        ageRangeMax: '100',
                        proof: 'yes',
                        proofDocuments: ['membership card'],
                    }}
                    groupPassengerInfo={[]}
                    schoolFareType=""
                    termTime=""
                    fullTimeRestrictions={[
                        {
                            day: 'thursday',
                            timeBands: [{ startTime: '0900', endTime: '1600' }],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'bankHoliday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for group tickets', () => {
            const tree = renderToFragment(
                <FareConfirmation
                    fareType="single"
                    carnet={false}
                    passengerTypeName="blobs"
                    passengerType={{
                        id: 4,
                        passengerType: 'group',
                    }}
                    groupPassengerInfo={[
                        {
                            id: 1,
                            name: 'blobs',
                            passengerType: 'adult',
                            minNumber: '1',
                            maxNumber: '1',
                            ageRangeMin: '16',
                            ageRangeMax: '65',
                        },
                        {
                            id: 2,
                            name: 'blobs',
                            passengerType: 'child',
                            minNumber: '1',
                            maxNumber: '1',
                            ageRangeMin: '0',
                            ageRangeMax: '16',
                            proofDocuments: ['Identity Document'],
                        },
                    ]}
                    schoolFareType=""
                    termTime=""
                    fullTimeRestrictions={[
                        {
                            day: 'thursday',
                            timeBands: [
                                { startTime: '0900', endTime: '1600' },
                                { startTime: '1400', endTime: '2000' },
                            ],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'bankHoliday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for school tickets', () => {
            const tree = renderToFragment(
                <FareConfirmation
                    fareType="schoolService"
                    carnet={false}
                    passengerTypeName="blobs"
                    passengerType={{
                        id: 2,
                        passengerType: 'schoolPupil',
                        ageRange: 'yes',
                        ageRangeMax: '18',
                        proof: 'yes',
                        proofDocuments: ['Student Card'],
                    }}
                    groupPassengerInfo={[]}
                    schoolFareType="period"
                    termTime="true"
                    fullTimeRestrictions={[]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('buildFareConfirmationElements', () => {
            it('should create confirmation elements for non school tickets', () => {
                const result = buildFareConfirmationElements(
                    'return',
                    false,
                    {
                        id: 2,
                        passengerType: 'adult',
                        ageRange: 'yes',
                        ageRangeMin: '18',
                        ageRangeMax: '100',
                        proof: 'yes',
                        proofDocuments: ['membership card'],
                    },
                    'blah',
                    [],
                    '',
                    '',
                    [
                        {
                            day: 'wednesday',
                            timeBands: [{ startTime: '0900', endTime: '1600' }],
                        },
                        {
                            day: 'thursday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ],
                );
                expect(result).toStrictEqual([
                    { content: 'Return', href: 'fareType', name: 'Fare type' },
                    { content: 'blah', href: 'selectPassengerType', name: 'Passenger type' },
                    {
                        content: 'Minimum age: 18 Maximum age: 100',
                        href: 'selectPassengerType',
                        name: 'Passenger information - age range',
                    },
                    {
                        content: 'Membership card',
                        href: 'selectPassengerType',
                        name: 'Passenger information - proof documents',
                    },
                    {
                        content: 'Start time: 0900 End time: 1600',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Wednesday',
                    },
                    {
                        content: 'Start time: N/A End time: 1600',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Thursday',
                    },
                    {
                        content: 'Start time: N/A End time: N/A',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Friday',
                    },
                ]);
            });

            it('should create confirmation elements for a ticket with a premade time restriction', () => {
                const result = buildFareConfirmationElements(
                    'return',
                    false,
                    {
                        id: 2,
                        passengerType: 'adult',
                        ageRange: 'yes',
                        ageRangeMin: '18',
                        ageRangeMax: '100',
                        proof: 'yes',
                        proofDocuments: ['membership card'],
                    },
                    'blah',

                    [],
                    '',
                    '',
                    [
                        {
                            day: 'wednesday',
                            timeBands: [{ startTime: '0900', endTime: '1600' }],
                        },
                        {
                            day: 'thursday',
                            timeBands: [{ startTime: '', endTime: '1600' }],
                        },
                        {
                            day: 'friday',
                            timeBands: [{ startTime: '', endTime: '' }],
                        },
                    ],
                );
                expect(result).toStrictEqual([
                    { content: 'Return', href: 'fareType', name: 'Fare type' },
                    { content: 'blah', href: 'selectPassengerType', name: 'Passenger type' },
                    {
                        content: 'Minimum age: 18 Maximum age: 100',
                        href: 'selectPassengerType',
                        name: 'Passenger information - age range',
                    },
                    {
                        content: 'Membership card',
                        href: 'selectPassengerType',
                        name: 'Passenger information - proof documents',
                    },
                    {
                        content: 'Start time: 0900 End time: 1600',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Wednesday',
                    },
                    {
                        content: 'Start time: N/A End time: 1600',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Thursday',
                    },
                    {
                        content: 'Start time: N/A End time: N/A',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions - Friday',
                    },
                ]);
            });

            it('should create confirmation elements for school tickets', () => {
                const result = buildFareConfirmationElements(
                    'schoolService',
                    false,
                    {
                        id: 2,
                        passengerType: 'schoolPupil',
                        ageRange: 'yes',
                        ageRangeMax: '18',
                        proof: 'yes',
                        proofDocuments: ['Student Card'],
                    },
                    'blah',

                    [],
                    'period',
                    'true',
                    [],
                );
                expect(result).toStrictEqual([
                    { content: 'School service', href: 'fareType', name: 'Fare type' },
                    { content: 'blah', href: 'selectPassengerType', name: 'Passenger type' },
                    {
                        content: 'Minimum age: N/A Maximum age: 18',
                        href: 'selectPassengerType',
                        name: 'Passenger information - age range',
                    },
                    {
                        content: 'Student card',
                        href: 'selectPassengerType',
                        name: 'Passenger information - proof documents',
                    },
                    {
                        content: 'Yes',
                        href: '',
                        name: 'Only valid during term times',
                    },
                    {
                        content: 'Period',
                        href: '',
                        name: 'School ticket fare type',
                    },
                    {
                        content: 'N/A',
                        href: 'selectTimeRestrictions',
                        name: 'Time restrictions',
                    },
                ]);
            });
        });
    });
});
