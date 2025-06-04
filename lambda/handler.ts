import { Context } from 'aws-lambda';

export const handler = async (event: any, context: Context): Promise<any> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context ID:', context.awsRequestId);
  
  const bucketName = process.env.BUCKET_NAME;
  console.log('Target S3 Bucket Name:', bucketName);

  let inputData;
  try {
    inputData = event.body ? JSON.parse(event.body) : {};
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'POST okay',
      // receivedEvent: event,
      input: inputData,
      bucketName: bucketName || 'Bucket name not set in environment variables.',
    }),
  };
};
