import { Context } from 'aws-lambda';

export const handler = async (event: any, context: Context): Promise<any> => {

  const { awsRequestId } = context;

  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('EVENT_DETAILS:', JSON.stringify({
    awsRequestId: awsRequestId,
    eventReceived: event
  }, null, 2));
  
  const bucketName = process.env.BUCKET_NAME;
  const customlog = {
    requestId: awsRequestId,
    time: new Date().toISOString(),
    httpMethod: event.httpMethod,
    path: event.path,
    body: event.body,
    bucketName,
  };

  console.log("INCOMING_EVENT_LOG", JSON.stringify(customlog));

  let inputData: any = {};
  try {
    if (event.body && typeof event.body === 'string') {
      inputData = JSON.parse(event.body);
      console.log('INFO', 'Successfully parsed JSON body');
    }
    else if (event.body && typeof event.body === 'object') {
      inputData = event.body;
      console.log('INFO', 'Received pre-parsed object body');
    }
    else {
      // Handle cases where there's no body or the body isn't a string/object.
      console.log('INFO', 'No processable body found');
      inputData = {};
    }
  } catch (err: any) {
    console.log('ERROR', 'Failed to parse event body', {
      errorMessage: err.message,
      errorStack: err.stack,
      originalBody: event.body
    });
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invalid JSON body' }),
    };
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      message: 'POST okay',
      // receivedEvent: event,
      input: inputData,
      bucketName: bucketName || 'Bucket name not set in environment variables.',
    }),
  };
};
