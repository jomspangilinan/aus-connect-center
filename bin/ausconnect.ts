#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AusconnectStack } from '../dist/packages/infrastructure/lib';
import { ausconnectConfig } from './config';
const app = new cdk.App();
new AusconnectStack(app, 'ConnectAUSPOC', ausconnectConfig);