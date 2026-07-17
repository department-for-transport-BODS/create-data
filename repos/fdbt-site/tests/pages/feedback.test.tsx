import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import Feedback, { getServerSideProps } from '../../src/pages/feedback';
import { getMockContext } from '../testData/mockData';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('feedback', () => {
        it('should render correctly when the page is first visited', () => {
            const tree = renderToFragment(<Feedback feedbackSubmitted="false" csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly after feedback has been successfully submitted', () => {
            const tree = renderToFragment(<Feedback feedbackSubmitted="submitted" csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly after the user tries to submit no feedback', () => {
            const tree = renderToFragment(<Feedback feedbackSubmitted="not submitted" csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it("should return 'feedbackSubmitted' as 'false' when there is no query string", () => {
                const ctx = getMockContext();
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('false');
            });

            it("should return 'feedbackSubmitted' as 'submitted' when the query string is 'true'", () => {
                const ctx = getMockContext({ query: { feedbackSubmitted: 'true' } });
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('submitted');
            });

            it("should return 'feedbackSubmitted' as 'not submitted' when the query string is not 'true'", () => {
                const ctx = getMockContext({ query: { feedbackSubmitted: 'turkey' } });
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.feedbackSubmitted).toBe('not submitted');
            });
        });
    });
});
