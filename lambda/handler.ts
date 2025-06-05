import { Context } from 'aws-lambda';

export const handler = async (event: any, context: Context): Promise<any> => {

  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('EVENT_DETAILS:', JSON.stringify({
    awsRequestId: context.awsRequestId,
    eventReceived: event
  }, null, 2));
  
  const bucketName = process.env.BUCKET_NAME;
  const customlog = {
    requestId: context.awsRequestId,
    time: new Date().toISOString(),
    httpMethod: event.httpMethod,
    path: event.path,
    body: event.body,
    bucketName,
  };

  console.log("INCOMING_EVENT_LOG", JSON.stringify(customlog));

  let inputData;
  try {
    inputData = event.body ? JSON.parse(event.body) : {};
    console.log('PARSED_INPUT_DATA:', JSON.stringify(inputData));
  } catch (err: any) {
    console.error('ERROR_PARSING_BODY:', JSON.stringify({
      awsRequestId: context.awsRequestId,
      message: 'Failed to parse event body',
      errorMessage: err.message,
      errorStack: err.stack,
      originalBody: event.body
    }));

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
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
