type UUID = string

type Res = Readonly<{
  statusCode: number
  body: string
}>

type Dto = Readonly<{
  accountId: UUID
  created: string
  partnerId: UUID
  transactionId: UUID
}>

type GetByAccountIdReq = Readonly<{
  accountId: UUID
  partnerId: UUID
}>

type UpdateReq = Readonly<{
  transactionId: UUID
  columnName: string
  columnValue: string
}>

type G1Pk = Readonly<{
  accountId: UUID
  partnerId: UUID
}>
