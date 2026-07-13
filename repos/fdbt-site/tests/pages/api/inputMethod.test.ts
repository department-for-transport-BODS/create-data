import inputMethod from '../../../src/pages/api/inputMethod';
import { getMockRequestAndResponse } from '../../testData/mockData';
import * as sessions from '../../../src/utils/sessions';
import { INPUT_METHOD_ATTRIBUTE } from '../../../src/constants/attributes';

describe('inputMethod', () => {
    const writeHeadMock = jest.fn();
    const updateSessionAttributeSpy = jest.spyOn(sessions, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it.each([
        ['/csvUpload', 'csv is the selected input method', 'csv'],
        ['/howManyStages', 'manual is the selected input method', 'manual'],
        ['/error', 'an unexpected input method is provided', 'pdf'],
    ])('should return 302 redirect to %s when %s', (redirect, _case, selectedInputMethod) => {
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
            body: { inputMethod: selectedInputMethod },
        });
        inputMethod(req, res);
        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: redirect,
        });
    });

    it('should return 302 redirect to /inputMethod when no input method is selected', () => {
        const mockError = { errorMessage: expect.any(String), id: 'csv-upload' };
        const { req, res } = getMockRequestAndResponse({
            mockWriteHeadFn: writeHeadMock,
        });
        inputMethod(req, res);

        expect(writeHeadMock).toHaveBeenCalledWith(302, {
            Location: '/inputMethod',
        });
        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, INPUT_METHOD_ATTRIBUTE, mockError);
    });
});
