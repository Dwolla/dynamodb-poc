import { DocumentClient } from "aws-sdk/clients/dynamodb"

const ddb = new DocumentClient()
const table = `poc-table-${process.env.ENVIRONMENT}`
const CONDITION = "attribute_exists(transactionId)"

export const put = async (dto: Dto): Promise<Dto> => {
  // Concat accountId and partnerId for g1pk (GSI primary key), see explanation in getByAccountId
  await ddb
    .put({ Item: { ...dto, g1pk: toG1pk(dto) }, TableName: table })
    .promise()
  return dto
}

// Get a single transaction from primary table
export const getByTransactionId = async (
  transactionId: UUID
): Promise<Dto | undefined> =>
  (await ddb.get({ Key: { transactionId }, TableName: table }).promise())
    .Item as Dto

// Query the Global Secondary Index for a list of transactions, see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.html
export const getByAccountId = async ({
  accountId,
  partnerId
}: GetByAccountIdReq): Promise<Dto[]> =>
  (await ddb
    .query({
      // Optional, helps avoid collisions with reserved keywords
      ExpressionAttributeValues: { ":g1pk": toG1pk({ accountId, partnerId }) },
      // Our current MySQL solution ensures the partnerId has access to the accountId.
      // We can accomplish that in Dynamo by concatenating the accountId and partnerId
      // into one field. If the key doesn't exist, they must not have access to it.
      // We could also use `FilterExpression`, however, it's applied after the Query
      // operation, but before the data is returned to you. This increases costs and
      // can have unintended side-effects if you later add `Limit`
      IndexName: "gsi1",
      // Required to at least match against primary key, can also match against entire or partial sort key
      KeyConditionExpression: "g1pk=:g1pk",
      // Descending order
      ScanIndexForward: false,
      TableName: table
    })
    .promise()).Items as Dto[]

// Update/add an arbitrary column, see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html
export const update = async ({
  transactionId,
  columnName,
  columnValue
}: UpdateReq): Promise<Dto> =>
  (await ddb
    .update({
      // Optional, update will add item if it doesn't exist without it
      ConditionExpression: CONDITION,
      // Optional, helps avoid collisions with reserved keywords
      ExpressionAttributeNames: { "#columnName": columnName },
      // Optional, helps avoid collisions with reserved keywords
      ExpressionAttributeValues: { ":columnValue": columnValue },
      Key: { transactionId },
      // Optional
      ReturnValues: "ALL_NEW",
      TableName: table,
      // Multiple SETs can be separated by commas, `SET a=b, c=d`, can also use ADD, DELETE, REMOVE
      UpdateExpression: "SET #columnName=:columnValue"
    })
    .promise()).Attributes as Dto

export const del = async (transactionId: UUID): Promise<Dto> =>
  (await ddb
    .delete({
      // Optional, delete will return success if item doesn't exist without it
      ConditionExpression: CONDITION,
      Key: { transactionId },
      // Optional
      ReturnValues: "ALL_OLD",
      TableName: table
    })
    .promise()).Attributes as Dto

const toG1pk = ({ accountId, partnerId }: G1Pk) => `${accountId}#${partnerId}`
