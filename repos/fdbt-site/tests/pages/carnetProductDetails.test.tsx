import { render } from '@testing-library/react';
import { ReactElement } from 'react';
import CarnetProductDetails, { getServerSideProps } from '../../src/pages/carnetProductDetails';
import { getMockContext } from '../testData/mockData';
import { FARE_ZONE_ATTRIBUTE, OPERATOR_ATTRIBUTE, PASSENGER_TYPE_ATTRIBUTE } from '../../src/constants/attributes';
import { CarnetProductInfo, CarnetExpiryUnit } from '../../src/interfaces/matchingJsonTypes';

const mockProductDetails: CarnetProductInfo = {
    productName: '',
    carnetDetails: {
        quantity: '5',
        expiryTime: '2',
        expiryUnit: CarnetExpiryUnit.DAY,
    },
};

const renderToFragment = (component: ReactElement) => render(component).asFragment();

describe('pages', () => {
    describe('carnetProductDetails', () => {
        it('should render correctly', () => {
            const tree = renderToFragment(
                <CarnetProductDetails product={mockProductDetails} hintText="Test Hint" csrfToken="" errors={[]} />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should return expected props to the page when the page is first visited by the user', () => {
                const ctx = getMockContext();
                const result = getServerSideProps(ctx);

                expect(result.props.hintText).toBe('test - Adult Carnet Single');
            });

            it('should throw an error when the PASSENGER_TYPE_ATTRIBUTE is missing', () => {
                const ctx = getMockContext({
                    session: {
                        [PASSENGER_TYPE_ATTRIBUTE]: undefined,
                    },
                });
                expect(() => getServerSideProps(ctx)).toThrow(
                    'Failed to retrieve passenger type attribute for product details page',
                );
            });

            it('should throw an error when the OPERATOR_ATTRIBUTE is missing', () => {
                const ctx = getMockContext({
                    session: {
                        [OPERATOR_ATTRIBUTE]: undefined,
                        [FARE_ZONE_ATTRIBUTE]: 'Green Park Shops',
                    },
                });
                expect(() => getServerSideProps(ctx)).toThrow('Failed to retrieve the necessary session objects');
            });
        });
    });
});
