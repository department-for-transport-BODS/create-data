import React from 'react';
import { NextPageContextWithSession } from '../interfaces';

export const getServerSideProps = (ctx: NextPageContextWithSession): { props: object } => {
    const { res } = ctx;

    if (res) {
        res.setHeader('Content-Type', 'text/plain');

        // only allow robots in prod
        if (process.env.STAGE === 'prod') {
            // disallow nothing means allow all
            res.write(`User-agent: *\nDisallow:`);
        } else {
            // disallow / means disallow all
            res.write(`User-agent: *\nDisallow: /`);
        }

        res.end();
    }
    return {
        props: {},
    };
};

const Robots: React.FC = () => null;

export default Robots;
