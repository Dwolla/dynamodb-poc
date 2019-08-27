const { serverless } = require("skripts/config")

module.exports = {
  ...serverless,
  functions: { func: { handler: "src/handler.handle" } },
  plugins: [...serverless.plugins, "serverless-pseudo-parameters"],
  provider: {
    ...serverless.provider,
    environment: {
      ...serverless.provider.environment,
      ENVIRONMENT: "${self:provider.stage}"
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:UpdateItem"
        ],
        Resource: [
          "arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/poc-table-${self:provider.stage}",
          "arn:aws:dynamodb:${self:provider.region}:#{AWS::AccountId}:table/poc-table-${self:provider.stage}/index/*"
        ]
      }
    ]
  },
  resources: {
    Resources: {
      PocTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          KeySchema: [{ AttributeName: "transactionId", KeyType: "HASH" }],
          AttributeDefinitions: [
            { AttributeName: "g1pk", AttributeType: "S" },
            { AttributeName: "created", AttributeType: "S" },
            { AttributeName: "transactionId", AttributeType: "S" }
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "gsi1",
              KeySchema: [
                { AttributeName: "g1pk", KeyType: "HASH" },
                { AttributeName: "created", KeyType: "RANGE" }
              ],
              Projection: { ProjectionType: "ALL" },
              ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
              }
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: "poc-table-${self:provider.stage}"
        },
        DeletionPolicy: "Retain"
      }
    }
  }
}
