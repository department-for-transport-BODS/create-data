import { TextEncoder, TextDecoder } from 'util';
import { setImmediate, clearImmediate } from 'timers';

// jsdom does not provide several Node globals that server-side dependencies rely on:
// - TextEncoder/TextDecoder are needed by aws-sdk v3 (@smithy/core).
// - setImmediate/clearImmediate are needed by winston (via readable-stream).
// Polyfill them from Node's built-in modules so server-side code runs under jsdom.
Object.assign(global, { TextEncoder, TextDecoder, setImmediate, clearImmediate });

process.env.SERVICE_EMAIL_ADDRESS = 'mock-service-address@email.co.uk';
process.env.SUPPORT_EMAIL_ADDRESS = 'bodshelpdesk@kainos.com';
process.env.SUPPORT_PHONE_NUMBER = '0800 000 000';
