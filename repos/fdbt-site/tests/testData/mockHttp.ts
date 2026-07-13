/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Lightweight, dependency-free replacements for the `mock-req`, `mock-req-res`
 * and `mock-res` test doubles (which relied on sinon). They provide just enough
 * of the Express/Node request and response surface used across the test suite.
 */

export const mockRequest = (options: { [key: string]: any } = {}): any => ({
    app: {},
    baseUrl: '',
    body: {},
    cookies: {},
    fresh: true,
    headers: {},
    hostname: '',
    ip: '127.0.0.1',
    ips: [],
    method: 'GET',
    originalUrl: '',
    params: {},
    path: '',
    protocol: 'https',
    query: {},
    route: {},
    secure: true,
    signedCookies: {},
    stale: false,
    subdomains: [],
    xhr: true,
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
    acceptsEncodings: jest.fn(),
    acceptsLanguages: jest.fn(),
    get: jest.fn(),
    is: jest.fn(),
    range: jest.fn(),
    ...options,
});

export class MockRes {
    statusCode = 200;

    private mockHeaders: { [key: string]: any } = {};

    writeHead = jest.fn();

    end = jest.fn();

    write = jest.fn();

    setHeader(name: string, value: any): void {
        this.mockHeaders[name.toLowerCase()] = value;
    }

    getHeader(name: string): any {
        return this.mockHeaders[name.toLowerCase()];
    }

    removeHeader(name: string): void {
        delete this.mockHeaders[name.toLowerCase()];
    }

    getHeaders(): { [key: string]: any } {
        return this.mockHeaders;
    }

    hasHeader(name: string): boolean {
        return name.toLowerCase() in this.mockHeaders;
    }
}
