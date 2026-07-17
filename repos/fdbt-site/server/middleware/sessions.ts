import { Express } from 'express';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { OPERATOR_ATTRIBUTE } from '../../src/constants/attributes';
import { OperatorAttribute } from '../../src/interfaces';
import { getSsmValue } from '../../src/data/ssm';

declare module 'express-session' {
    interface SessionData {
        [OPERATOR_ATTRIBUTE]: OperatorAttribute;
    }
}

const getOptions = async () => {
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
            user: await getSsmValue('fdbt-rds-site-username'),
            password: await getSsmValue('fdbt-rds-site-password'),
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

export default async (server: Express): Promise<void> => {
    const Store = MySQLStore(session);

    const options = await getOptions();

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
