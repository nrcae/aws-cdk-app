#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MySimpleCdkStack } from '../lib/stack';

const app = new cdk.App();
new MySimpleCdkStack(app, 'MySimpleCdkPipelineStack', {
  description: 'Simple CI/CD pipeline stack with S3 and Lambda using CDK and GitHub Actions',
});
