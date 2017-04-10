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
