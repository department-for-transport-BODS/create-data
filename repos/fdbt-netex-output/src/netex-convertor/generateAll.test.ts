import fs from 'fs';
import { Operator } from '../types';
import { buildNocList } from './handler';
import netexGenerator from './netexGenerator';
import libxslt from 'libxslt';
import * as db from '../data/auroradb';
import { allOperatorData } from './test-data/operatorData';

const xsl = `
    <xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
        <xsl:output omit-xml-declaration="yes" indent="yes"/>
        <xsl:strip-space elements="*"/>

        <xsl:template match="node()|@*">
            <xsl:copy>
                <xsl:apply-templates select="node()|@*"/>
            </xsl:copy>
        </xsl:template>

        <xsl:template match="@id">
            <xsl:attribute name="id">
                <xsl:value-of select="translate(., ' ', '_')"/>
            </xsl:attribute>
        </xsl:template>

        <xsl:template match="@ref">
            <xsl:attribute name="ref">
                <xsl:value-of select="translate(., ' ', '_')"/>
            </xsl:attribute>
        </xsl:template>

        <xsl:template match="*[not(@*|*|comment()|processing-instruction()) and normalize-space()='']"/>
    </xsl:stylesheet>
`;

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
        const parsedXsl = libxslt.parse(xsl);
        const transformedNetex = parsedXsl.apply(generatedNetex);

        const xmlFileName = `${fileName.split('.')[0]}.xml`;
        await fs.promises.writeFile(`${generatedNetexPath}${xmlFileName}`, transformedNetex);

        const file1 = await fs.promises.readFile(`../../fdbt-dev/data/generatedNetex/${xmlFileName}`, 'utf-8');
        const file2 = await fs.promises.readFile(`../../fdbt-dev/data/netexData/${xmlFileName}`, 'utf-8');
        expect(file1).toEqual(file2);
    });
});
