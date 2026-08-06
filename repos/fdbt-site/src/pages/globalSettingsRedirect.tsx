import { FunctionComponent } from 'react';
import { GS_REFERER } from '../constants/attributes';
import { NextPageContextWithSession } from '../interfaces';
import { getSessionAttribute, updateSessionAttribute } from '../utils/sessions';
import { redirectTo } from '../utils/apiUtils';

const GlobalSettingsRedirect: FunctionComponent = () => null;

export const getServerSideProps = (ctx: NextPageContextWithSession): object => {
    const referer = getSessionAttribute(ctx.req, GS_REFERER);
    if (!referer || !ctx.res) {
        throw new Error('referer or context was not set');
    }

    updateSessionAttribute(ctx.req, GS_REFERER, undefined);

    redirectTo(ctx.res, `/${referer}`);

    return { props: {} };
};

export default GlobalSettingsRedirect;
