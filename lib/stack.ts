import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as logs from 'aws-cdk-lib/aws-logs'

export class MySimpleCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create an S3 bucket
    const myBucket = new s3.Bucket(this, 'MySimplePipelineBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Automatically delete bucket when stack is deleted (for dev/test)
      autoDeleteObjects: true, // Automatically delete objects in bucket when stack is deleted (for dev/test)
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Create a Lambda function from the handler.ts file
    const myLambda = new NodejsFunction(this, 'MySimplePipelineFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/handler.ts'),
      environment: {
        BUCKET_NAME: myBucket.bucketName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'],
      },
      timeout: cdk.Duration.seconds(10),
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    const api = new apigateway.RestApi(this, 'MySimpleApiGateway', {
      restApiName: 'MySimpleService',
      description: 'A simple API Gateway that triggers Lambda',
      deployOptions: {
        stageName: 'prod',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      }
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(myLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    });

    const trigger = api.root.addResource('trigger');
    trigger.addMethod('GET', lambdaIntegration);
    trigger.addMethod('POST', lambdaIntegration);

    myBucket.grantReadWrite(myLambda);

    // Output the bucket name and Lambda function ARN for easy access
    new cdk.CfnOutput(this, 'BucketNameOutput', {
      value: myBucket.bucketName,
      description: 'Name of the S3 bucket',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArnOutput', {
      value: myLambda.functionArn,
      description: 'ARN of the Lambda function',
    });

    new cdk.CfnOutput(this, 'ApiUrlOutput', {
      value: api.url,
      description: 'API Gateway base URL',
    });
  }
}
