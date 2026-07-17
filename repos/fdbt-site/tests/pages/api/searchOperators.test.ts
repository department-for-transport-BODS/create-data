import {
    expectedMultiOperatorExtGeoZoneTicketWithMultipleProducts,
    expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
    expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
    expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperatorsExt,
    expectedSingleTicket,
    getMockRequestAndResponse,
} from '../../testData/mockData';
import searchOperators, {
    replaceSelectedOperatorsWithUserSelectedOperators,
    isSearchInputValid,
    updateAssociatedProducts,
} from '../../../src/pages/api/searchOperators';
import * as session from '../../../src/utils/sessions';
import { Operator, MultipleOperatorsAttributeWithErrors } from '../../../src/interfaces';
import { MULTIPLE_OPERATOR_ATTRIBUTE, TICKET_REPRESENTATION_ATTRIBUTE } from '../../../src/constants/attributes';
import * as auroradb from '../../../src/data/auroradb';
import * as s3 from '../../../src/data/s3';
import * as userDataFunctions from '../../../src/utils/apiUtils/userData';
import { MyFaresOtherProduct } from '../../../src/interfaces/dbTypes';
import {
    MultiOperatorGeoZoneTicket,
    MultiOperatorMultipleServicesTicket,
    WithIds,
} from '../../../src/interfaces/matchingJsonTypes';
import { PRODUCTS_DATA_BUCKET_NAME } from '../../../src/constants';

