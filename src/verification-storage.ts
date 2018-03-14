import { AttributeType } from './types'

export interface VerificationStorage {
  retrieveCode(params : {
    identity : string,
    attrType : AttributeType
  }) : Promise<any>

  storeCode(params : {
    identity : string,
    value: string,
    attrType : AttributeType,
    code : string
  }) : Promise<any>

  validateCode(params : {
    identity : string,
    attrType : AttributeType,
    code : string
  }) : Promise<boolean>

  deleteCode(params : {
    identity : string,
    attrType : AttributeType,
  }) : Promise<any>
}

export class RedisVerificationStorage implements VerificationStorage {
  constructor(
    private redisClient,
    private codeLongevityMs : number
  ) {

  }

  async retrieveCode(params : {
    identity: string,
    attrType: AttributeType
  }) : Promise<any> {
    const key = this.keyFromParams(params)
    return await this.redisClient.getAsync(key)
  }

  async storeCode(params : {
    identity : string,
    value : string,
    attrType : AttributeType,
    code : string
  }) : Promise<void> {
    const expires : number = new Date().getTime() + this.codeLongevityMs
    const key = this.keyFromParams(params)
    const {code, value} = params

    const record = JSON.stringify({code, value})
    await this.redisClient.setAsync(
      key, 
      record,
      'PX',
      expires.toString()
    )
    console.log(`Code for ${key} stored: ${code}.`)
  }

  async validateCode(params : {
    identity : string,
    attrType : AttributeType,
    code : string
  }) : Promise<boolean> {
    const key = this.keyFromParams(params)
    const record = JSON.parse(await this.redisClient.getAsync(key))

    if (!record) {
      console.log(`Code for ${key} could not be retrieved.`)
      return false
    }
    console.log(`Code for ${key} retrieved: ${record.code}.`)

    return params.code === record.code
  }

  async deleteCode(params : {
    identity : string,
    attrType : AttributeType,
  }) : Promise<any> {
    const key = this.keyFromParams(params)
    await this.redisClient.delAsync(key)
  }

  keyFromParams(params : {
    identity : string,
    attrType : AttributeType
  }) : string {
    const {identity, attrType} = params
    return `jolo-ver-code:${identity}:${attrType}`
  }
}
