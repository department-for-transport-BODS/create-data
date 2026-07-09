import * as React from 'react';
import { shallow } from 'enzyme';
import { getMockContext, mockSchemOpIdToken } from '../testData/mockData';
import * as aurora from '../../src/data/auroradb';
import SearchOperators, {
    getServerSideProps,
    SearchOperatorProps,
    showSelectedOperators,
    showSearchResults,
    alphabetiseOperatorList,
} from '../../src/pages/searchOperators';
import { MULTIPLE_OPERATOR_ATTRIBUTE, OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { ErrorInfo, Operator, OperatorAttribute, OperatorGroup } from '../../src/interfaces';

jest.mock('../../src/data/auroradb');

const mockOperators: Operator[] = [
    {
        name: "Warrington's Own Buses",
        nocCode: 'WBTR',
    },
    {
        name: 'Blackpool Transport',
        nocCode: 'BLAC',
    },
    {
        name: 'IW Bus Co',
        nocCode: 'IWBusCo',
    },
];

describe('pages', () => {
    describe('searchOperator', () => {
        const mockOperatorGroup: OperatorGroup = {
            id: 1,
            name: 'OperatorG Group',
            operators: [mockOperators[0]],
        };

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should render just the search input when the user first visits the page', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    databaseSearchResults={[]}
                    preSelectedOperators={[]}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input and search results when there is a successful search', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="blac"
                    databaseSearchResults={[{ nocCode: 'BLAC', name: 'Blackpool' }]}
                    preSelectedOperators={[]}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render an input error when the user makes an unsucessful search', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[{ errorMessage: 'Search requires a minimum of three characters', id: 'search-input' }]}
                    searchText=""
                    databaseSearchResults={[]}
                    preSelectedOperators={[]}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render a selection error when the user tries to add operators without selecting any search results', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="blac"
                    databaseSearchResults={[{ nocCode: 'BLAC', name: 'Blackpool' }]}
                    preSelectedOperators={[]}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input and a list of selected operators when search results have been selected', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    databaseSearchResults={[]}
                    preSelectedOperators={mockOperators}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render a selection error when the user tries to remove selected operators without making a selection', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    databaseSearchResults={[]}
                    preSelectedOperators={mockOperators}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the search input, search results and a list of selected operators when an additional search is made', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText="warri"
                    databaseSearchResults={[mockOperators[0]]}
                    preSelectedOperators={mockOperators}
                    csrfToken=""
                    editMode={false}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        it('should render the page in edit mode', () => {
            const tree = shallow(
                <SearchOperators
                    errors={[]}
                    searchText=""
                    databaseSearchResults={[mockOperators[0]]}
                    preSelectedOperators={mockOperators}
                    csrfToken=""
                    editMode={true}
                    inputs={mockOperatorGroup}
                />,
            );

            expect(tree).toMatchSnapshot();
        });

        describe('getServerSideProps', () => {
            const getSearchOperatorsBySearchTextSpy = jest.spyOn(aurora, 'getSearchOperatorsBySearchText');
            const getOperatorGroupByNocAndId = jest.spyOn(aurora, 'getOperatorGroupByNocAndId');
            it('should return base props when the page is first visited by the user', async () => {
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: '',
                        databaseSearchResults: [],
                        preSelectedOperators: [],
                        csrfToken: '',
                        editMode: false,
                    },
                };
                const ctx = getMockContext();
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return base props with errors when the the MULTIPLE_OPERATOR_ATTRIBUTE contains errors', async () => {
                const mockErrors: ErrorInfo[] = [
                    {
                        errorMessage: 'Search requires a minimum of three characters',
                        id: 'search-input',
                    },
                ];
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: mockErrors,
                        searchText: '',
                        databaseSearchResults: [],
                        preSelectedOperators: [],
                        csrfToken: '',
                        editMode: false,
                    },
                };
                const ctx = getMockContext({ session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: { errors: mockErrors } } });
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return base props with errors when the url query string contains an invalid search term', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue([]);
                const mockErrors: ErrorInfo[] = [
                    {
                        errorMessage:
                            "No operators found for 'asda'. Either the operator is not in the NOC Database, or there is no published service data for the operator. Try another search term.",
                        id: 'search-input',
                    },
                ];
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: mockErrors,
                        searchText: 'asda',
                        databaseSearchResults: [],
                        preSelectedOperators: [],
                        csrfToken: '',
                        editMode: false,
                    },
                };
                const ctx = getMockContext({
                    session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined },
                    query: { searchOperator: 'asda' },
                });
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });

            it('should return props containing search results when the url query string contains a valid search term and the user is not a scheme operator', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue(mockOperators);
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: 'blac',
                        databaseSearchResults: mockOperators,
                        preSelectedOperators: [],
                        csrfToken: '',
                        editMode: false,
                    },
                };
                const ctx = getMockContext({
                    session: { [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined },
                    query: { searchOperator: 'blac' },
                });
                const result = await getServerSideProps(ctx);

                expect(getSearchOperatorsBySearchTextSpy).toHaveBeenCalled();
                expect(result).toEqual(mockProps);
            });

            it('should return props containing search results when the url query string contains a valid search term and the user is a scheme operator', async () => {
                getSearchOperatorsBySearchTextSpy.mockImplementation().mockResolvedValue(mockOperators);
                const operatorData: OperatorAttribute = {
                    name: 'Test Op',
                    nocCode: 'TESTSCHEME',
                };
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: 'blac',
                        databaseSearchResults: mockOperators,
                        preSelectedOperators: [],
                        csrfToken: '',
                        editMode: false,
                    },
                };
                const ctx = getMockContext({
                    session: {
                        [MULTIPLE_OPERATOR_ATTRIBUTE]: undefined,
                        [OPERATOR_ATTRIBUTE]: operatorData,
                    },
                    query: { searchOperator: 'blac' },
                    cookies: {
                        idToken: mockSchemOpIdToken,
                    },
                });
                const result = await getServerSideProps(ctx);

                expect(getSearchOperatorsBySearchTextSpy).toHaveBeenCalled();
                expect(result).toEqual(mockProps);
            });

            it('should return base props when the page is visited in edit mode', async () => {
                const mockProps: { props: SearchOperatorProps } = {
                    props: {
                        errors: [],
                        searchText: '',
                        databaseSearchResults: [],
                        preSelectedOperators: [mockOperators[0]],
                        csrfToken: '',
                        editMode: true,
                        inputs: mockOperatorGroup,
                    },
                };

                getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue(mockOperatorGroup);
                const ctx = getMockContext({ query: { id: '1' } });
                const result = await getServerSideProps(ctx);

                expect(result).toEqual(mockProps);
            });
        });

        describe('Update selectedOperators', () => {
            it('should remove selected operator from selectedOperator list', () => {
                const setSelectedOperators = jest.fn();
                const mocSelectedOperators: Operator[] = [
                    { nocCode: 'BLAC', name: 'Blackpool Transport' },
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ];
                const mockSearchResults: Operator[] = [
                    { nocCode: 'BLAC', name: 'Blackpool Transport' },
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ];
                const setSearchResults = jest.fn();
                const mocErrors: ErrorInfo[] = [];
                const operatorGroupName = '';
                const wrapper = shallow(
                    showSelectedOperators(
                        mocSelectedOperators,
                        setSelectedOperators,
                        mocErrors,
                        operatorGroupName,
                        mockSearchResults,
                        setSearchResults,
                        mockSearchResults,
                    ),
                );
                wrapper.find('#remove-0').simulate('click');
                expect(setSelectedOperators).toHaveBeenCalledWith([
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ]);
            });
            it('should remove all operators from selectedOperator list', () => {
                const setSelectedOperators = jest.fn();
                const mocSelectedOperators: Operator[] = [
                    { nocCode: 'BLAC', name: 'Blackpool Transport' },
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ];
                const mockSearchResults: Operator[] = [
                    { nocCode: 'BLAC', name: 'Blackpool Transport' },
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ];
                const mocErrors: ErrorInfo[] = [];
                const operatorGroupName = '';
                const setSearchResults = jest.fn();
                const wrapper = shallow(
                    showSelectedOperators(
                        mocSelectedOperators,
                        setSelectedOperators,
                        mocErrors,
                        operatorGroupName,
                        mockSearchResults,
                        setSearchResults,
                        mockSearchResults,
                    ),
                );
                wrapper.find('#removeAll').simulate('click');
                expect(setSelectedOperators).toHaveBeenCalledWith([]);
            });
            it('should add operators to selectedOperator list', () => {
                const mocksearchText = 'blac';
                const mockErrors: ErrorInfo[] = [];
                const mockDatabaseSearchResultsCount = 2;
                const mockSelectedOperators: Operator[] = [];
                const setSelectedOperators = jest.fn();
                const mockSearchResults: Operator[] = [
                    { nocCode: 'BLAC', name: 'Blackpool Transport' },
                    { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
                ];
                const setSearchResults = jest.fn();

                const wrapper = shallow(
                    showSearchResults(
                        mocksearchText,
                        mockErrors,
                        mockDatabaseSearchResultsCount,
                        mockSelectedOperators,
                        setSelectedOperators,
                        mockSearchResults,
                        setSearchResults,
                    ),
                );

                wrapper.find('#operator-to-add-0').simulate('click');
                expect(setSelectedOperators).toHaveBeenCalledWith([{ nocCode: 'BLAC', name: 'Blackpool Transport' }]);
                expect(setSearchResults).toHaveBeenCalledWith([{ nocCode: 'LNUD', name: 'The Blackburn Bus Company' }]);
            });
        });

        describe('alphabetiseOperatorList', () => {
            it('takes an array of operators and sorts them according to their name', () => {
                const result = alphabetiseOperatorList(mockOperators);

                expect(result).toStrictEqual([
                    {
                        name: 'Blackpool Transport',
                        nocCode: 'BLAC',
                    },
                    {
                        name: 'IW Bus Co',
                        nocCode: 'IWBusCo',
                    },
                    {
                        name: "Warrington's Own Buses",
                        nocCode: 'WBTR',
                    },
                ]);
            });
        });
    });
});
