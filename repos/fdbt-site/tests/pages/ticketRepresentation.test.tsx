import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import TicketRepresentation, { getServerSideProps } from '../../src/pages/ticketRepresentation';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import { CARNET_FARE_TYPE_ATTRIBUTE, FARE_TYPE_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('ticketRepresentation', () => {
        it('should render correctly when the fare type is a period ticket', () => {
            const tree = renderToFragment(
                <TicketRepresentation
                    fareType="period"
                    errors={[]}
                    csrfToken=""
                    showHybrid
                    showPointToPoint
                    showMultiOperator
                    showFlatFlare={false}
                    showGeoZone
                    stage="dev"
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly when the fare type is a multi operator ticket', () => {
            const tree = renderToFragment(
                <TicketRepresentation
                    fareType="multiOperator"
                    errors={[]}
                    csrfToken=""
                    showHybrid={false}
                    showPointToPoint
                    showMultiOperator={true}
                    showFlatFlare
                    showGeoZone
                    stage="dev"
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('price per distance radio not show when in test', () => {
            const tree = renderToFragment(
                <TicketRepresentation
                    fareType="multiOperator"
                    errors={[]}
                    csrfToken=""
                    showHybrid={false}
                    showPointToPoint
                    showMultiOperator={true}
                    showFlatFlare
                    showGeoZone
                    stage="test"
                />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed', () => {
            const tree = renderToFragment(
                <TicketRepresentation
                    fareType="period"
                    errors={[
                        {
                            errorMessage: 'Choose a type of ticket representation',
                            id: 'geo-zone',
                        },
                    ]}
                    csrfToken=""
                    showHybrid
                    showPointToPoint
                    showFlatFlare
                    showMultiOperator
                    showGeoZone
                    stage="dev"
                />,
            );
            expect(tree).toMatchSnapshot();
        });
    });

    describe('getServerSideProps', () => {
        it('should set showHybrid to false when the ticket is a multiOperator', () => {
            const ctx = getMockContext({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'multiOperator' },
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.showHybrid).toBeFalsy();
        });

        it('should set showHybrid to true when the ticket is not a multiOperator', () => {
            const ctx = getMockContext({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.showHybrid).toBe(true);
        });

        it('should set showPointToPoint to false when the ticket is a carnet', () => {
            const ctx = getMockContext({
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [CARNET_FARE_TYPE_ATTRIBUTE]: true,
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.showPointToPoint).toBe(false);
        });

        it('should set showPointToPoint and showHybrid to false for a scheme', () => {
            const ctx = getMockContext({
                cookies: {
                    idToken: mockSchemOpIdToken,
                },
                session: {
                    [FARE_TYPE_ATTRIBUTE]: { fareType: 'period' },
                    [OPERATOR_ATTRIBUTE]: { name: 'SCHEME_OPERATOR', region: 'SCHEME_REGION' },
                },
            });
            const result = getServerSideProps(ctx);

            expect(result.props.showPointToPoint).toBe(false);
            expect(result.props.showHybrid).toBe(false);
        });
    });
});
