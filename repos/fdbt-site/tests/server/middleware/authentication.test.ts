import { NextFunction, Request, Response } from 'express';
import { requireAdmin } from '../../../server/middleware/authentication';
import { ID_TOKEN_COOKIE } from '../../../src/constants';
import { buildIdToken } from '../../testData/mockData';

const buildReqRes = (cookie: string): { req: Request; res: Response; next: NextFunction } => {
    const req = { headers: { cookie } } as unknown as Request;
    const res = { writeHead: jest.fn(), end: jest.fn() } as unknown as Response;
    const next = jest.fn();

    return { req, res, next };
};

describe('server middleware requireAdmin', () => {
    it('should call next() when the ID token contains the admin group', () => {
        const idToken = buildIdToken({ 'cognito:groups': ['admin'] });
        const { req, res, next } = buildReqRes(`${ID_TOKEN_COOKIE}=${idToken}`);

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.writeHead).not.toHaveBeenCalled();
    });

    it('should redirect to /home when the ID token does not contain the admin group', () => {
        const idToken = buildIdToken({ 'cognito:groups': ['someOtherGroup'] });
        const { req, res, next } = buildReqRes(`${ID_TOKEN_COOKIE}=${idToken}`);

        requireAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/home' });
    });

    it('should redirect to /home when the ID token has no groups claim at all', () => {
        const idToken = buildIdToken({});
        const { req, res, next } = buildReqRes(`${ID_TOKEN_COOKIE}=${idToken}`);

        requireAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/home' });
    });

    it('should redirect to /home when there is no ID token cookie at all', () => {
        const { req, res, next } = buildReqRes('');

        requireAdmin(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.writeHead).toHaveBeenCalledWith(302, { Location: '/home' });
    });
});
