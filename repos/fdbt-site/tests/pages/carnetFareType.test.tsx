import * as React from 'react';
import { shallow } from 'enzyme';
import CarnetFareType, { getServerSideProps } from '../../src/pages/carnetFareType';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import { getAllServicesByNocCode } from '../../src/data/auroradb';
import { OPERATOR_ATTRIBUTE, CARNET_FARE_TYPE_ATTRIBUTE } from '../../src/constants/attributes';

jest.mock('../../src/data/auroradb');

describe('pages', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    const mockErrors = [{ errorMessage: 'Choose a fare type from the options', id: 'fare-type-single' }];

    describe('carnetFareType', () => {
        it('should render correctly', () => {
            const tree = shallow(<CarnetFareType operatorName="Blackpool Transport" errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed to the page', () => {
            const tree = shallow(
                <CarnetFareType operatorName="Blackpool Transport" errors={mockErrors} csrfToken="" />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            it('should return expected props given the happy path scenario', () => {
                const expectedProps = {
                    props: { operatorName: expect.any(String), errors: [], csrfToken: '' },
                };
                const mockContext = getMockContext({
                    session: {
                        [CARNET_FARE_TYPE_ATTRIBUTE]: true,
                    },
                });
                const actualProps = getServerSideProps(mockContext);
                expect(actualProps).toEqual(expectedProps);
            });

            it('should redirect to /fareType if carnet is not set to true', () => {
                (getAllServicesByNocCode as jest.Mock).mockImplementation(() => []);
                const mockContext = getMockContext({
                    mockWriteHeadFn: writeHeadMock,
                    cookies: {
                        idToken: mockSchemOpIdToken,
                    },
                    session: {
                        [OPERATOR_ATTRIBUTE]: {
                            name: 'SCHEME_OPERATOR',
                            region: 'SCHEME_REGION',
                            nocCode: 'TESTSCHEME',
                        },
                        [CARNET_FARE_TYPE_ATTRIBUTE]: false,
                    },
                });
                getServerSideProps(mockContext);
                expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/fareType' });
            });
        });
    });
});
