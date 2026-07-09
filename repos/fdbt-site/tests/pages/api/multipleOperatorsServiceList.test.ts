import { MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE } from '../../../src/constants/attributes';
import { getMockRequestAndResponse } from '../../testData/mockData';
import getMultiOperatorServiceList, {
    getMultiOperatorsDataFromRequest,
} from '../../../src/pages/api/multipleOperatorsServiceList';
import * as sessions from '../../../src/utils/sessions';

jest.mock('../../../src/utils/sessions');

describe('getMultiOperatorsDataFromRequests tests', () => {
    it('should return operator data for one operator', () => {
        const response = getMultiOperatorsDataFromRequest({ 'BLAC#237#123#abc#12/06/2020': 'Some description' });
        expect(response).toEqual([
            {
                nocCode: 'BLAC',
                selectedServices: [
                    {
                        lineId: '123',
                        lineName: '237',
                        serviceCode: 'abc',
                        serviceDescription: 'Some description',
                        startDate: '12/06/2020',
                    },
                ],
            },
        ]);
    });

    it('should return operator data for more than one operator', () => {
        const response = getMultiOperatorsDataFromRequest({
            'LNUD#259#vHaXmz#YWAO259#YWAO259#25/03/2020': 'Brighouse - East Bierley',
            'LNUD#263#xZ0pem#YWAO263#YWAO263#25/02/2019': 'Bradford - Dewsbury',
            'LNUD#341#cCQkuR#YWAO341#YWAO341#25/03/2020': 'Stocksmoor - Huddersfield',
            'NWBT#4#DnmNdy#NW_05_NWBT_4_1#NW_05_NWBT_4_1#02/01/2020':
                'CLITHEROE - PEEL PARK CIRCULAR via Claremont Ave, Standen Rd, Langshaw Dr, Turner St, Victoria St',
            'NWBT#15#rLjpBT#NW_05_NWBT_15_1#NW_05_NWBT_15_1#28/03/2020':
                'BURNLEY - BURNLEY via Rose Hill Road, Moorland Road',
            'NWBT#15A#02SfpM#NW_05_NWBT_15A_1#NW_05_NWBT_15A_1#28/03/2020':
                'BURNLEY - BURNLEY via Branch Road, Moorland Road',
        });
        expect(response).toEqual([
            {
                nocCode: 'LNUD',
                selectedServices: [
                    {
                        lineId: 'vHaXmz',
                        lineName: '259',
                        serviceCode: 'YWAO259',
                        serviceDescription: 'Brighouse - East Bierley',
                        startDate: 'YWAO259',
                    },
                    {
                        lineId: 'xZ0pem',
                        lineName: '263',
                        serviceCode: 'YWAO263',
                        serviceDescription: 'Bradford - Dewsbury',
                        startDate: 'YWAO263',
                    },
                    {
                        lineId: 'cCQkuR',
                        lineName: '341',
                        serviceCode: 'YWAO341',
                        serviceDescription: 'Stocksmoor - Huddersfield',
                        startDate: 'YWAO341',
                    },
                ],
            },
            {
                nocCode: 'NWBT',
                selectedServices: [
                    {
                        lineId: 'DnmNdy',
                        lineName: '4',
                        serviceCode: 'NW_05_NWBT_4_1',
                        serviceDescription:
                            'CLITHEROE - PEEL PARK CIRCULAR via Claremont Ave, Standen Rd, Langshaw Dr, Turner St, Victoria St',
                        startDate: 'NW_05_NWBT_4_1',
                    },
                    {
                        lineId: 'rLjpBT',
                        lineName: '15',
                        serviceCode: 'NW_05_NWBT_15_1',
                        serviceDescription: 'BURNLEY - BURNLEY via Rose Hill Road, Moorland Road',
                        startDate: 'NW_05_NWBT_15_1',
                    },
                    {
                        lineId: '02SfpM',
                        lineName: '15A',
                        serviceCode: 'NW_05_NWBT_15A_1',
                        serviceDescription: 'BURNLEY - BURNLEY via Branch Road, Moorland Road',
                        startDate: 'NW_05_NWBT_15A_1',
                    },
                ],
            },
        ]);
    });

    it('should return no data when there is no operator info', () => {
        const response = getMultiOperatorsDataFromRequest({});
        expect(response).toEqual([]);
    });
});

describe('multiOperatorServiceList tests', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');
    beforeEach(() => {
        jest.resetAllMocks();
    });
    const writeHeadMock = jest.fn();

    it('should redirect and produce error when operator count does not match number of multi operator data', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                operatorCount: 1,
                'BLAC#237#123#abc#12/06/2020': 'Some description',
                'LNUD#145#12345#cdb#10/07/2021': 'Some description 2',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            mockEndFn: jest.fn(),
            session: {},
        });
        await getMultiOperatorServiceList(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE, {
            multiOperatorInfo: [
                {
                    nocCode: 'BLAC',
                    selectedServices: [
                        {
                            lineId: '123',
                            lineName: '237',
                            serviceCode: 'abc',
                            serviceDescription: 'Some description',
                            startDate: '12/06/2020',
                        },
                    ],
                },
                {
                    nocCode: 'LNUD',
                    selectedServices: [
                        {
                            lineId: '12345',
                            lineName: '145',
                            serviceCode: 'cdb',
                            serviceDescription: 'Some description 2',
                            startDate: '10/07/2021',
                        },
                    ],
                },
            ],
            errors: [
                {
                    id: 'service-to-add-0',
                    errorMessage: 'All operators need to have at least one service selected',
                },
            ],
        });
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/multiOperatorServiceList',
        });
    });

    it('should redirect to multi products page', async () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                operatorCount: 2,
                selectedOperatorCount: 2,
                'BLAC#237#123#abc#12/06/2020': 'Some description',
                'LNUD#145#12345#cdb#10/07/2021': 'Some description 2',
            },
            uuid: {},
            mockWriteHeadFn: writeHeadMock,
            mockEndFn: jest.fn(),
            session: {},
        });
        await getMultiOperatorServiceList(req, res);
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, MULTIPLE_OPERATORS_SERVICES_ATTRIBUTE, [
            {
                nocCode: 'BLAC',
                selectedServices: [
                    {
                        lineId: '123',
                        lineName: '237',
                        serviceCode: 'abc',
                        serviceDescription: 'Some description',
                        startDate: '12/06/2020',
                    },
                ],
            },
            {
                nocCode: 'LNUD',
                selectedServices: [
                    {
                        lineId: '12345',
                        lineName: '145',
                        serviceCode: 'cdb',
                        serviceDescription: 'Some description 2',
                        startDate: '10/07/2021',
                    },
                ],
            },
        ]);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/multipleProducts',
        });
    });
});
