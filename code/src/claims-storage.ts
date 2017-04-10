import { AttributeType } from './types'

interface ClaimStoreReturnValue {
  claimID : string
}

export interface ClaimsStorage {
  verifyAttribute(params : {
    contractID : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue>
}

export class MemoryClaimsStorage implements ClaimsStorage {
  public claims = []

  async verifyAttribute(params : {
    contractID : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue> {
    this.claims.push(params)
    return {
      claimID: this.claims.length.toString()
    }
  }
}
