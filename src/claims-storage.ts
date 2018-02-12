import { AttributeType } from './types'

export interface ClaimsStorage {
  verifyAttribute({
    identity,
    attrType,
    attrId,
    value
  } : {
    identity : string,
    attrType : AttributeType,
    attrId : string,
    value : string
  }) : Promise<any>
}

export class MemoryClaimsStorage implements ClaimsStorage {
  public claims = []

  async verifyAttribute({
    identity,
    attrType,
    attrId,
    value
  } : {
    identity : string,
    attrType : AttributeType,
    attrId : string,
    value : string
  }) : Promise<any> {

    this.claims.push({identity, attrType, attrId, value})
  }
}
