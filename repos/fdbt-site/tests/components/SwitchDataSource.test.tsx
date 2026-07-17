import { render } from '@testing-library/react';
import SwitchDataSource from '../../src/components/SwitchDataSource';

describe('SwitchDataSource', () => {
    it('should render the button not disabled', () => {
        const { container, asFragment } = render(
            <SwitchDataSource
                dataSourceAttribute={{ source: 'bods', hasTnds: true, hasBods: true }}
                pageUrl="/service"
                attributeVersion="baseOperator"
                csrfToken="token"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
        expect((container.querySelector('#change-data-source') as HTMLButtonElement).disabled).toBeFalsy();
    });

    it('should render the button disabled', () => {
        const { container, asFragment } = render(
            <SwitchDataSource
                dataSourceAttribute={{ source: 'bods', hasTnds: false, hasBods: true }}
                pageUrl="/service"
                attributeVersion="baseOperator"
                csrfToken="token"
            />,
        );
        expect(asFragment()).toMatchSnapshot();
        expect((container.querySelector('#change-data-source') as HTMLButtonElement).disabled).toBeTruthy();
    });
});
