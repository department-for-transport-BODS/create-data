import express, { Request, Response, Express, NextFunction } from 'express';
import nextjs from 'next';
import requireAuth, { setDisableAuthParameters } from './middleware/authentication';
import setupCsrfProtection from './middleware/csrf';
import setSecurityHeaders from './middleware/security';
import setupLogging from './middleware/logging';
import setupSessions from './middleware/sessions';
import logger from '../src/utils/logger';
import { redirectTo } from '../src/utils/apiUtils';
import rateLimit from 'express-rate-limit';

const dev = process.env.NODE_ENV !== 'production';
const app = nextjs({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 5555;

const unauthenticatedGetRoutes = [
    '/',
    '/login',
    '/register',
    '/confirmRegistration',
    '/forgotPassword',
    '/resetConfirmation',
    '/resetPassword',
    '/passwordUpdated',
    '/resetLinkExpired',
    '/_next/*',
    '/assets/*',
    '/scripts/*',
    '/error',
    '/contact',
    '/requestAccess',
    '/cookies',
    '/cookieDetails',
    '/accessibility',
    '/privacy',
    '/noServices',
    '/robots.txt',
    '/changelog',
    '/images/*',
];

const unauthenticatedPostRoutes = [
    '/api/login',
    '/api/register',
    '/api/forgotPassword',
    '/api/resetPassword',
    '/api/cookies',
    '/api/cookieDetails',
];

const setStaticRoutes = (server: Express): void => {
    const rootPath = process.env.NODE_ENV === 'development' ? `${__dirname}/..` : `${__dirname}/../..`;

    server.use(
        '/assets',
        express.static(`${rootPath}/node_modules/govuk-frontend/dist/govuk/assets`, {
            maxAge: '365d',
            immutable: true,
        }),
    );

    if (process.env.NODE_ENV !== 'development') {
        server.use(
            '/_next/static',
            express.static(`${rootPath}/.next/static`, {
                maxAge: '365d',
                immutable: true,
            }),
        );
    }

    server.use(
        '/scripts',
        express.static(`${rootPath}/node_modules/govuk-frontend/dist/govuk/`, {
            maxAge: '365d',
            immutable: true,
        }),
    );
};

void (async (): Promise<void> => {
    try {
        await app.prepare();
        const server = express();

        server.enable('trust proxy');

        setupLogging(server);
        setStaticRoutes(server);
        setSecurityHeaders(server);

        // Next.js/Turbopack serves some internal files (e.g. _clientMiddlewareManifest.js)
        // with application/json content-type. Remove nosniff for _next routes so the
        // browser doesn't block them under strict MIME type checking.
        server.use('/_next', (_req: Request, res: Response, next: NextFunction) => {
            res.removeHeader('X-Content-Type-Options');
            next();
        });

        setupCsrfProtection(server);
        await setupSessions(server);
        setDisableAuthParameters(server);

        unauthenticatedGetRoutes.forEach((route) => {
            server.get(route, (req: Request, res: Response) => {
                res.locals.csrfToken = req.csrfToken();
                return handle(req, res);
            });
        });

        unauthenticatedPostRoutes.forEach((route) => {
            server.post(route, (req: Request, res: Response) => {
                return handle(req, res);
            });
        });

        const definePricingPerDistanceLimiter = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: 'Too many requests from this IP, please try again after 15 minutes',
        });

        server.use('/definePricingPerDistance', definePricingPerDistanceLimiter);

        server.get('/definePricingPerDistance', requireAuth, (req, res) => {
            if (process.env.STAGE !== 'dev') {
                redirectTo(res, '/error');
                return;
            }
            res.locals.csrfToken = req.csrfToken();
            return handle(req, res);
        });

        server.get('*', requireAuth, (req: Request, res: Response) => {
            res.locals.csrfToken = req.csrfToken();
            return handle(req, res);
        });

        server.all('*', requireAuth, (req: Request, res: Response) => {
            return handle(req, res);
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        server.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
            if (error.name === 'URIError') {
                logger.warn('URI Error - Invalid URL Provided', { error: error.stack });
            } else {
                logger.error('Uncaught Error', { error: error.stack });
            }

            redirectTo(res, '/error');
        });

        server.listen(port, (err?: Error) => {
            if (err) {
                throw err;
            }
            logger.info('', {
                context: 'server.index',
                message: `> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`,
            });
        });
    } catch (error) {
        logger.error(error, { context: 'server.index' });
        process.exit(1);
    }
})();
