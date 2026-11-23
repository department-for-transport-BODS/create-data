import { NextApiResponse } from 'next';
import {
    EXPORT_METADATA_BUCKET_NAME,
    MATCHING_DATA_BUCKET_NAME,
    NETEX_BUCKET_NAME,
    UNVALIDATED_NETEX_BUCKET_NAME,
} from '../../constants';
import { getAndValidateNoc, redirectTo, redirectToError } from '../../utils/apiUtils';
import { deleteExport, deleteFromS3 } from '../../data/s3';
import { NextApiRequestWithSession } from '../../interfaces';
import logger from '../../utils/logger';

export default async (req: NextApiRequestWithSession, res: NextApiResponse): Promise<void> => {
    try {
        const noc = getAndValidateNoc(req, res);

        const { exportName } = req.body;

        logger.info('', {
            context: 'deleteExport.ts',
            message: `Deleting export for ${exportName}`,
        });

        await deleteExport(noc, exportName, MATCHING_DATA_BUCKET_NAME);
        await deleteExport(noc, exportName, NETEX_BUCKET_NAME);
        await deleteExport(noc, exportName, UNVALIDATED_NETEX_BUCKET_NAME);
        await deleteFromS3(`${noc}/exports/${exportName}.json`, EXPORT_METADATA_BUCKET_NAME);

        redirectTo(res, '/products/exports');
    } catch (error) {
        const message = 'There was a problem deleting the export:';
        redirectToError(res, message, 'api.deleteExport', error);
    }
};
