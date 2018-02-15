import { AttributeType } from './types'


export interface VerificationStorage {
  storeCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<any>

  validateCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<boolean>
  
  deleteCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<any>
}

export class RedisVerificationStorage implements VerificationStorage {
  private codeLongevityMs

  constructor(
    private redisClient,
    {codeLongevityMs} : {codeLongevityMs : number}
  ) {
    this.codeLongevityMs = codeLongevityMs
  }

  async storeCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<void> {
    const expires : number = new Date().getTime() + this.codeLongevityMs
    const key = this.keyFromParams(params)

    // PX is expiry time in milliseconds
    await this.redisClient.setAsync(key, params.code, 'PX', expires.toString())
  }

  async validateCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<boolean> {
    const key = this.keyFromParams(params)
    const storedCode = await this.redisClient.getAsync(key)
    return params.code === storedCode
  }

  async deleteCode(params : {
    identity : string,
    attrType : AttributeType,
    value : string,
    code : string
  }) : Promise<any> {
    const key = this.keyFromParams(params)
    await this.redisClient.delAsync(key)
  }

  keyFromParams(params : {
    identity : string,
    attrType : AttributeType,
    value : string
  }) : string {
    const {identity, attrType, value} = params
    return `jolo-ver-code:${identity}:${attrType}:${value}`
  }
}
