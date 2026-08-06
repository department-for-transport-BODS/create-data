import NodeClam from 'clamscan';

export const containsViruses = async (pathToFileToScan: string): Promise<boolean> => {
    const ClamScan = new NodeClam().init({
        removeInfected: false,
        quarantineInfected: false,
        debugMode: true,
        scanRecursively: true,
        clamdscan: {
            timeout: 60000,
            localFallback: false,
            path: process.env.NODE_ENV === 'development' ? '/usr/local/bin/clamdscan' : '/usr/bin/clamdscan',
            multiscan: true,
            reloadDb: false,
            active: true,
            bypassTest: false,
        },
        preference: 'clamdscan',
    });

    const clamscan = await ClamScan;

    const { isInfected } = await clamscan.isInfected(pathToFileToScan);

    return isInfected === true;
};

export default containsViruses;
