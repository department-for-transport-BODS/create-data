import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import { CapExpiryUnit } from '../../src/interfaces/matchingJsonTypes';
import CreateCaps from '../../src/pages/createCaps';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('create caps', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<CreateCaps errors={[]} csrfToken="" />);

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly on input errors', () => {
            const tree = renderToFragment(
                <CreateCaps
                    errors={[{ errorMessage: 'C name cannot have less than 2 characters', id: 'cap-name' }]}
                    csrfToken=""
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render correctly on edit mode', () => {
            const capInfo = {
                name: 'Cap 1',
                price: '2',
                durationAmount: '2',
                durationUnits: 'month' as CapExpiryUnit,
            };
            const tree = renderToFragment(
                <CreateCaps errors={[]} userInput={{ capDetails: capInfo }} editId={1} csrfToken="" />,
            );

            expect(tree).toMatchSnapshot();
        });
    });
});
