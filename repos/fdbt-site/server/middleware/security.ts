import { Express, Response } from 'express';
import { IncomingMessage, ServerResponse } from 'node:http';
import { v4 as uuidv4 } from 'uuid';
import helmet from 'helmet';
import nocache from 'nocache';

export default (server: Express): void => {
    server.use((_req, res, next) => {
        res.locals.nonce = Buffer.from(uuidv4()).toString('base64');
        next();
    });

    server.disable('x-powered-by');

    const nonce = (_req: IncomingMessage, res: ServerResponse): string => `'nonce-${(res as Response).locals.nonce}'`;
    const scriptSrc = [
        nonce,
        "'strict-dynamic'",
        'https://www.google-analytics.com',
        'https://ssl.google-analytics.com',
        'https://www.googletagmanager.com',
    ];
    const styleSrc = ["'self'"];

    // if (process.env.NODE_ENV !== 'production') {
    scriptSrc.push("'unsafe-eval'");
    scriptSrc.push("'unsafe-inline'");
    styleSrc.push("'unsafe-inline'");
    // }

    server.use(
        helmet({
            frameguard: {
                action: 'deny',
            },
            noSniff: true,
            contentSecurityPolicy:
                process.env.NODE_ENV === 'production'
                    ? {
                          directives: {
                              objectSrc: ["'none'"],
                              frameAncestors: ["'none'"],
                              scriptSrc,
                              baseUri: ["'none'"],
                              styleSrc,
                              imgSrc: ["'self'", 'data:', 'https:'],
                              defaultSrc: ["'self'"],
                              connectSrc: ["'self'", 'https://www.google-analytics.com'],
                              upgradeInsecureRequests: [],
                          },
                      }
                    : false,
            hsts: {
                includeSubDomains: true,
                preload: true,
                maxAge: 31536000,
            },
            referrerPolicy: {
                policy: 'same-origin',
            },
        }),
    );

    server.use(nocache());
};
