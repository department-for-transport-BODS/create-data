import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { InputCheck } from '../../src/interfaces';
import StageNames, { renderInputFields, getServerSideProps } from '../../src/pages/stageNames';
import { getMockContext } from '../testData/mockData';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('renderInputFields', () => {
        it('should return a list of html elements that matches the number of fare stages and inputCheck objects', () => {
            const mockNumberOfFareStages = 4;
            const mockInputCheck: InputCheck[] = [
                { error: '', input: 'ab', id: 'fare-stage-name-1' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-2' },
                { error: '', input: 'cd', id: 'fare-stage-name-3' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-4' },
            ];
            const renderElements = renderInputFields(mockNumberOfFareStages, mockInputCheck, [], []);
            expect(renderElements).toHaveLength(4);
        });

        it('should return a <div> element containing <label> and <input> elements with error tags and no default value when there is an inputCheck object containing errors', () => {
            const mockNumberOfFareStages = 2;
            const mockInputCheck: InputCheck[] = [];
            const renderElements = renderInputFields(mockNumberOfFareStages, mockInputCheck, [], []);
            expect(renderElements).toHaveLength(2);
        });
    });

    describe('stageNames', () => {
        it('should render correctly when a user first visits the page', () => {
            const mockNumberOfFareStages = 6;
            const mockInputChecks: InputCheck[] = [];
            const tree = renderToFragment(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockInputChecks}
                    csrfToken=""
                    errors={[]}
                    defaults={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when a user is redirected to the page from itself when incorrect data is entered', () => {
            const mockNumberOfFareStages = 5;
            const mockInputChecks: InputCheck[] = [
                { error: '', input: '', id: 'fare-stage-name-1' },
                { error: '', input: '', id: 'fare-stage-name-2' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-3' },
                { error: '', input: '', id: 'fare-stage-name-4' },
                { error: '', input: '', id: 'fare-stage-name-5' },
            ];
            const tree = renderToFragment(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockInputChecks}
                    csrfToken=""
                    errors={[]}
                    defaults={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly when a user is redirected to the page from itself when no data is entered', () => {
            const mockNumberOfFareStages = 4;
            const mockinputChecks: InputCheck[] = [
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-1' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-2' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-3' },
                { error: 'Enter a name for this fare stage', input: '', id: 'fare-stage-name-4' },
            ];
            const tree = renderToFragment(
                <StageNames
                    numberOfFareStages={mockNumberOfFareStages}
                    inputChecks={mockinputChecks}
                    csrfToken=""
                    errors={[]}
                    defaults={[]}
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('displays a number of input fields which matches the number of fare stages in the fareStagesCookie', () => {
            const ctx = getMockContext();
            const result = getServerSideProps(ctx);
            expect(result).toEqual({
                props: {
                    defaults: ['Stage name one', 'Stage name two', 'Stage name three'],
                    errors: [],
                    numberOfFareStages: 6,
                    inputChecks: [],
                    csrfToken: '',
                },
            });
        });
    });
});
