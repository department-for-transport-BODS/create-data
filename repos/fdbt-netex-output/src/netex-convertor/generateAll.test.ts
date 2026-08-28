import fs from 'fs';
import { Operator } from '../types';
import { buildNocList } from './handler';
import netexGenerator from './netexGenerator';
import { normaliseNetex } from './normaliseNetex';
import * as db from '../data/auroradb';
import { allOperatorData } from './test-data/operatorData';

describe('generateAll', () => {
    jest.spyOn(global.Date, 'now').mockImplementation(() => 1625753009685);

    process.env.SNS_ALERTS_ARN = 'arn:aws:sns:us-east-1:000000000000:AlertsTopic';
    process.env.STAGE = 'dev';

    const dataPath = '../../fdbt-dev/data';
    const generatedNetexPath = `${dataPath}/generatedNetex/`;
    const matchingDataPath = `${dataPath}/matchingData/`;

    beforeAll(() => {
        if (!fs.existsSync(generatedNetexPath)) {
            fs.mkdirSync(generatedNetexPath);
        }

        jest.spyOn(db, 'getOperatorDetailsByNoc').mockResolvedValue(undefined);
    });

    const fileNames: string[] = fs.readdirSync(matchingDataPath);

    it.each(fileNames)('should generate identical xml for %s', async fileName => {
        // noc of logged in user
        let baseNoc = '';

        const ticket = JSON.parse(await fs.promises.readFile(`${matchingDataPath}${fileName}`, 'utf-8'));

        if ('nocCode' in ticket) {
            baseNoc = ticket.nocCode;
        }

        const nocs: string[] = buildNocList(ticket);

        if (baseNoc) {
            nocs.push(baseNoc);
        }

        const operatorData: Operator[] = [];
        nocs.forEach(noc => {
            const findOperatorByNoc = allOperatorData.find(operator => operator.nocCode === noc);
            if (findOperatorByNoc) {
                operatorData.push(findOperatorByNoc);
            }
        });

        const netexGen = await netexGenerator(ticket, operatorData);
        const generatedNetex = await netexGen.generate();
        const transformedNetex = normaliseNetex(generatedNetex);

        const xmlFileName = `${fileName.split('.')[0]}.xml`;
        await fs.promises.writeFile(`${generatedNetexPath}${xmlFileName}`, transformedNetex);

        const generatedFile = await fs.promises.readFile(`../../fdbt-dev/data/generatedNetex/${xmlFileName}`, 'utf-8');
        const fixtureFile = await fs.promises.readFile(`../../fdbt-dev/data/netexData/${xmlFileName}`, 'utf-8');
        expect(generatedFile).toEqual(normaliseNetex(fixtureFile));
    });
});
