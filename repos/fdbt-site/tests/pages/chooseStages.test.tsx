import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import ChooseStages, { getServerSideProps } from '../../src/pages/chooseStages';
import { getMockContext } from '../testData/mockData';
import { FARE_STAGES_ATTRIBUTE } from '../../src/constants/attributes';
import { ErrorInfo } from '../../src/interfaces';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('chooseStages', () => {
        const mockErrors: ErrorInfo[] = [{ errorMessage: 'Enter a whole number between 2 and 20', id: 'fare-stages' }];

        it('should render correctly', () => {
            const tree = renderToFragment(<ChooseStages errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render errors correctly', () => {
            const tree = renderToFragment(<ChooseStages errors={mockErrors} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should extract errors correctly', () => {
                const ctx = getMockContext({
                    session: { [FARE_STAGES_ATTRIBUTE]: { errors: mockErrors, fareStages: 'word' } },
                });
                const actualProps = getServerSideProps(ctx);
                expect(actualProps.props.errors).toEqual(mockErrors);
            });
        });
    });
});
