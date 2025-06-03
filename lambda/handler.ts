import { Context } from 'aws-lambda';

export const handler = async (event: any, context: Context): Promise<any> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context ID:', context.awsRequestId);
  
  const bucketName = process.env.BUCKET_NAME;
  console.log('Target S3 Bucket Name:', bucketName);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
      receivedEvent: event,
      bucketName: bucketName || 'Bucket name not set in environment variables.',
    }),
  };
};
