# dynamodb-poc

Proof-of-concept for transaction-read-model using DynamoDB. Interesting files:

- `serverless.yml` configures permissions for the table and contains the CloudFormation for the table and the Global Secondary Index (GSI). Note that only keys are included. Other columns can be added at will when putting/updating items.
- `src/handler.ts` allows you to invoke the Lambda function with various commands and logs the results.
- `src/ddb.ts` calls DynamoDb via the simpler to use `DocumentClient`. See comments in file for more information.

To get a count of records by `accountId`, we could either

1. Store a separate value in the table with the primary key of `accountId` and update it after a successful `put`
1. Enable Dynamo Streams with a Lambda handler that incremented a count value. This is more complex, but keeps the write path fast and opens us up to possibly expanding this to handle Trends data calculations out-of-band too

## Setup

- Clone the repository and run `npm install`
- Ensure your [AWS credentials are available](https://serverless.com/framework/docs/providers/aws/guide/credentials/)
- Deploy with `ENVIRONMENT=your-env DEPLOYMENT_BUCKET=your-bucket npm run deploy`

## Developing

- Run tests, `npm test`
- Invoke locally, `npm run invoke`
