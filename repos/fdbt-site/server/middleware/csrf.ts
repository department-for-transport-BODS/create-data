import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import type { ErrorRequestHandler, Express } from 'express';
import logger from '../../src/utils/logger';

export default (server: Express): void => {
    server.use(cookieParser());

    server.use(
        csurf({
            cookie: {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV !== 'development',
            },
        }),
    );

    const csrfErrorHandler: ErrorRequestHandler = (error, _req, res, next) => {
        if (error.code !== 'EBADCSRFTOKEN') {
            next(error);
            return;
        }

        logger.warn(error, {
            context: 'server.middleware.csrf',
            message: 'invalid csrf',
        });
        res.redirect('/error');
    };

    server.use(csrfErrorHandler);
};
