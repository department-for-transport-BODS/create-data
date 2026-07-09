import { Express } from 'express';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import awsParamStore from 'aws-param-store';
import { OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { OperatorAttribute } from '../../src/interfaces';

declare module 'express-session' {
    interface SessionData {
        [OPERATOR_ATTRIBUTE]: OperatorAttribute;
    }
}

const getOptions = () => {
    let options;

    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        options = {
            host: 'localhost',
            port: 3306,
            user: 'fdbt_site',
            password: 'password',
            database: 'fdbt',
            createDatabaseTable: false,
            charset: 'utf8mb4_bin',
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data',
                },
            },
        };
    } else {
        options = {
            host: process.env.RDS_HOST,
            port: 3306,
            user: awsParamStore.getParameterSync('fdbt-rds-site-username', { region: 'eu-west-2' }).Value,
            password: awsParamStore.getParameterSync('fdbt-rds-site-password', { region: 'eu-west-2' }).Value,
            database: 'fdbt',
            createDatabaseTable: false,
            charset: 'utf8mb4_bin',
            schema: {
                tableName: 'sessions',
                columnNames: {
                    session_id: 'session_id',
                    expires: 'expires',
                    data: 'data',
                },
            },
        };
    }

    return options;
};

export default (server: Express): void => {
    const Store = MySQLStore(session);

    const options = getOptions();

    const sessionStore = new Store(options);

    const sessionOptions: session.SessionOptions = {
        cookie: {
            sameSite: true,
            secure: process.env.NODE_ENV !== 'development',
            httpOnly: true,
        },
        saveUninitialized: false,
        resave: false,
        secret: process.env.SESSION_SECRET || 'secret',
        store: sessionStore,
    };

    server.use(session(sessionOptions));
};
