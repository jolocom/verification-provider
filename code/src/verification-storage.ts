import { AttributeType } from './types'


export interface VerificationStorage {
  storeCode(params : {
    userID : string, attrType : AttributeType,
    value : string, code : string
  }) : Promise<any>

  validateCode(params : {
    userID : string, attrType : AttributeType,
    value : string, code : string
  }) : Promise<boolean>
  
  deleteCode(params : {
    userID : string, attrType : AttributeType,
    value : string, code : string
  }) : Promise<any>
}

export class MemoryVerificationStorage implements VerificationStorage {
  private codes : any = {}

  async storeCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<any> {
    this.codes[this._combinedKey(params)] = params.code
  }

  async validateCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<boolean> {
    const validCode = this.codes[this._combinedKey(params)]
    return params.code === validCode
  }

  async deleteCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<any> {
    delete this.codes[this._combinedKey(params)]
  }

  private _combinedKey(params : {userID : string, attrType : AttributeType, value : string}) {
    return params.userID + '_' + params.attrType + '_' + params.value
  }
}

export class RedisVerificationStorage implements VerificationStorage {
  private codeLongevityMs

  constructor(private redisClient, {codeLongevityMs} : {codeLongevityMs : number}) {
    this.codeLongevityMs = codeLongevityMs
  }

  async storeCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<any> {
    const expires : number = (new Date().getTime() + this.codeLongevityMs)
    const key = this.keyFromParams(params)
    
    // PX is expiry time in miliseconds
    await this.redisClient.setAsync(key, params.code, 'PX', expires.toString())
  }

  async validateCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<boolean> {
    const key = this.keyFromParams(params)
    const storedCode = await this.redisClient.getAsync(key)
    return params.code === storedCode
  }

  async deleteCode(params : {
    userID : string, attrType : AttributeType, value : string, code : string
  }) : Promise<any> {
    const key = this.keyFromParams(params)
    await this.redisClient.delAsync(key)
  }

  keyFromParams(params : {
    userID : string, attrType : AttributeType, value : string
  }) {
    return [
      'jolocom-verification-codes',
      params.userID,
      params.attrType,
      params.value
    ].join(':')
  }
}
