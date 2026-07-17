import { getMockRequestAndResponse } from '../../testData/mockData';
import multipleOperators from '../../../src/pages/api/multipleOperators';
import * as sessions from '../../../src/utils/sessions';
import { OPERATOR_ATTRIBUTE } from '../../../src/constants/attributes';

describe('multipleOperators', () => {
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return 302 redirect to /fareType when an operator is provided, and sets operator attribute', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: { operator: 'Infinity Line|TEST' },
            uuid: {},
        });

        multipleOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, {
            name: 'Infinity Line',
            nocCode: 'TEST',
        });
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/home',
        });
    });

    it('should return 302 redirect to /multipleOperators when operator not provided', () => {
        const { req, res } = getMockRequestAndResponse({
            cookieValues: {},
            body: null,
        });

        multipleOperators(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, OPERATOR_ATTRIBUTE, {
            errors: [
                {
                    id: 'operators',
                    errorMessage: 'Choose an operator name and NOC from the options',
                },
            ],
        });
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/multipleOperators',
        });
    });
});
