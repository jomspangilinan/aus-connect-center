import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { getCodeAsset } from '../../../constant';
import {
  CustomResource, Duration, Environment, CustomResourceProvider,
  CustomResourceProviderRuntime,
} from 'aws-cdk-lib';

export interface AusconnectStackProps extends cdk.StackProps {
  instanceId: string;
  prefix: string;
  env: Required<Environment>;
  defaultLocale?: string;
  defaultTimeZone?: string;
}

export class AusconnectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AusconnectStackProps) {
    super(scope, id, props);
    const { instanceId, prefix, env } = props;

    const instanceArn = `arn:aws:connect:${env.region}:${env.account}:instance/${instanceId}`;

    const connectDatetimeFn = new Function(this, 'ConnectDateTime', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      functionName: `connectDateTime-${prefix}`,
      code: getCodeAsset('connectDateTime'),
      environment: {
        defaultLocale: 'en-AU',
        defaultTimeZone: 'Australia/Sydney',
      }
    });

    const associateLambdaFn = new Function(this, 'AssociateConnectCustomLambda', {
      runtime: Runtime.NODEJS_20_X,
      functionName: `connectAssociateLambda-${prefix}`,
      code: getCodeAsset('connectAssociateLambda'),
      handler: 'index.handler',
      timeout: Duration.minutes(1),
      initialPolicy: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['lambda:ListFunctions', 'lambda:AddPermission', 'lambda:RemovePermission'],
          resources: [connectDatetimeFn.functionArn],
        }),
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['connect:AssociateLambdaFunction', 'connect:DisassociateLambdaFunction'],
          resources: [instanceArn],
        }),
      ],
    });

    connectDatetimeFn.addPermission('AllowAmazonConnectInvoke', {
      principal: new ServicePrincipal('connect.amazonaws.com'),
      sourceArn: instanceArn,
    });

    new CustomResource(this, 'AssociateLambdaToConnectV2', {
      serviceToken: associateLambdaFn.functionArn,
      properties: {
        InstanceId: instanceId,
        FunctionArn: connectDatetimeFn.functionArn,
      },
    });

    new cdk.CfnOutput(this, 'ConnectDateTimeLambdaArn', {
      value: connectDatetimeFn.functionArn,
      description: 'The ARN of the ConnectDateTime Lambda function',
      exportName: `ConnectDateTimeLambdaArn-${this.stackName}`,
    });
  }
}
