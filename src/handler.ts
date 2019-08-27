import { error, log } from "@therockstorm/utils"
import "source-map-support/register"
import uuid from "uuid"
import { del, getByAccountId, getByTransactionId, put, update } from "./ddb"

export const handle = async (evt: any): Promise<Res> => {
  log(JSON.stringify(evt))

  log(await execCmd(evt))

  return { statusCode: 200, body: JSON.stringify(evt) }
}

const execCmd = async (evt: any): Promise<any> => {
  const partnerId = uuid()
  const transactionId = uuid()
  const created = new Date().toISOString()

  try {
    switch (evt.cmd) {
      case "putPartner":
        return await put({
          accountId: partnerId,
          created,
          partnerId,
          transactionId
        })
      case "putCustomer":
        return await put({
          accountId: uuid(),
          created,
          partnerId,
          transactionId
        })
      case "getByAccountId":
        return await getByAccountId({
          accountId: evt.accountId,
          partnerId: evt.partnerId
        })
      case "getByTransactionId":
        return await getByTransactionId(evt.transactionId)
      case "update":
        return await update({
          columnName: "testing",
          columnValue: "123",
          transactionId: evt.transactionId
        })
      case "del":
        return await del(evt.transactionId)
    }
  } catch (e) {
    error(e)
    return
  }
}
