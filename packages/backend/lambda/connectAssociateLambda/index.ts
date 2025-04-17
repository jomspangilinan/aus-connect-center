import { send } from 'cfn-response-promise';
import {
    ConnectClient,
    AssociateLambdaFunctionCommand,
} from '@aws-sdk/client-connect';
import { CloudFormationCustomResourceEvent, Context } from 'aws-lambda';

export const handler = async (
    event: CloudFormationCustomResourceEvent,
    context: Context
): Promise<void> => {
    const { InstanceId, FunctionArn } = event.ResourceProperties;
    const client = new ConnectClient({});

    const physicalId = `connect-assoc-${FunctionArn.split(':').pop()}`;

    console.log(event);

    try {
        if (event.RequestType === 'Delete') {
            return send(event, context, 'SUCCESS', {}, physicalId);
        }

        await client.send(
            new AssociateLambdaFunctionCommand({ InstanceId, FunctionArn })
        );

        console.log('Lambda successfully associated with Amazon Connect.');
        return send(event, context, 'SUCCESS', {}, physicalId);
    } catch (err) {
        console.error('Association error:', err);
        return send(event, context, 'FAILED', {
            ErrorMessage: (err as Error).message || 'Unknown error occurred',
        }, physicalId);
    }
};
