import { getMockRequestAndResponse } from '../../testData/mockData';
import salesOfferPackages from '../../../src/pages/api/salesOfferPackages';
import * as session from '../../../src/utils/sessions';
import { ErrorInfo, SalesOfferPackageInfoWithErrors, SalesOfferPackageInfo } from '../../../src/interfaces';
import { SOP_INFO_ATTRIBUTE } from '../../../src/constants/attributes';

jest.mock('../../../src/utils/sessions');

describe('salesOfferPackages', () => {
    const mockErrorObject: ErrorInfo = { errorMessage: expect.any(String), id: expect.any(String) };
    const updateSessionAttributeSpy = jest.spyOn(session, 'updateSessionAttribute');

    afterEach(() => {
        jest.resetAllMocks();
    });

    it('redirects back to /salesOfferPackages if there are no options selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {},
        });

        salesOfferPackages(req, res);

        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one purchaseLocations is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocations: 'OnBoard',
            },
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: ['OnBoard'],
            ticketFormats: [],
            paymentMethods: [],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one paymentMethods is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                paymentMethods: 'Cash',
            },
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: [],
            ticketFormats: [],
            paymentMethods: ['Cash'],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if only one ticketFormats is selected', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                ticketFormats: 'Paper Ticket',
            },
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: [],
            ticketFormats: ['Paper Ticket'],
            paymentMethods: [],
            errors: [mockErrorObject, mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects back to /salesOfferPackages if one selection is missing', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocations: ['OnBoard', 'Online Account'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfoWithErrors = {
            purchaseLocations: ['OnBoard', 'Online Account'],
            ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethods: [],
            errors: [mockErrorObject],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/salesOfferPackages',
        });
    });

    it('redirects to /describeSalesOfferPackage when at least one option has been selected from each section', () => {
        const { req, res } = getMockRequestAndResponse({
            body: {
                purchaseLocations: ['OnBoard', 'Online Account'],
                paymentMethods: ['Cash'],
                ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            },
        });
        const expectedSessionAttributeCall: SalesOfferPackageInfo = {
            purchaseLocations: ['OnBoard', 'Online Account'],
            ticketFormats: ['Paper Ticket', 'Debit/Credit card'],
            paymentMethods: ['Cash'],
        };

        salesOfferPackages(req, res);

        expect(updateSessionAttributeSpy).toHaveBeenCalledWith(req, SOP_INFO_ATTRIBUTE, expectedSessionAttributeCall);
        expect(res.writeHead).toHaveBeenCalledWith(302, {
            Location: '/describeSalesOfferPackage',
        });
    });
});
