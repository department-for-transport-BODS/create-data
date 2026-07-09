import * as React from 'react';
import { shallow } from 'enzyme';
import * as sessions from '../../src/utils/sessions';
import FareType, { buildUuid, getServerSideProps } from '../../src/pages/fareType';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import { getAllServicesByNocCode, getOperatorDetails } from '../../src/data/auroradb';
import { GS_REFERER, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';

jest.mock('../../src/utils/sessions');

jest.mock('../../src/data/auroradb');

describe('pages', () => {
    const writeHeadMock = jest.fn();

    afterEach(() => {
        jest.resetAllMocks();
    });

    const mockErrors = [{ errorMessage: 'Choose a fare type from the options', id: 'fare-type-single' }];

    describe('fareType', () => {
        it('should render correctly', () => {
            const tree = shallow(
                <FareType operatorName="Blackpool Transport" schemeOp={false} errors={[]} csrfToken="" />,
            );
            expect(tree).toMatchSnapshot();
        });

        it('should render correctly for a scheme operator', () => {
            const tree = shallow(<FareType operatorName="Blackpool Transport" schemeOp errors={[]} csrfToken="" />);
            expect(tree).toMatchSnapshot();
        });

        it('should render error messaging when errors are passed to the page', () => {
            const tree = shallow(
                <FareType operatorName="Blackpool Transport" schemeOp={false} errors={mockErrors} csrfToken="" />,
            );
            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            beforeEach(() => {
                (getAllServicesByNocCode as jest.Mock).mockImplementation(() => [
                    {
                        lineName: '123',
                        startDate: '05/02/2020',
                        description: 'this bus service is 123',
                        serviceCode: 'NW_05_BLAC_123_1',
                    },
                    {
                        lineName: 'X1',
                        startDate: '06/02/2020',
                        description: 'this bus service is X1',
                        serviceCode: 'NW_05_BLAC_X1_1',
                    },
                    {
                        lineName: 'Infinity Line',
                        startDate: '07/02/2020',
                        description: 'this bus service is Infinity Line',
                        serviceCode: 'WY_13_IWBT_07_1',
                    },
                ]);
            });

            it('should clear the global settings redirect session attribute on page load', async () => {
                const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
                const mockContext = getMockContext();
                await getServerSideProps(mockContext);
                expect(updateSessionAttributeSpy).toHaveBeenCalledWith(mockContext.req, GS_REFERER, undefined);
            });

            it('should return expected props when a the user logged in is not a scheme operator', async () => {
                const expectedProps = {
                    props: {
                        operatorName: expect.any(String),
                        schemeOp: false,
                        errors: [],
                        csrfToken: '',
                    },
                };
                const mockContext = getMockContext();
                const actualProps = await getServerSideProps(mockContext);
                expect(actualProps).toEqual(expectedProps);
            });

            it('should redirect to /manageOperatorDetails if the user is a scheme operator and does not have their operator details set', async () => {
                (getOperatorDetails as jest.Mock).mockResolvedValue(undefined);
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
                    },
                });
                await getServerSideProps(mockContext);
                expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/manageOperatorDetails' });
            });
        });
    });

    describe('buildUUid', () => {
        it('should return a string starting with the NOC and then 8 characters of uuid', () => {
            const result = buildUuid('TEST');

            expect(result.substring(0, 4)).toBe('TEST');
            expect(result.length).toBe(12);
        });
    });
});
