import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ViewTimeRestrictions, { TimeRestrictionCardBody } from '../../src/pages/viewTimeRestrictions';
import { PremadeTimeRestriction } from '../../src/interfaces';

jest.mock('next/router', () => ({ useRouter: () => ({ pathname: '/viewTimeRestrictions' }) }));

const renderToFragment = (component: ReactElement) => render(component).asFragment();

const timeRestrictions: PremadeTimeRestriction[] = [
    {
        id: 1,
        name: 'Restriction 1',
        contents: [
            {
                day: 'monday',
                timeBands: [
                    {
                        startTime: '0400',
                        endTime: '2300',
                    },
                ],
            },
            {
                day: 'tuesday',
                timeBands: [
                    {
                        startTime: '0400',
                        endTime: '',
                    },
                ],
            },
        ],
    },
    {
        id: 2,
        name: 'Restriction 2',
        contents: [
            {
                day: 'bankHoliday',
                timeBands: [],
            },
            {
                day: 'sunday',
                timeBands: [
                    {
                        startTime: '0400',
                        endTime: '1200',
                    },
                    {
                        startTime: '1300',
                        endTime: '2200',
                    },
                ],
            },
        ],
    },
];

describe('pages', () => {
    describe('view time restrictions', () => {
        it('should render correctly when no time restrictions', () => {
            const tree = renderToFragment(
                <ViewTimeRestrictions
                    csrfToken={''}
                    timeRestrictions={[]}
                    referer={null}
                    viewTimeRestrictionErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when time restrictions exist', () => {
            const tree = renderToFragment(
                <ViewTimeRestrictions
                    csrfToken={''}
                    timeRestrictions={timeRestrictions}
                    referer={'hello'}
                    viewTimeRestrictionErrors={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('time restrictions inner component', () => {
        it('renders normally when time restrictions are present', () => {
            const tree = renderToFragment(<TimeRestrictionCardBody entity={timeRestrictions[0]} />);
            expect(tree).toMatchSnapshot();
        });
    });
});
