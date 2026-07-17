import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import HowManyStages from '../../src/pages/howManyStages';
import { ErrorInfo } from '../../src/interfaces';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('howManyStages', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(<HowManyStages errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render errors correctly', () => {
            const mockError: ErrorInfo[] = [
                {
                    id: 'how-many-stages-error',
                    errorMessage: 'Choose an option regarding how many fare stages you have',
                },
            ];
            const tree = renderToFragment(<HowManyStages errors={mockError} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });
    });
});