describe('searchOperators', () => {
    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('replaceSelectedOperatorsWithUserSelectedOperators', () => {
        it('should update operators to the list of selected operators', () => {
            const mockUpdatedList = [
                {
                    name: 'Blackpool Transport',
                    nocCode: 'BLAC',
                },
                {
                    name: "Warrington's Own Buses",
                    nocCode: 'WBTR',
                },
            ];
            const mockNewOperators = ['BLAC#Blackpool Transport', "WBTR#Warrington's Own Buses"];
            const updatedList = replaceSelectedOperatorsWithUserSelectedOperators(mockNewOperators);
            expect(updatedList).toEqual(mockUpdatedList);
        });
    });

    describe('isSearchInputValid', () => {
        it.each([
            [true, 'only valid', 'blackburn - bus'],
            [false, 'invalid', 'bl@ckpoo| tran$port'],
        ])('should return %s when a search term contains %s characters', (expectedValidity, _case, searchText) => {
            const actualValidity = isSearchInputValid(searchText);
            expect(actualValidity).toBe(expectedValidity);
        });
    });

    describe('updateAssociatedProducts', () => {
        it('updates each product in the database and matching JSON files (fare zone variation)', async () => {
            const getProductsByOperatorGroupIdMock = jest.spyOn(auroradb, 'getProductsByOperatorGroupId');
            const getProductsMatchingJsonMock = jest.spyOn(s3, 'getProductsMatchingJson');
            const insertProductAdditionalNocsMock = jest.spyOn(auroradb, 'insertProductAdditionalNocs');
            const deleteProductAdditionalNocsMock = jest.spyOn(auroradb, 'deleteProductAdditionalNocs');
            const updateProductIncompleteStatusMock = jest.spyOn(auroradb, 'updateProductIncompleteStatus');
            const putUserDataInProductsBucketWithFilePathMock = jest.spyOn(
                userDataFunctions,
                'putUserDataInProductsBucketWithFilePath',
            );
            const deleteMultipleObjectsFromS3Mock = jest.spyOn(s3, 'deleteMultipleObjectsFromS3');

            const productsByOperatorGroupId: MyFaresOtherProduct[] = [
                {
                    id: 1,
                    nocCode: 'TEST',
                    fareType: 'multiOperatorExt',
                    matchingJsonLink: 'TEST_1234.json',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
                {
                    id: 2,
                    nocCode: 'TEST',
                    fareType: 'multiOperator',
                    matchingJsonLink: 'TEST-2',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
                {
                    id: 3,
                    nocCode: 'TEST',
                    fareType: 'single',
                    matchingJsonLink: 'TEST-3',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
            ];
            const selectedOperatorNocs = ['BLAC', 'ABCD'];

            const updatedTicketMultiOperatorExt: WithIds<MultiOperatorGeoZoneTicket> = {
                ...expectedMultiOperatorExtGeoZoneTicketWithMultipleProducts,
                additionalNocs: selectedOperatorNocs,
            };

            const updatedTicketMultiOperator: WithIds<MultiOperatorGeoZoneTicket> = {
                ...expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
                additionalNocs: selectedOperatorNocs,
            };

            getProductsByOperatorGroupIdMock.mockResolvedValue(productsByOperatorGroupId);
            insertProductAdditionalNocsMock.mockResolvedValue(void 0);
            deleteProductAdditionalNocsMock.mockResolvedValue(void 0);
            updateProductIncompleteStatusMock.mockResolvedValue(void 0);
            getProductsMatchingJsonMock.mockResolvedValueOnce(
                expectedMultiOperatorExtGeoZoneTicketWithMultipleProducts,
            );
            getProductsMatchingJsonMock.mockResolvedValueOnce(expectedMultiOperatorGeoZoneTicketWithMultipleProducts);
            getProductsMatchingJsonMock.mockResolvedValueOnce(expectedSingleTicket);
            putUserDataInProductsBucketWithFilePathMock.mockResolvedValue('');
            deleteMultipleObjectsFromS3Mock.mockResolvedValue(void 0);

            await updateAssociatedProducts(productsByOperatorGroupId[0].nocCode, 123, selectedOperatorNocs);

            expect(getProductsMatchingJsonMock).toHaveBeenCalledTimes(2);
            expect(getProductsMatchingJsonMock).toHaveBeenNthCalledWith(
                1,
                productsByOperatorGroupId[0].matchingJsonLink,
            );
            expect(getProductsMatchingJsonMock).toHaveBeenNthCalledWith(
                2,
                productsByOperatorGroupId[1].matchingJsonLink,
            );
            expect(insertProductAdditionalNocsMock).toHaveBeenCalledTimes(1);
            expect(insertProductAdditionalNocsMock).toHaveBeenCalledWith(1, ['ABCD']);
            expect(deleteProductAdditionalNocsMock).toHaveBeenCalledTimes(1);
            expect(deleteProductAdditionalNocsMock).toHaveBeenCalledWith(1, ['MCTR', 'WBTR']);
            expect(updateProductIncompleteStatusMock).toHaveBeenCalledTimes(1);
            expect(updateProductIncompleteStatusMock).toHaveBeenCalledWith(2, true);
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenCalledTimes(2);
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenNthCalledWith(
                1,
                updatedTicketMultiOperatorExt,
                productsByOperatorGroupId[0].matchingJsonLink,
            );
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenNthCalledWith(
                2,
                updatedTicketMultiOperator,
                productsByOperatorGroupId[1].matchingJsonLink,
            );
            expect(deleteMultipleObjectsFromS3Mock).toHaveBeenCalledTimes(1);
            expect(deleteMultipleObjectsFromS3Mock).toHaveBeenCalledWith(
                ['TEST_1234_MCTR.json', 'TEST_1234_WBTR.json'],
                PRODUCTS_DATA_BUCKET_NAME,
            );
        });

        it('updates each product in the database and matching JSON files (selected services variation)', async () => {
            const getProductsByOperatorGroupIdMock = jest.spyOn(auroradb, 'getProductsByOperatorGroupId');
            const getProductsMatchingJsonMock = jest.spyOn(s3, 'getProductsMatchingJson');
            const insertProductAdditionalNocsMock = jest.spyOn(auroradb, 'insertProductAdditionalNocs');
            const deleteProductAdditionalNocsMock = jest.spyOn(auroradb, 'deleteProductAdditionalNocs');
            const updateProductIncompleteStatusMock = jest.spyOn(auroradb, 'updateProductIncompleteStatus');
            const putUserDataInProductsBucketWithFilePathMock = jest.spyOn(
                userDataFunctions,
                'putUserDataInProductsBucketWithFilePath',
            );
            const deleteMultipleObjectsFromS3Mock = jest.spyOn(s3, 'deleteMultipleObjectsFromS3');

            const productsByOperatorGroupId: MyFaresOtherProduct[] = [
                {
                    id: 1,
                    nocCode: 'TEST',
                    fareType: 'multiOperatorExt',
                    matchingJsonLink: 'TEST_1234.json',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
                {
                    id: 2,
                    nocCode: 'TEST',
                    fareType: 'multiOperator',
                    matchingJsonLink: 'TEST-2',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
                {
                    id: 3,
                    nocCode: 'TEST',
                    fareType: 'single',
                    matchingJsonLink: 'TEST-3',
                    startDate: '2021-01-01',
                    incomplete: false,
                },
            ];
            const selectedOperatorNocs = ['BLAC', 'ABCD'];

            const updatedTicketMultiOperatorExt: WithIds<MultiOperatorMultipleServicesTicket> = {
                ...expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperatorsExt,
                additionalOperators: [
                    {
                        nocCode: 'BLAC',
                        selectedServices: [],
                    },
                    {
                        nocCode: 'ABCD',
                        selectedServices: [],
                    },
                ],
            };

            const updatedTicketMultiOperator: WithIds<MultiOperatorMultipleServicesTicket> = {
                ...expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
                additionalOperators: [
                    {
                        nocCode: 'BLAC',
                        selectedServices:
                            expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators
                                .additionalOperators[1].selectedServices,
                    },
                    {
                        nocCode: 'ABCD',
                        selectedServices: [],
                    },
                ],
            };

            getProductsByOperatorGroupIdMock.mockResolvedValue(productsByOperatorGroupId);
            insertProductAdditionalNocsMock.mockResolvedValue(void 0);
            deleteProductAdditionalNocsMock.mockResolvedValue(void 0);
            updateProductIncompleteStatusMock.mockResolvedValue(void 0);
            getProductsMatchingJsonMock.mockResolvedValueOnce(
                expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperatorsExt,
            );
            getProductsMatchingJsonMock.mockResolvedValueOnce(
                expectedPeriodMultipleServicesTicketWithMultipleProductsAndMultipleOperators,
            );
            getProductsMatchingJsonMock.mockResolvedValueOnce(expectedSingleTicket);
            putUserDataInProductsBucketWithFilePathMock.mockResolvedValue('');
            deleteMultipleObjectsFromS3Mock.mockResolvedValue(void 0);

            await updateAssociatedProducts(productsByOperatorGroupId[0].nocCode, 123, selectedOperatorNocs);

            expect(getProductsMatchingJsonMock).toHaveBeenCalledTimes(2);
            expect(getProductsMatchingJsonMock).toHaveBeenNthCalledWith(
                1,
                productsByOperatorGroupId[0].matchingJsonLink,
            );
            expect(getProductsMatchingJsonMock).toHaveBeenNthCalledWith(
                2,
                productsByOperatorGroupId[1].matchingJsonLink,
            );
            expect(insertProductAdditionalNocsMock).toHaveBeenCalledTimes(1);
            expect(insertProductAdditionalNocsMock).toHaveBeenCalledWith(1, ['ABCD']);
            expect(deleteProductAdditionalNocsMock).toHaveBeenCalledTimes(1);
            expect(deleteProductAdditionalNocsMock).toHaveBeenCalledWith(1, ['WBTR', 'TESTSCHEME']);
            expect(updateProductIncompleteStatusMock).toHaveBeenCalledTimes(1);
            expect(updateProductIncompleteStatusMock).toHaveBeenCalledWith(2, true);
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenCalledTimes(2);
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenNthCalledWith(
                1,
                updatedTicketMultiOperatorExt,
                productsByOperatorGroupId[0].matchingJsonLink,
            );
            expect(putUserDataInProductsBucketWithFilePathMock).toHaveBeenNthCalledWith(
                2,
                updatedTicketMultiOperator,
                productsByOperatorGroupId[1].matchingJsonLink,
            );
            expect(deleteMultipleObjectsFromS3Mock).toHaveBeenCalledTimes(1);
            expect(deleteMultipleObjectsFromS3Mock).toHaveBeenCalledWith(
                ['TEST_1234_WBTR.json', 'TEST_1234_TESTSCHEME.json'],
                PRODUCTS_DATA_BUCKET_NAME,
            );
        });
    });

    it('should redirect to itself (i.e. /searchOperators) with search text in the query string when the search term is valid', async () => {
        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLAC', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                search: 'Search',
                searchText: 'manchester',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
            },
        });

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATOR_ATTRIBUTE, {
            selectedOperators: [],
        });

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/searchOperators?searchOperator=manchester',
        });
    });

    it('should redirect to itself (i.e. /searchOperators) with search input errors when the user enters an invalid search term', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                search: 'Search',
                searchText: 'ab',
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: [],
            errors: [
                {
                    errorMessage: 'Search requires a minimum of three characters',
                    id: 'search-input',
                },
            ],
        };

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/searchOperators',
        });
    });

    it('should redirect to /searchOperators with errors when the user does not provide a name', async () => {
        jest.spyOn(auroradb, 'operatorHasBodsServices').mockResolvedValue(true);
        jest.spyOn(auroradb, 'operatorHasFerryOrTramServices').mockResolvedValue(false);
        jest.spyOn(auroradb, 'getOperatorGroupsByNameAndNoc').mockResolvedValue(undefined);

        const mockUserSelectedOperators: string[] = ['BLAC#Blackpool Transport', 'LNUD#The Blackburn Bus Company'];
        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLAC', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                userSelectedOperators: mockUserSelectedOperators,
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
                [TICKET_REPRESENTATION_ATTRIBUTE]: {
                    name: 'geoZone',
                },
            },
        });

        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: mockSelectedOperators,
            errors: [
                {
                    errorMessage: 'Provide a name for the operator group',
                    id: 'operator-group-name',
                },
            ],
        };

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/searchOperators',
        });
    });

    it("should redirect with errors when the user clicks the 'Confirm operators and continue' button and one of the selected operators has no bods services and no tnds tram or ferry services", async () => {
        jest.spyOn(auroradb, 'operatorHasBodsServices').mockResolvedValue(false);
        jest.spyOn(auroradb, 'operatorHasFerryOrTramServices').mockResolvedValue(false);
        const mockUserSelectedOperators: string[] = ['BLAC#Blackpool Transport', 'LNUD#The Blackburn Bus Company'];
        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLAC', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];
        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                userSelectedOperators: mockUserSelectedOperators,
                searchText: '',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
            },
        });
        const expectedSessionAttributeCall: MultipleOperatorsAttributeWithErrors = {
            selectedOperators: mockSelectedOperators,
            errors: [
                {
                    errorMessage:
                        'Some of the selected operators have no services. To continue you must only select operators which have services in BODS, or operators who have Ferry/Tram services in TNDS',
                    id: 'search-input',
                },
                { errorMessage: 'Blackpool Transport', id: 'search-input' },
                { errorMessage: 'The Blackburn Bus Company', id: 'search-input' },
            ],
        };

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(
            req,
            MULTIPLE_OPERATOR_ATTRIBUTE,
            expectedSessionAttributeCall,
        );
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/searchOperators',
        });
    });

    it('should redirect to /viewOperatorGroups when the user has successfully selected operators with services in BODS', async () => {
        jest.spyOn(auroradb, 'operatorHasBodsServices').mockResolvedValue(true);
        jest.spyOn(auroradb, 'operatorHasFerryOrTramServices').mockResolvedValue(false);
        jest.spyOn(auroradb, 'getOperatorGroupsByNameAndNoc').mockResolvedValue(undefined);
        jest.spyOn(auroradb, 'insertOperatorGroup').mockResolvedValue();

        const mockUserSelectedOperators: string[] = ['BLAC#Blackpool Transport', 'LNUD#The Blackburn Bus Company'];
        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLAC', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                userSelectedOperators: mockUserSelectedOperators,
                searchText: '',
                operatorGroupName: 'Operator Group',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
            },
        });

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATOR_ATTRIBUTE, undefined);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/viewOperatorGroups',
        });
    });

    it('should redirect to /viewOperatorGroups when the user has successfully selected operators with ferry/tram services in TNDS', async () => {
        jest.spyOn(auroradb, 'operatorHasBodsServices').mockResolvedValue(false);
        jest.spyOn(auroradb, 'operatorHasFerryOrTramServices').mockResolvedValue(true);
        jest.spyOn(auroradb, 'getOperatorGroupsByNameAndNoc').mockResolvedValue(undefined);
        jest.spyOn(auroradb, 'insertOperatorGroup').mockResolvedValue();

        const mockUserSelectedOperators: string[] = ['BLAC#Blackpool Transport', 'LNUD#The Blackburn Bus Company'];
        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLAC', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];

        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                userSelectedOperators: mockUserSelectedOperators,
                searchText: '',
                operatorGroupName: 'Operator Group',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
            },
        });

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATOR_ATTRIBUTE, undefined);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/viewOperatorGroups',
        });
    });

    it('should call updateSessionAttribute with undefined & update operator group when in Edit mode', async () => {
        jest.spyOn(auroradb, 'operatorHasBodsServices').mockResolvedValue(true);
        jest.spyOn(auroradb, 'operatorHasFerryOrTramServices').mockResolvedValue(false);
        jest.spyOn(auroradb, 'updateOperatorGroup').mockResolvedValue();
        jest.spyOn(auroradb, 'getOperatorGroupsByNameAndNoc').mockResolvedValue(undefined);
        jest.spyOn(auroradb, 'getProductsByOperatorGroupId').mockResolvedValue([]);

        const mockSelectedOperators: Operator[] = [
            { nocCode: 'BLACK', name: 'Blackpool Transport' },
            { nocCode: 'LNUD', name: 'The Blackburn Bus Company' },
        ];
        const mockUserSelectedOperators: string[] = ['BLACK#Blackpool Transport', 'LNUD#The Blackburn Bus Company'];
        const { req, res } = getMockRequestAndResponse({
            body: {
                continueButtonClick: 'Continue',
                userSelectedOperators: mockUserSelectedOperators,
                searchText: '',
                operatorGroupName: 'Operator Group',
                id: '1',
            },
            session: {
                [MULTIPLE_OPERATOR_ATTRIBUTE]: {
                    selectedOperators: mockSelectedOperators,
                },
            },
        });

        await searchOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATOR_ATTRIBUTE, undefined);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/viewOperatorGroups',
        });
    });
});
