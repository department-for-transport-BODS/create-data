import {
    AdminGetUserCommand,
    AdminGetUserCommandInput,
    AdminInitiateAuthCommand,
    AdminInitiateAuthCommandInput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommand,
    AdminRespondToAuthChallengeCommandInput,
    AdminSetUserPasswordCommand,
    AdminSetUserPasswordCommandInput,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommandInput,
    AdminUserGlobalSignOutCommand,
    AdminUserGlobalSignOutCommandInput,
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
    ConfirmForgotPasswordCommandInput,
    ForgotPasswordCommand,
    ForgotPasswordCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import crypto from 'crypto';
import logger from '../utils/logger';
import { getSsmValue } from './ssm';

const clientId = process.env.FDBT_USER_POOL_CLIENT_ID as string;
const userPoolId = process.env.FDBT_USER_POOL_ID as string;
let clientSecret: string | undefined;

const getCognitoClient = (): CognitoIdentityProviderClient =>
    new CognitoIdentityProviderClient({ region: 'eu-west-2' });

const cognito = getCognitoClient();

const calculateSecretHash = async (username: string): Promise<string> => {
    if (!clientSecret) {
        clientSecret = await getSsmValue('fdbt-cognito-client-secret');
    }

    return crypto
        .createHmac('SHA256', clientSecret)
        .update(username + clientId)
        .digest('base64');
};

export const initiateAuth = async (username: string, password: string): Promise<AdminInitiateAuthCommandOutput> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'initiating auth',
    });

    const params: AdminInitiateAuthCommandInput = {
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        ClientId: clientId,
        UserPoolId: userPoolId,
        AuthParameters: {
            USERNAME: username,
            PASSWORD: password,
            SECRET_HASH: await calculateSecretHash(username),
        },
    };

    try {
        const response = await cognito.send(new AdminInitiateAuthCommand(params));

        return response;
    } catch (error) {
        throw new Error(`Failed to authenticate user: ${error.stack}`);
    }
};

export const initiateRefreshAuth = async (
    username: string,
    refreshToken: string,
): Promise<AdminInitiateAuthCommandOutput> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'initiating refresh auth',
    });

    const params: AdminInitiateAuthCommandInput = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: clientId,
        UserPoolId: userPoolId,
        AuthParameters: {
            REFRESH_TOKEN: refreshToken,
            SECRET_HASH: await calculateSecretHash(username),
        },
    };

    try {
        const response = await cognito.send(new AdminInitiateAuthCommand(params));

        return response;
    } catch (error) {
        throw new Error(`Failed to refresh user session: ${error.stack}`);
    }
};

export const respondToNewPasswordChallenge = async (
    username: string,
    password: string,
    session: string,
): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'new password challenge initiated',
    });

    const params: AdminRespondToAuthChallengeCommandInput = {
        ChallengeName: 'NEW_PASSWORD_REQUIRED',
        ClientId: clientId,
        UserPoolId: userPoolId,
        ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: password,
            SECRET_HASH: await calculateSecretHash(username),
        },
        Session: session,
    };

    try {
        await cognito.send(new AdminRespondToAuthChallengeCommand(params));
    } catch (error) {
        throw new Error(`Failed to respond to password challenge: ${error.stack}`);
    }
};

export const globalSignOut = async (username: string): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'performing global sign out',
    });

    const params: AdminUserGlobalSignOutCommandInput = {
        Username: username,
        UserPoolId: userPoolId,
    };

    try {
        await cognito.send(new AdminUserGlobalSignOutCommand(params));
    } catch (error) {
        throw new Error(`Failed to perform global sign out: ${error.stack}`);
    }
};

export const updateUserAttributes = async (
    username: string,
    attributes: { Name: string; Value: string }[],
): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'updating user attributes',
    });

    const params: AdminUpdateUserAttributesCommandInput = {
        UserAttributes: attributes,
        UserPoolId: userPoolId,
        Username: username,
    };

    try {
        await cognito.send(new AdminUpdateUserAttributesCommand(params));
    } catch (error) {
        throw new Error(`Failed to update user attributes: ${error.stack}`);
    }
};

export const forgotPassword = async (username: string): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'start forgot password',
    });

    const params: ForgotPasswordCommandInput = {
        ClientId: clientId,
        Username: username,
        SecretHash: await calculateSecretHash(username),
    };

    try {
        await cognito.send(new ForgotPasswordCommand(params));
    } catch (error) {
        throw new Error(`Failed to perform forgot password request: ${error.stack}`);
    }
};

export const confirmForgotPassword = async (
    username: string,
    confirmationCode: string,
    password: string,
): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'confirm forgot password',
    });

    const params: ConfirmForgotPasswordCommandInput = {
        ClientId: clientId,
        Username: username,
        ConfirmationCode: confirmationCode,
        Password: password,
        SecretHash: await calculateSecretHash(username),
    };

    try {
        await cognito.send(new ConfirmForgotPasswordCommand(params));
    } catch (error) {
        if (error?.name === 'ExpiredCodeException') {
            throw new Error('ExpiredCodeException');
        }
        throw new Error(`Failed to confirm forgotten password: ${error.stack}`);
    }
};

export const updateUserPassword = async (newPassword: string, username: string): Promise<void> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'updating user password',
    });

    const params: AdminSetUserPasswordCommandInput = {
        Password: newPassword,
        Permanent: true,
        Username: username,
        UserPoolId: userPoolId,
    };

    try {
        await cognito.send(new AdminSetUserPasswordCommand(params));
    } catch (error) {
        throw new Error(`Failed to update user password: ${error.stack}`);
    }
};

export const getUserAttribute = async (username: string, attribute: string): Promise<string | null> => {
    logger.info('', {
        context: 'data.cognito',
        message: 'retrieving user attribute',
    });

    const params: AdminGetUserCommandInput = {
        UserPoolId: userPoolId,
        Username: username,
    };

    try {
        const response = await cognito.send(new AdminGetUserCommand(params));

        const userAttributes = response.UserAttributes;

        const filteredAttribute = userAttributes?.find((attr) => attr.Name === attribute);

        return filteredAttribute?.Value ?? null;
    } catch (error) {
        throw new Error(`Failed to get user attribute (${attribute}): ${error.stack}`);
    }
};
