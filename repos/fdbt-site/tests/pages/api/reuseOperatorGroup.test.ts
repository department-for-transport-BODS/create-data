import {
    FARE_TYPE_ATTRIBUTE,
    MATCHING_JSON_ATTRIBUTE,
    MATCHING_JSON_META_DATA_ATTRIBUTE,
    MULTIPLE_OPERATOR_ATTRIBUTE,
    REUSE_OPERATOR_GROUP_ATTRIBUTE,
    TICKET_REPRESENTATION_ATTRIBUTE,
} from '../../../src/constants/attributes';
import {
    expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
    getMockRequestAndResponse,
} from '../../testData/mockData';
import * as userData from '../../../src/utils/apiUtils/userData';
import * as sessions from '../../../src/utils/sessions';
import reuseOperatorGroup from '../../../src/pages/api/reuseOperatorGroup';
import * as auroradb from '../../../src/data/auroradb';
import * as index from '../../../src/utils/apiUtils/index';

jest.mock('../../../src/utils/sessions');
jest.mock('../../../src/utils/apiUtils/userData');
jest.mock('../../../src/data/auroradb');
jest.mock('../../../src/utils/apiUtils/index');

describe('reuseOperatorGroup', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    const writeHeadMock = jest.fn();
    const s3Spy = jest.spyOn(userData, 'putUserDataInProductsBucketWithFilePath');
    s3Spy.mockImplementation(() => Promise.resolve('pathToFile'));

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should redirect back to reuseOperatorGroup with errors if the user does not select a radio button', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
            errors: [{ errorMessage: 'Choose an operator group from the options below', id: 'operatorGroup' }],
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/reuseOperatorGroup' });
    });

    it('should redirect back to reuseOperatorGroup with errors if the user post the invalid operator group id', async () => {
        const getOperatorGroupByNocAndId = jest.spyOn(auroradb, 'getOperatorGroupByNocAndId');

        getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue(undefined);
        const { req, res } = getMockRequestAndResponse({
            body: { operatorGroupId: '99' },
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
            errors: [{ errorMessage: 'Select a valid operator group', id: 'operatorGroup' }],
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/reuseOperatorGroup' });
    });

    it('should update the MULTIPLE_OPERATOR_ATTRIBUTE with the selected operator group operators if selected', async () => {
        const getOperatorGroupByNocAndId = jest.spyOn(auroradb, 'getOperatorGroupByNocAndId');
        const testOperators = [
            {
                name: 'Best Op 1',
                nocCode: 'BO1',
            },
            {
                name: 'Best Op 2',
                nocCode: 'BO3',
            },
            {
                name: 'Best Op Supreme',
                nocCode: 'BOS',
            },
        ];
        const operatorGroupId = 1;

        getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue({
            id: operatorGroupId,
            name: 'Best Ops',
            operators: testOperators,
        });
        const { req, res } = getMockRequestAndResponse({
            body: { operatorGroupId },
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(getOperatorGroupByNocAndId).toHaveBeenCalledWith(1, 'TEST');
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
            operatorGroupId,
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATOR_ATTRIBUTE, {
            selectedOperators: testOperators,
            id: 1,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/multipleProducts' });
    });

    it('should redirect to /multipleOperatorsServiceList if operator group reused, is scheme operator, and fareType is flat fare', async () => {
        const getOperatorGroupByNocAndId = jest.spyOn(auroradb, 'getOperatorGroupByNocAndId');
        const testOperators = [
            {
                name: 'Best Op 1',
                nocCode: 'BO1',
            },
            {
                name: 'Best Op 2',
                nocCode: 'BO3',
            },
            {
                name: 'Best Op Supreme',
                nocCode: 'BOS',
            },
        ];
        const operatorGroupId = 1;

        getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue({
            id: operatorGroupId,
            name: 'Best Ops',
            operators: testOperators,
        });
        const isSchemeOperatorSpy = jest.spyOn(index, 'isSchemeOperator');
        isSchemeOperatorSpy.mockImplementation(() => true);
        const { req, res } = getMockRequestAndResponse({
            body: { operatorGroupId },
            session: {
                [TICKET_REPRESENTATION_ATTRIBUTE]: {
                    name: 'multipleServices',
                },
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'flatFare',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
            operatorGroupId,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/multiOperatorServiceList' });
    });

    it('should redirect to /multipleOperatorsServiceList for multi operator flat fare ticket', async () => {
        const getOperatorGroupByNocAndId = jest.spyOn(auroradb, 'getOperatorGroupByNocAndId');
        const testOperators = [
            {
                name: 'Best Op 1',
                nocCode: 'BO1',
            },
            {
                name: 'Best Op 2',
                nocCode: 'BO3',
            },
            {
                name: 'Best Op Supreme',
                nocCode: 'BOS',
            },
        ];
        const operatorGroupId = 1;

        getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue({
            id: operatorGroupId,
            name: 'Best Ops',
            operators: testOperators,
        });
        const isSchemeOperatorSpy = jest.spyOn(index, 'isSchemeOperator');
        isSchemeOperatorSpy.mockImplementation(() => true);
        const { req, res } = getMockRequestAndResponse({
            body: { operatorGroupId },
            session: {
                [TICKET_REPRESENTATION_ATTRIBUTE]: {
                    name: 'multipleServicesFlatFareMultiOperator',
                },
                [FARE_TYPE_ATTRIBUTE]: {
                    fareType: 'multiOperator',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, REUSE_OPERATOR_GROUP_ATTRIBUTE, {
            operatorGroupId,
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, { Location: '/multiOperatorServiceList' });
    });

    it('should update the multi operators for geozone ticket when in edit mode and redirect back to products/productDetails', async () => {
        const getOperatorGroupByNocAndId = jest.spyOn(auroradb, 'getOperatorGroupByNocAndId');
        const testOperators = [
            {
                name: 'Best Op 1',
                nocCode: 'BO1',
            },
            {
                name: 'Best Op 2',
                nocCode: 'BO3',
            },
            {
                name: 'Best Op Supreme',
                nocCode: 'BOS',
            },
        ];
        getOperatorGroupByNocAndId.mockImplementation().mockResolvedValue({
            id: 1,
            name: 'Best Ops',
            operators: testOperators,
        });

        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: {
                operatorGroupId: '1',
            },
            uuid: {},
            session: {
                [MATCHING_JSON_ATTRIBUTE]: expectedMultiOperatorGeoZoneTicketWithMultipleProducts,
                [MATCHING_JSON_META_DATA_ATTRIBUTE]: {
                    productId: '2',
                    matchingJsonLink: 'test/path',
                },
            },
            mockWriteHeadFn: writeHeadMock,
        });
        await reuseOperatorGroup(req, res);

        expect(userData.putUserDataInProductsBucketWithFilePath).toHaveBeenCalledWith(
            { ...expectedMultiOperatorGeoZoneTicketWithMultipleProducts, additionalNocs: ['BO1', 'BO3', 'BOS'] },
            'test/path',
        );

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/products/productDetails?productId=2',
        });
    });
});
