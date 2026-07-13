import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import MultipleOperators from '../../src/pages/multipleOperators';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('multipleOperators', () => {
        it('should render correctly with one operator NOC pair', () => {
            const tree = renderToFragment(
                <MultipleOperators
                    errors={[]}
                    operatorsAndNocs={[{ name: 'test', nocCode: 'testNoc' }]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
        it('should render correctly with multiple operator NOC pairs', () => {
            const tree = renderToFragment(
                <MultipleOperators
                    errors={[]}
                    operatorsAndNocs={[
                        { name: 'test', nocCode: 'testNoc' },
                        { name: 'test2', nocCode: 'testNoc2' },
                        { name: 'test3', nocCode: 'testNoc3' },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render errors correctly', () => {
            const tree = renderToFragment(
                <MultipleOperators
                    errors={[{ errorMessage: 'Choose an operator name and NOC from the options', id: 'operators' }]}
                    operatorsAndNocs={[
                        { name: 'test', nocCode: 'testNoc' },
                        { name: 'test2', nocCode: 'testNoc2' },
                        { name: 'test3', nocCode: 'testNoc3' },
                    ]}
                    csrfToken=""
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });
});
