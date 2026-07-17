import { render } from '@testing-library/react';
import { GlobalSettingsViewPage } from '../../src/components/GlobalSettingsViewPage';

jest.mock('next/router', () => ({
    useRouter: () => ({ pathname: '/' }),
}));

const CardBody = ({ entity: { id, name } }: { entity: { id: number; name: string } }) => (
    <h1>
        This is my card body {id} {name}
    </h1>
);

describe('GlobalSettingsViewPage', () => {
    it('should render correctly when no entities', () => {
        const { asFragment } = render(
            <GlobalSettingsViewPage
                csrfToken={''}
                entities={[]}
                referer={null}
                title="my title"
                description="my description"
                entityDescription="my entity description"
                CardBody={CardBody}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly when entities exist', () => {
        const { asFragment } = render(
            <GlobalSettingsViewPage
                csrfToken={''}
                entities={[
                    { id: 7, name: 'name seven' },
                    { id: 17, name: 'name seventeen' },
                    { id: 1, name: 'another one' },
                ]}
                referer={null}
                title="my title"
                description="my description"
                entityDescription="my entity description"
                CardBody={CardBody}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });

    it('should render correctly when entities exist and env is not test', () => {
        const { asFragment } = render(
            <GlobalSettingsViewPage
                csrfToken={''}
                entities={[
                    { id: 7, name: 'name seven' },
                    { id: 17, name: 'name seventeen' },
                    { id: 1, name: 'another one' },
                ]}
                referer={null}
                title="my title"
                description="my description"
                entityDescription="my entity description"
                CardBody={CardBody}
            />,
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
