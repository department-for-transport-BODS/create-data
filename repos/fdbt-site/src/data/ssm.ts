import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({ region: 'eu-west-2' });

export const getSsmValue = async (name: string): Promise<string> => {
    const response = await ssm.send(new GetParameterCommand({ Name: name, WithDecryption: true }));

    return response.Parameter?.Value ?? '';
};
