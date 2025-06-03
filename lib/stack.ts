import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

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
    });

    // Grant the Lambda function read/write permissions to the S3 bucket
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
  }
}
